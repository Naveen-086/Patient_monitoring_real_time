"""
kafka_consumer_predict.py
Consumes topic "vitals", predicts risk, stores results in memory
Exposes REST API (FastAPI) for frontend
"""

import os
import json
from collections import defaultdict, deque
from datetime import datetime, UTC
from typing import Dict, Deque
from pathlib import Path
import threading

from kafka import KafkaConsumer, KafkaProducer
from joblib import load
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from schemas import VitalEvent

# Kafka config
BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
IN_TOPIC = os.getenv("KAFKA_VITALS_TOPIC", "vitals")
OUT_TOPIC = os.getenv("KAFKA_ALERTS_TOPIC", "alerts")
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "patient-risk-predictor")

MODEL_PATH = Path(__file__).parent / "models" / "model.joblib"
FEATURES = ["heart_rate","systolic_bp","diastolic_bp","temperature_c","spo2","resp_rate","age"]
WINDOW = int(os.getenv("BASELINE_WINDOW", "20"))

# In-memory stores
patients: Dict[str, dict] = {}
alerts: list = []

def explain_anomaly(event: VitalEvent) -> str:
    reasons = []
    if event.heart_rate < 50 or event.heart_rate > 110:
        reasons.append("heart_rate")
    if event.systolic_bp < 90 or event.systolic_bp > 170:
        reasons.append("systolic_bp")
    if event.diastolic_bp < 50 or event.diastolic_bp > 110:
        reasons.append("diastolic_bp")
    if event.temperature_c > 38.3:
        reasons.append("fever")
    if event.spo2 < 92:
        reasons.append("low_spo2")
    if event.resp_rate < 10 or event.resp_rate > 24:
        reasons.append("resp_rate")
    return ",".join(reasons) or "model_high_risk"

def consumer_loop():
    """Kafka consumer loop running in background"""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}. Run train_model.py first.")

    model = load(MODEL_PATH)

    consumer = KafkaConsumer(
        IN_TOPIC,
        bootstrap_servers=BOOTSTRAP,
        group_id=GROUP_ID,
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        enable_auto_commit=True,
        auto_offset_reset="latest",
    )

    producer = KafkaProducer(
        bootstrap_servers=BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        acks="all",
        linger_ms=50,
    )

    baselines: Dict[str, Dict[str, Deque[float]]] = defaultdict(lambda: {f: deque(maxlen=WINDOW) for f in FEATURES})

    print(f"Consuming from '{IN_TOPIC}', producing alerts to '{OUT_TOPIC}' using model at {MODEL_PATH}")
    for msg in consumer:
        try:
            event = VitalEvent(**msg.value)
        except Exception as e:
            print("Skipping invalid message:", e, msg.value)
            continue

        # update baselines
        for f in FEATURES:
            baselines[event.patient_id][f].append(float(getattr(event, f)))

        # build feature vector
        x = np.array([[getattr(event, f) for f in FEATURES]])
        pred = int(model.predict(x)[0])
        proba = float(model.predict_proba(x)[0][1]) if hasattr(model, "predict_proba") else 0.0

        risk_reason = explain_anomaly(event)

        alert = {
            "id": f"{event.patient_id}-{event.ts}",
            "patient_id": event.patient_id,
            "ts": datetime.now(UTC).isoformat(),
            "risk": "HIGH" if pred == 1 else "LOW",
            "risk_score": round(proba * 100, 2),
            "reason": risk_reason,
            "vitals": {f: getattr(event, f) for f in FEATURES},
        }

        # update patient store
        patients[event.patient_id] = {
            "id": event.patient_id,
            "age": event.age,
            "lastUpdated": datetime.now(UTC).isoformat(),
            "status": "critical" if pred == 1 else "stable",
            "riskScore": alert["risk_score"],
            "vitals": alert["vitals"],
        }

        if pred == 1 or risk_reason != "model_high_risk":
            alerts.append(alert)
            producer.send(OUT_TOPIC, alert)
            print("<- ALERT", alert)
        else:
            print("ok", event.patient_id, event.ts)

# -------------------------
# FastAPI REST API
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend can connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/patients")
def get_patients():
    return list(patients.values())

@app.get("/alerts")
def get_alerts():
    return alerts[-50:]  # last 50 alerts

@app.post("/patients")
async def update_patient(patient: dict):
    """Manually add/update a patient (from external POST)."""
    patients[patient["id"]] = patient
    return {"status": "ok", "patient_id": patient["id"]}

@app.post("/alerts")
async def add_alert(alert: dict):
    """Manually push a new alert (from external POST)."""
    alerts.append(alert)
    return {"status": "ok", "alert_id": alert.get("id")}

# -------------------------
# Run both Kafka + API
# -------------------------
def start():
    t = threading.Thread(target=consumer_loop, daemon=True)
    t.start()
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    start()

"""
kafka_producer.py
- Streams synthetic patient vital events to Kafka topic "vitals"
- Configure by environment variables or defaults
"""
import os
import json
import time
import random
from datetime import datetime, timezone
from typing import List
from kafka import KafkaProducer

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC = os.getenv("KAFKA_VITALS_TOPIC", "vitals")
SLEEP_SEC = float(os.getenv("PRODUCER_SLEEP", "0.5"))
PATIENTS = int(os.getenv("NUM_PATIENTS", "50"))

def gen_patient_ids(n: int) -> List[str]:
    return [f"P{1000+i}" for i in range(n)]

def sample_vitals(pid: str):
    # mostly normal vitals with occasional abnormalities
    base = {
        "heart_rate": random.gauss(78, 10),
        "systolic_bp": random.gauss(122, 14),
        "diastolic_bp": random.gauss(78, 9),
        "temperature_c": random.gauss(36.8, 0.3),
        "spo2": max(85.0, min(100.0, random.gauss(97.5, 1))),
        "resp_rate": random.gauss(16, 2.5),
        "age": int(max(0, min(95, random.gauss(55, 18)))),
        "sex": random.choice(["M","F","O"])
    }
    # inject anomaly 5% of the time
    if random.random() < 0.05:
        choice = random.choice(["hr_high","bp_low","fever","hypoxia","tachypnea"])
        if choice == "hr_high":
            base["heart_rate"] = random.uniform(130, 180)
        elif choice == "bp_low":
            base["systolic_bp"] = random.uniform(70, 88)
            base["diastolic_bp"] = random.uniform(40, 58)
        elif choice == "fever":
            base["temperature_c"] = random.uniform(38.5, 40.0)
        elif choice == "hypoxia":
            base["spo2"] = random.uniform(85, 90)
        elif choice == "tachypnea":
            base["resp_rate"] = random.uniform(26, 40)

    event = {
        "patient_id": pid,
        "ts": datetime.now(timezone.utc).isoformat(),
        **base,
    }
    return event

def main():
    producer = KafkaProducer(
        bootstrap_servers=BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        linger_ms=50,
        acks="all",
        retries=5,
    )
    pids = gen_patient_ids(PATIENTS)
    print(f"Producing to topic '{TOPIC}' at {BOOTSTRAP} for {len(pids)} patients...")
    try:
        while True:
            pid = random.choice(pids)
            event = sample_vitals(pid)
            producer.send(TOPIC, event)
            print("->", event)
            time.sleep(SLEEP_SEC)
    except KeyboardInterrupt:
        print("Stopping producer.")
    finally:
        producer.flush()
        producer.close()

if __name__ == "__main__":
    main()

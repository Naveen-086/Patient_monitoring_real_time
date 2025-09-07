"""
train_model.py
- Creates a synthetic dataset for patient risk (binary) from vitals
- Trains a pipeline: StandardScaler + RandomForestClassifier
- Saves to backend/models/model.joblib
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from joblib import dump
from pathlib import Path
import json
import random

RND = 42
np.random.seed(RND)
random.seed(RND)

FEATURES = ["heart_rate","systolic_bp","diastolic_bp","temperature_c","spo2","resp_rate","age"]
MODEL_PATH = Path(__file__).parent / "models" / "model.joblib"
META_PATH = Path(__file__).parent / "models" / "model_meta.json"

def synthesize(n: int = 20000) -> pd.DataFrame:
    # Base distributions
    age = np.clip(np.random.normal(55, 18, n), 0, 95)
    sex = np.random.choice(["M","F","O"], size=n, p=[0.49,0.49,0.02])

    heart_rate = np.random.normal(78, 12, n)
    systolic_bp = np.random.normal(122, 15, n)
    diastolic_bp = np.random.normal(78, 10, n)
    temperature_c = np.random.normal(36.8, 0.4, n)
    spo2 = np.clip(np.random.normal(97, 1.5, n), 85, 100)
    resp_rate = np.random.normal(16, 3, n)

    df = pd.DataFrame({
        "age": age.astype(int),
        "sex": sex,
        "heart_rate": heart_rate,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "temperature_c": temperature_c,
        "spo2": spo2,
        "resp_rate": resp_rate,
    })

    # Create risk using rule-of-thumb heuristics + noise
    risk_score = (
        (df.heart_rate < 50) | (df.heart_rate > 110)
        | (df.systolic_bp < 90) | (df.systolic_bp > 170)
        | (df.diastolic_bp < 50) | (df.diastolic_bp > 110)
        | (df.temperature_c > 38.3)
        | (df.spo2 < 92)
        | (df.resp_rate < 10) | (df.resp_rate > 24)
    ).astype(int)

    # Add age-related factor
    risk_score = np.where(df.age > 75, np.maximum(risk_score, np.random.binomial(1, 0.2, n)), risk_score)

    # Add some noise to avoid a perfect rule fit
    flip = np.random.binomial(1, 0.05, n)
    y = np.where(flip == 1, 1 - risk_score, risk_score)

    df["label"] = y
    return df

def train(df: pd.DataFrame):
    X = df[FEATURES].copy()
    y = df["label"].astype(int)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(n_estimators=200, random_state=RND, class_weight="balanced"))
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RND, stratify=y)
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    report = classification_report(y_test, y_pred, output_dict=True)
    return pipe, report

def main():
    df = synthesize()
    model, report = train(df)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    dump(model, MODEL_PATH)
    META_PATH.write_text(json.dumps({"features": FEATURES, "report": report}, indent=2))
    print("Model saved to", MODEL_PATH)
    print("Metrics:", json.dumps(report, indent=2))

if __name__ == "__main__":
    main()

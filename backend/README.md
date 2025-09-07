# Backend: Real-time Patient Monitoring (Kafka + ML)

This backend adds **Kafka streaming** and **Python-based machine learning** to your existing React dashboard.

## What’s included
- `train_model.py` — trains a RandomForest on synthetic vitals and saves the model.
- `kafka_producer.py` — streams synthetic patient vitals to Kafka topic `vitals`.
- `kafka_consumer_predict.py` — consumes `vitals`, predicts risk, and publishes alerts to `alerts`.
- `schemas.py` — pydantic model to validate incoming events.
- `models/` — saved `model.joblib` and metadata.

## Quickstart

### 0) Start Kafka
If you don't have Kafka running, the easiest route is Docker. Here's a **docker-compose.yml** (KRaft mode):

```yaml
services:
  kafka:
    image: bitnami/kafka:3.7
    container_name: kafka
    environment:
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=broker,controller
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER
      - ALLOW_PLAINTEXT_LISTENER=yes
    ports:
      - "9092:9092"
```

Save as `docker-compose.yml` and run:
```bash
docker compose up -d
```

### 1) Create & activate a Python environment
```bash
cd project/backend
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Train the ML model (once)
```bash
python train_model.py
```

### 3) Start the predictor (consumer)
```bash
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
python kafka_consumer_predict.py
```

### 4) Start the vitals producer (in another terminal)
```bash
export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
python kafka_producer.py
```

You should see alerts being printed by the consumer. Alerts are also produced to Kafka topic `alerts`.

## Config (env vars)

- `KAFKA_BOOTSTRAP_SERVERS` (default `localhost:9092`)
- `KAFKA_VITALS_TOPIC` (default `vitals`)
- `KAFKA_ALERTS_TOPIC` (default `alerts`)
- `KAFKA_GROUP_ID` (default `patient-risk-predictor`)
- `NUM_PATIENTS` (default `50`)
- `PRODUCER_SLEEP` (seconds between messages, default `0.5`)
- `BASELINE_WINDOW` (moving baseline length, default `20`)

## Integrating with your React app
Your dashboard can subscribe to the `alerts` stream via a small Node/Express service or WebSocket bridge that reads Kafka and forwards to the browser. If you want, I can add that next.

## Notes
- Model is trained on **synthetic data** with clinical heuristics for demonstration; replace with real labeled data for production.
- `kafka-python` is used to avoid native `librdkafka` dependency.
- All scripts have sane defaults and informative logs.

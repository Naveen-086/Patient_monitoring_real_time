// WebSocket + Kafka bridge
const { Kafka } = require("kafkajs");
const WebSocket = require("ws");

const KAFKA_BROKERS = process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"];
const ALERTS_TOPIC = process.env.KAFKA_ALERTS_TOPIC || "alerts";
const PORT = process.env.WS_PORT || 8080;

async function start() {
  const kafka = new Kafka({ clientId: "alerts-bridge", brokers: KAFKA_BROKERS });
  const consumer = kafka.consumer({ groupId: "alerts-ws-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: ALERTS_TOPIC, fromBeginning: false });

  const wss = new WebSocket.Server({ port: PORT });
  console.log(`✅ WebSocket server listening on ws://localhost:${PORT}`);

  wss.on("connection", (ws) => {
    console.log("🔌 Client connected");
    ws.send(JSON.stringify({ type: "info", message: "Connected to alerts stream" }));
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const alert = message.value.toString();
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(alert);
        }
      });
      console.log("➡️ Sent alert to clients:", alert);
    },
  });
}

start().catch((err) => {
  console.error("❌ Error starting server:", err);
  process.exit(1);
});

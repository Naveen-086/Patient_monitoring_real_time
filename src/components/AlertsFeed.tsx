import React, { useEffect, useState } from "react";

type Alert = {
  patient_id: string;
  ts: string;
  risk: string;
  risk_score: number;
  reason: string;
  vitals: {
    heart_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    temperature_c: number;
    spo2: number;
    resp_rate: number;
    age: number;
  };
};

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.patient_id) {
          setAlerts((prev) => [data, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Real-Time Alerts</h2>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border ${
              a.risk === "HIGH" ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"
            }`}
          >
            <div className="font-semibold">
              Patient {a.patient_id} — {a.risk} risk ({a.reason})
            </div>
            <div className="text-sm text-gray-600">
              Time: {new Date(a.ts).toLocaleString()}
            </div>
            <div className="text-xs text-gray-700 mt-1">
              HR: {a.vitals.heart_rate.toFixed(1)}, BP: {a.vitals.systolic_bp.toFixed(0)}/
              {a.vitals.diastolic_bp.toFixed(0)}, Temp: {a.vitals.temperature_c.toFixed(1)}°C, SpO₂:{" "}
              {a.vitals.spo2.toFixed(1)}%, RR: {a.vitals.resp_rate.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

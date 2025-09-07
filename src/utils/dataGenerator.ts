// src/utils/dataGenerator.ts
import { PatientData, VitalSigns, Alert } from "../types";

// Generate random vital signs with variation
export function generateVitalSigns(
  baseline: PatientData["baseline"],
  variation: number = 0.1
): VitalSigns {
  return {
    timestamp: new Date(),
    heartRate:
      baseline.heartRate[0] +
      Math.random() * (baseline.heartRate[1] - baseline.heartRate[0]) * (1 + variation),

    bloodPressureSystolic:
      baseline.bloodPressure[0][0] +
      Math.random() * (baseline.bloodPressure[0][1] - baseline.bloodPressure[0][0]) *
        (1 + variation),

    bloodPressureDiastolic:
      baseline.bloodPressure[1][0] +
      Math.random() * (baseline.bloodPressure[1][1] - baseline.bloodPressure[1][0]) *
        (1 + variation),

    temperature:
      baseline.temperature[0] +
      Math.random() * (baseline.temperature[1] - baseline.temperature[0]) * (1 + variation),

    oxygenSaturation:
      baseline.oxygenSaturation[0] +
      Math.random() * (baseline.oxygenSaturation[1] - baseline.oxygenSaturation[0]) *
        (1 + variation),

    respiratoryRate: 12 + Math.random() * 8, // 12–20 breaths/min
  };
}

// Risk score calculation
export function calculateRiskScore(vitals: VitalSigns, baseline: PatientData["baseline"]): number {
  let risk = 0;

  if (
    vitals.heartRate < baseline.heartRate[0] - 10 ||
    vitals.heartRate > baseline.heartRate[1] + 10
  ) {
    risk += 25;
  }
  if (vitals.bloodPressureSystolic > 140 || vitals.bloodPressureDiastolic > 90) {
    risk += 30;
  }
  if (vitals.temperature > 38.5 || vitals.temperature < 36.0) {
    risk += 20;
  }
  if (vitals.oxygenSaturation < 90) {
    risk += 35;
  }

  return Math.min(risk, 100);
}

// Generate alerts
export function generateAlert(
  patientName: string,
  vitalType: string,
  value: number,
  severity: "warning" | "critical"
): Alert {
  return {
    id: `${patientName}-${vitalType}-${Date.now()}`,
    type: severity,
    message: `${patientName}: ${vitalType} = ${value.toFixed(1)}`,
    timestamp: new Date(),
    acknowledged: false,
  };
}

// Mock patients
export const mockPatients: PatientData[] = [
  {
    id: "P1001",
    name: "John Doe",
    age: 45,
    room: "101A",
    status: "stable",
    riskScore: 20,
    lastUpdated: new Date(),
    vitals: {
      timestamp: new Date(),
      heartRate: 80,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 36.8,
      oxygenSaturation: 98,
      respiratoryRate: 16,
    },
    baseline: {
      heartRate: [70, 90],
      bloodPressure: [[110, 130], [70, 85]], // systolic + diastolic
      temperature: [36.5, 37.5],
      oxygenSaturation: [95, 100],
    },
    alerts: [],
  },
  {
    id: "P1002",
    name: "Jane Smith",
    age: 60,
    room: "102B",
    status: "warning",
    riskScore: 45,
    lastUpdated: new Date(),
    vitals: {
      timestamp: new Date(),
      heartRate: 95,
      bloodPressureSystolic: 145,
      bloodPressureDiastolic: 92,
      temperature: 37.9,
      oxygenSaturation: 94,
      respiratoryRate: 18,
    },
    baseline: {
      heartRate: [65, 85],
      bloodPressure: [[110, 135], [70, 90]],
      temperature: [36.5, 37.5],
      oxygenSaturation: [94, 100],
    },
    alerts: [],
  },
];

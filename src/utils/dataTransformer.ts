import { PatientData, Alert, VitalSigns } from '../types';
import { ApiPatient, ApiAlert } from '../services/api';

// Tamil names to match the Kafka producer
const TAMIL_NAMES = [
  "Arun Kumar", "Suresh Babu", "Karthik Raja", "Vigneshwaran", "Prakash Raj",
  "Ramesh Kannan", "Saravanan", "Senthil Kumar", "Manikandan", "Anand Raj",
  "Lakshmi Priya", "Divya Bharathi", "Kavya Shree", "Meena Kumari", "Priya Dharshini",
  "Nandhini", "Revathi", "Sangeetha", "Aishwarya", "Uma Maheswari"
];

// Transform API patient data to frontend format
export const transformApiPatient = (apiPatient: ApiPatient): PatientData => {
  const vitals: VitalSigns = {
    timestamp: new Date(apiPatient.lastUpdated),
    heartRate: Math.round(apiPatient.vitals.heart_rate),
    bloodPressureSystolic: Math.round(apiPatient.vitals.systolic_bp),
    bloodPressureDiastolic: Math.round(apiPatient.vitals.diastolic_bp),
    temperature: Math.round(apiPatient.vitals.temperature_c * 10) / 10,
    oxygenSaturation: Math.round(apiPatient.vitals.spo2),
    respiratoryRate: Math.round(apiPatient.vitals.resp_rate)
  };

  // Generate reasonable baselines based on current vitals and age
  const ageAdjustment = apiPatient.age > 65 ? 1.1 : 1.0;
  const baseline = {
    heartRate: [
      Math.max(50, Math.round(vitals.heartRate * 0.8 / ageAdjustment)),
      Math.min(120, Math.round(vitals.heartRate * 1.2 * ageAdjustment))
    ] as [number, number],
    bloodPressure: [
      [
        Math.max(90, Math.round(vitals.bloodPressureSystolic * 0.85)),
        Math.min(160, Math.round(vitals.bloodPressureSystolic * 1.15))
      ],
      [
        Math.max(60, Math.round(vitals.bloodPressureDiastolic * 0.85)),
        Math.min(100, Math.round(vitals.bloodPressureDiastolic * 1.15))
      ]
    ] as [[number, number], [number, number]],
    temperature: [36.0, 37.5] as [number, number],
    oxygenSaturation: [95, 100] as [number, number]
  };

  // Generate Tamil patient name based on ID
  const nameIndex = parseInt(apiPatient.id.replace(/\D/g, '')) % TAMIL_NAMES.length;
  const name = TAMIL_NAMES[nameIndex] || `Patient ${apiPatient.id}`;

  // Generate room number based on patient ID
  const roomNumber = `${apiPatient.status === 'critical' ? 'ICU' : 'Ward'}-${100 + (parseInt(apiPatient.id.replace(/\D/g, '')) % 400)}`;

  return {
    id: apiPatient.id,
    name,
    age: apiPatient.age,
    room: roomNumber,
    status: apiPatient.status,
    lastUpdated: new Date(apiPatient.lastUpdated),
    vitals,
    baseline,
    riskScore: Math.round(apiPatient.riskScore),
    alerts: [] // Will be populated from alerts API
  };
};

// Transform API alert data to frontend format
export const transformApiAlert = (apiAlert: ApiAlert): Alert => {
  const severity = apiAlert.risk === 'HIGH' ? 'critical' : 'warning';
  
  // Create a more user-friendly message
  const reasonMap: { [key: string]: string } = {
    'heart_rate': 'Heart Rate Abnormal',
    'systolic_bp': 'Blood Pressure High',
    'diastolic_bp': 'Blood Pressure Low', 
    'fever': 'Temperature Elevated',
    'low_spo2': 'Oxygen Saturation Low',
    'resp_rate': 'Respiratory Rate Abnormal',
    'model_high_risk': 'AI Risk Assessment High'
  };

  const reasons = apiAlert.reason.split(',').map(r => reasonMap[r] || r).join(', ');
  const message = `Patient ${apiAlert.patient_id}: ${reasons} (Risk: ${apiAlert.risk_score}%)`;

  return {
    id: apiAlert.id,
    type: severity,
    message,
    timestamp: new Date(apiAlert.ts),
    acknowledged: false
  };
};

// Generate patient name from ID consistently
export const generatePatientName = (patientId: string): string => {
  const index = parseInt(patientId.replace(/\D/g, '')) % TAMIL_NAMES.length;
  return TAMIL_NAMES[index] || `Patient ${patientId}`;
};
export interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
  status: 'stable' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface VitalSigns {
  timestamp: Date;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
}

export interface PatientData extends Patient {
  vitals: VitalSigns;
  baseline: {
    heartRate: [number, number];
    bloodPressure: [[number, number], [number, number]];
    temperature: [number, number];
    oxygenSaturation: [number, number];
  };
  riskScore: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}
const API_BASE_URL = 'http://localhost:8000';

export interface ApiPatient {
  id: string;
  age: number;
  lastUpdated: string;
  status: 'stable' | 'warning' | 'critical';
  riskScore: number;
  vitals: {
    heart_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    temperature_c: number;
    spo2: number;
    resp_rate: number;
    age: number;
  };
}

export interface ApiAlert {
  id: string;
  patient_id: string;
  ts: string;
  risk: 'HIGH' | 'LOW';
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
}

class ApiService {
  async fetchPatients(): Promise<ApiPatient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  }

  async fetchAlerts(): Promise<ApiAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
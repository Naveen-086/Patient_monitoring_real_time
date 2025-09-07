import React, { useState, useEffect } from 'react';
import { PatientData, VitalSigns } from '../types';
import VitalChart from './VitalChart';
import { ArrowLeft, Heart, Activity, Thermometer, Droplets, Gauge, Clock } from 'lucide-react';

interface PatientDetailViewProps {
  patient: PatientData;
  onBack: () => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack }) => {
  const [historicalData, setHistoricalData] = useState<{
    heartRate: number[];
    bloodPressure: number[];
    temperature: number[];
    oxygenSaturation: number[];
    timestamps: Date[];
  }>({
    heartRate: [],
    bloodPressure: [],
    temperature: [],
    oxygenSaturation: [],
    timestamps: []
  });

  useEffect(() => {
    // Generate historical data for the last 24 hours
    const generateHistoricalData = () => {
      const dataPoints = 48; // Every 30 minutes for 24 hours
      const now = new Date();
      const data = {
        heartRate: [] as number[],
        bloodPressure: [] as number[],
        temperature: [] as number[],
        oxygenSaturation: [] as number[],
        timestamps: [] as Date[]
      };

      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
        
        // Generate realistic variations around baseline
        const variation = Math.sin(i * 0.2) * 0.1 + (Math.random() - 0.5) * 0.2;
        
        data.heartRate.push(
          Math.round(patient.baseline.heartRate[0] + 
          (patient.baseline.heartRate[1] - patient.baseline.heartRate[0]) * (0.5 + variation))
        );
        
        data.bloodPressure.push(
          Math.round(patient.baseline.bloodPressure[0][0] + 
          (patient.baseline.bloodPressure[0][1] - patient.baseline.bloodPressure[0][0]) * (0.5 + variation))
        );
        
        data.temperature.push(
          Math.round((patient.baseline.temperature[0] + 
          (patient.baseline.temperature[1] - patient.baseline.temperature[0]) * (0.5 + variation)) * 10) / 10
        );
        
        data.oxygenSaturation.push(
          Math.round(patient.baseline.oxygenSaturation[0] + 
          (patient.baseline.oxygenSaturation[1] - patient.baseline.oxygenSaturation[0]) * (0.8 + variation * 0.2))
        );
        
        data.timestamps.push(timestamp);
      }

      // Add current values
      data.heartRate[data.heartRate.length - 1] = patient.vitals.heartRate;
      data.bloodPressure[data.bloodPressure.length - 1] = patient.vitals.bloodPressureSystolic;
      data.temperature[data.temperature.length - 1] = patient.vitals.temperature;
      data.oxygenSaturation[data.oxygenSaturation.length - 1] = patient.vitals.oxygenSaturation;

      return data;
    };

    setHistoricalData(generateHistoricalData());
  }, [patient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-rose-600 bg-rose-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      default: return 'text-emerald-600 bg-emerald-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-rose-600';
    if (score > 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-slate-600 font-medium">Room {patient.room} • Age {patient.age} • ID: {patient.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(patient.status)}`}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium">Last Updated</p>
              <p className="text-sm font-bold text-slate-900">{patient.lastUpdated.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Vitals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Heart Rate</p>
              <p className="text-3xl font-bold text-slate-900">{patient.vitals.heartRate} <span className="text-lg font-normal">BPM</span></p>
              <p className="text-xs text-slate-500 font-medium">Normal: {patient.baseline.heartRate[0]}-{patient.baseline.heartRate[1]}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Blood Pressure</p>
              <p className="text-3xl font-bold text-slate-900">{patient.vitals.bloodPressureSystolic}/{patient.vitals.bloodPressureDiastolic}</p>
              <p className="text-xs text-slate-500 font-medium">Normal: {patient.baseline.bloodPressure[0][0]}-{patient.baseline.bloodPressure[0][1]}/{patient.baseline.bloodPressure[1][0]}-{patient.baseline.bloodPressure[1][1]}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Temperature</p>
              <p className="text-3xl font-bold text-slate-900">{patient.vitals.temperature} <span className="text-lg font-normal">°C</span></p>
              <p className="text-xs text-slate-500 font-medium">Normal: {patient.baseline.temperature[0]}-{patient.baseline.temperature[1]}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">Oxygen Saturation</p>
              <p className="text-3xl font-bold text-slate-900">{patient.vitals.oxygenSaturation} <span className="text-lg font-normal">%</span></p>
              <p className="text-xs text-slate-500 font-medium">Normal: {patient.baseline.oxygenSaturation[0]}-{patient.baseline.oxygenSaturation[1]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Gauge className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Risk Assessment</h2>
              <p className="text-sm text-slate-600 font-medium">Machine learning prediction based on vital patterns</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getRiskColor(patient.riskScore)}`}>{patient.riskScore}%</p>
            <p className="text-sm text-slate-500 font-medium">Risk Score</p>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-4 mb-6">
          <div 
            className={`h-4 rounded-full transition-all duration-1000 ${
              patient.riskScore > 70 ? 'bg-rose-500' : 
              patient.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${patient.riskScore}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-slate-600 font-medium">
          {patient.riskScore > 70 && "High risk - Immediate intervention may be required"}
          {patient.riskScore > 40 && patient.riskScore <= 70 && "Moderate risk - Close monitoring recommended"}
          {patient.riskScore <= 40 && "Low risk - Patient stable within expected parameters"}
        </div>
      </div>

      {/* Historical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VitalChart
          title="Heart Rate Trend (24h)"
          data={historicalData.heartRate}
          color="#EF4444"
          unit="BPM"
          baseline={patient.baseline.heartRate}
        />
        <VitalChart
          title="Blood Pressure (Systolic)"
          data={historicalData.bloodPressure}
          color="#3B82F6"
          unit="mmHg"
          baseline={patient.baseline.bloodPressure[0]}
        />
        <VitalChart
          title="Temperature Trend (24h)"
          data={historicalData.temperature}
          color="#F59E0B"
          unit="°C"
          baseline={patient.baseline.temperature}
        />
        <VitalChart
          title="Oxygen Saturation (24h)"
          data={historicalData.oxygenSaturation}
          color="#06B6D4"
          unit="%"
          baseline={patient.baseline.oxygenSaturation}
        />
      </div>
    </div>
  );
};

export default PatientDetailView;
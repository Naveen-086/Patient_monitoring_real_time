import React from 'react';
import { PatientData } from '../types';
import { Heart, Thermometer, Droplets, Activity } from 'lucide-react';

interface PatientCardProps {
  patient: PatientData;
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-rose-400 bg-gradient-to-br from-rose-50 to-rose-100';
      case 'warning': return 'border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100';
      default: return 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div 
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${getStatusColor(patient.status)}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{patient.name}</h3>
          <p className="text-sm text-slate-600 font-medium">Room {patient.room} • Age {patient.age}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${getStatusDot(patient.status)} animate-pulse shadow-lg`}></div>
          <span className="text-sm font-bold text-slate-800 capitalize">{patient.status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Heart Rate</p>
            <p className="text-sm font-bold text-slate-900">{patient.vitals.heartRate}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Blood Pressure</p>
            <p className="text-sm font-bold text-slate-900">{patient.vitals.bloodPressureSystolic}/{patient.vitals.bloodPressureDiastolic}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Thermometer className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Temperature</p>
            <p className="text-sm font-bold text-slate-900">{patient.vitals.temperature}°C</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">Oxygen</p>
            <p className="text-sm font-bold text-slate-900">{patient.vitals.oxygenSaturation}%</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Risk Assessment</span>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  patient.riskScore > 70 ? 'bg-rose-500' : 
                  patient.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${patient.riskScore}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-slate-900">{patient.riskScore}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
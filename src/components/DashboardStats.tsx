import React from 'react';
import { PatientData } from '../types';
import { Users, AlertTriangle, Heart, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  patients: PatientData[];
  totalAlerts: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ patients, totalAlerts }) => {
  const criticalPatients = patients.filter(p => p.status === 'critical').length;
  const warningPatients = patients.filter(p => p.status === 'warning').length;
  const stablePatients = patients.filter(p => p.status === 'stable').length;
  const averageRisk = Math.round(patients.reduce((sum, p) => sum + p.riskScore, 0) / patients.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Total Patients</p>
            <p className="text-4xl font-bold text-slate-900">{patients.length}</p>
            <div className="flex space-x-4 text-xs mt-2">
              <span className="text-emerald-600 font-medium">{stablePatients} stable</span>
              <span className="text-amber-600 font-medium">{warningPatients} warning</span>
              <span className="text-rose-600 font-medium">{criticalPatients} critical</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Active Alerts</p>
            <p className="text-4xl font-bold text-slate-900">{totalAlerts}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Requires attention</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Average Risk</p>
            <p className={`text-3xl font-bold ${
              averageRisk > 50 ? 'text-rose-600' : 
              averageRisk > 25 ? 'text-amber-600' : 'text-emerald-600'
            }`}>{averageRisk}%</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">AI Assessment</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">System Status</p>
            <p className="text-4xl font-bold text-emerald-600">Live</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <p className="text-xs text-slate-500 font-medium">Monitoring active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
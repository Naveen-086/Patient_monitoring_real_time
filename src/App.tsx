import React, { useState, useEffect } from 'react';
import PatientCard from './components/PatientCard';
import PatientDetailView from './components/PatientDetailView';
import AlertPanel from './components/AlertPanel';
import DashboardStats from './components/DashboardStats';
import { PatientData, Alert } from './types';
import { apiService } from './services/api';
import { transformApiPatient, transformApiAlert } from './utils/dataTransformer';
import { Activity, Users, Settings, Bell } from 'lucide-react';

function App() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'alerts'>('patients');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Fetch data from Kafka backend
  const fetchData = async () => {
    try {
      setConnectionStatus('connecting');
      const [patientsData, alertsData] = await Promise.all([
        apiService.fetchPatients(),
        apiService.fetchAlerts()
      ]);

      if (patientsData.length > 0) {
        const transformedPatients = patientsData.map(transformApiPatient);
        const transformedAlerts = alertsData.map(transformApiAlert);
        
        // Associate alerts with patients
        const patientAlertsMap = new Map<string, Alert[]>();
        transformedAlerts.forEach(alert => {
          const patientId = alert.id.split('-')[0]; // Extract patient ID from alert ID
          if (!patientAlertsMap.has(patientId)) {
            patientAlertsMap.set(patientId, []);
          }
          patientAlertsMap.get(patientId)!.push(alert);
        });

        // Add alerts to patients
        const patientsWithAlerts = transformedPatients.map(patient => ({
          ...patient,
          alerts: patientAlertsMap.get(patient.id) || []
        }));

        setPatients(patientsWithAlerts);
        setAlerts(transformedAlerts);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update selected patient when patients data changes
  useEffect(() => {
    if (selectedPatient) {
      const updatedSelectedPatient = patients.find(p => p.id === selectedPatient.id);
      if (updatedSelectedPatient) {
        setSelectedPatient(updatedSelectedPatient);
      }
    }
  }, [patients, selectedPatient]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Connecting to System</h2>
          <p className="text-slate-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <PatientDetailView 
          patient={selectedPatient} 
          onBack={() => setSelectedPatient(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">MedWatch</h1>
                <p className="text-sm text-slate-600">Real-time Patient Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-full">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
                  'bg-rose-500'
                }`}></div>
                <span className="text-sm font-medium text-slate-700">
                  {connectionStatus === 'connected' ? 'Live' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
              </div>
              
              <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('patients')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'patients' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Patients
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === 'alerts' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Alerts
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {connectionStatus === 'disconnected' && (
          <div className="mb-8 bg-rose-50 border border-rose-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-rose-500 rounded-full"></div>
              <p className="text-rose-800 font-semibold">System Offline</p>
            </div>
            <p className="text-rose-700 text-sm mt-2">
              Unable to connect to monitoring system. Please check backend services.
            </p>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Patient Monitor</h2>
                <p className="text-slate-600 mt-1">{patients.length} patients under active monitoring</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {patients.map(patient => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => setSelectedPatient(patient)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">System Overview</h2>
              <p className="text-slate-600 mt-1">Real-time analytics and monitoring dashboard</p>
            </div>
            
            <DashboardStats patients={patients} totalAlerts={unacknowledgedAlerts.length} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Patients at Risk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {patients
                      .filter(patient => patient.status === 'critical' || patient.status === 'warning')
                      .slice(0, 4)
                      .map(patient => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onClick={() => setSelectedPatient(patient)}
                      />
                    ))}
                    {patients.filter(patient => patient.status === 'critical' || patient.status === 'warning').length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <div className="text-emerald-500 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">All Patients Stable</h4>
                        <p className="text-slate-500">No patients currently require immediate attention</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <AlertPanel
                  alerts={alerts.slice(0, 6)}
                  onAcknowledge={handleAcknowledgeAlert}
                  onDismiss={handleDismissAlert}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Active Alerts</h2>
                <p className="text-slate-600 mt-1">{unacknowledgedAlerts.length} alerts requiring attention</p>
              </div>
            </div>
            
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onDismiss={handleDismissAlert}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
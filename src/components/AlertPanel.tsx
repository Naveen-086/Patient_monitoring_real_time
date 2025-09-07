import React from 'react';
import { Alert } from '../types';
import { AlertTriangle, AlertCircle, Info, X, Check } from 'lucide-react';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledge, onDismiss }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Live Alerts</h3>
          <div className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-bold">
            {unacknowledgedAlerts.length} Active
          </div>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <p className="text-lg font-semibold">All Clear</p>
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 ${getAlertBg(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''} transition-all duration-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        title="Acknowledge"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                      title="Dismiss"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
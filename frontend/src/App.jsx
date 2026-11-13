import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { RealTimePrediction } from './pages/RealTimePrediction';
import { TransactionExplorer } from './pages/TransactionExplorer';
import { FraudAlerts } from './pages/FraudAlerts';
import { ExplainableAI } from './pages/ExplainableAI';
import { ModelComparison } from './pages/ModelComparison';
import { CustomerAnalytics } from './pages/CustomerAnalytics';
import { DatasetManagement } from './pages/DatasetManagement';
import { InvestigationCenter } from './pages/InvestigationCenter';
import { AuditLogs } from './pages/AuditLogs';
import { SettingsPage } from './pages/Settings';
import { api } from './services/api';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTxnId, setSelectedTxnId] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.getAlertStats()
        .then(stats => setAlertCount(stats.critical || 0))
        .catch(console.error);
    }
  }, [isAuthenticated, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeTab={activeTab} onRefresh={handleRefresh} alertCount={alertCount} />
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard key={refreshKey} setActiveTab={setActiveTab} setSelectedTxnId={setSelectedTxnId} />
          )}
          {activeTab === 'predict' && <RealTimePrediction />}
          {activeTab === 'transactions' && (
            <TransactionExplorer
              key={refreshKey}
              selectedTxnId={selectedTxnId}
              setSelectedTxnId={setSelectedTxnId}
            />
          )}
          {activeTab === 'alerts' && <FraudAlerts key={refreshKey} />}
          {activeTab === 'xai' && <ExplainableAI />}
          {activeTab === 'models' && <ModelComparison key={refreshKey} />}
          {activeTab === 'customers' && <CustomerAnalytics key={refreshKey} />}
          {activeTab === 'dataset' && <DatasetManagement key={refreshKey} />}
          {activeTab === 'investigations' && <InvestigationCenter key={refreshKey} />}
          {activeTab === 'audit' && <AuditLogs key={refreshKey} />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

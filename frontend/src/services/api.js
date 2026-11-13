const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('fraudshield_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed. Invalid credentials.');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed.');
    }
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) return null;
    return res.json();
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load transactions');
    return res.json();
  },

  async getTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Transaction not found');
    return res.json();
  },

  async predictTransaction(payload) {
    const res = await fetch(`${API_BASE}/transactions/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || 'Prediction failed');
    }
    return res.json();
  },

  exportCsvUrl() {
    return `${API_BASE}/transactions/export`;
  },

  // Alerts
  async getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/alerts?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load alerts');
    return res.json();
  },

  async getAlert(id) {
    const res = await fetch(`${API_BASE}/alerts/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Alert not found');
    return res.json();
  },

  async updateAlertStatus(id, data) {
    const res = await fetch(`${API_BASE}/alerts/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update alert');
    return res.json();
  },

  async getAlertStats() {
    const res = await fetch(`${API_BASE}/alerts/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load alert stats');
    return res.json();
  },

  // Customers
  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/customers?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load customer profiles');
    return res.json();
  },

  async getCustomer(id) {
    const res = await fetch(`${API_BASE}/customers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Customer account not found');
    return res.json();
  },

  // ML Models & Dataset
  async getModels() {
    const res = await fetch(`${API_BASE}/ml/models`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load ML models info');
    return res.json();
  },

  async selectActiveModel(modelName) {
    const res = await fetch(`${API_BASE}/ml/models/select?modelName=${encodeURIComponent(modelName)}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to switch model');
    return res.json();
  },

  async getDatasetProfile() {
    const res = await fetch(`${API_BASE}/ml/dataset/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load dataset profile');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit-logs?${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  }
};

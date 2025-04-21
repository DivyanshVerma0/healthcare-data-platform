import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, name: string, role: string) => {
  const response = await api.post('/auth/register', { email, password, name, role });
  return response.data;
};

export const getUserData = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Connect wallet to user account
export const connectWallet = async (walletAddress: string) => {
  const response = await api.post('/auth/connect-wallet', { walletAddress });
  return response.data;
};

// User API
export const updateUser = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await api.put('/users/change-password', { oldPassword, newPassword });
  return response.data;
};

// Health Records API
export const getHealthRecords = async () => {
  const response = await api.get('/health-records');
  return response.data;
};

export const createHealthRecord = async (recordData: any) => {
  const response = await api.post('/health-records', recordData);
  return response.data;
};

export const updateHealthRecord = async (id: string, recordData: any) => {
  const response = await api.put(`/health-records/${id}`, recordData);
  return response.data;
};

export const deleteHealthRecord = async (id: string) => {
  const response = await api.delete(`/health-records/${id}`);
  return response.data;
};

// Research Data API
export const getResearchData = async () => {
  const response = await api.get('/research-data');
  return response.data;
};

export const createResearchData = async (data: any) => {
  const response = await api.post('/research-data', data);
  return response.data;
};

export const updateResearchData = async (id: string, data: any) => {
  const response = await api.put(`/research-data/${id}`, data);
  return response.data;
};

export const deleteResearchData = async (id: string) => {
  const response = await api.delete(`/research-data/${id}`);
  return response.data;
};

// Admin API
export const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export default api; 
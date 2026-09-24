import { apiClient } from './api';

export interface AdminDashboardStats {
  totalUsers: number;
  totalBooks: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalFinesAmount: number;
  serverStatus: string;
  uptime: string;
}

export interface UserManagementItem {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR';
  status: string;
  department?: string;
  phone?: string;
}

export interface AcquisitionItem {
  id: string;
  title: string;
  author: string;
  supplier: string;
  requestedBy: string;
  cost: number;
  status: string;
  orderDate: string;
}

export const AdminService = {
  getDashboard: async () => {
    const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get<UserManagementItem[]>('/admin/users');
    return response.data;
  },

  createUser: async (userData: Partial<UserManagementItem> & { password?: string }) => {
    const response = await apiClient.post<UserManagementItem>('/admin/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<UserManagementItem>) => {
    const response = await apiClient.put<UserManagementItem>(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  getAcquisitions: async () => {
    const response = await apiClient.get<AcquisitionItem[]>('/admin/acquisition');
    return response.data;
  },

  createAcquisition: async (data: Partial<AcquisitionItem>) => {
    const response = await apiClient.post<AcquisitionItem>('/admin/acquisition', data);
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await apiClient.get('/admin/audit-logs');
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  updateSetting: async (settingKey: string, settingValue: string) => {
    const response = await apiClient.put('/admin/settings', { settingKey, settingValue });
    return response.data;
  },

  triggerBackup: async () => {
    const response = await apiClient.post('/admin/backup/trigger');
    return response.data;
  },

  getReservations: async () => {
    const response = await apiClient.get('/admin/reservations');
    return response.data;
  },

  markReservationReady: async (id: string) => {
    const response = await apiClient.put(`/admin/reservations/${id}/ready`);
    return response.data;
  },

  checkoutReservation: async (id: string) => {
    const response = await apiClient.post(`/admin/reservations/${id}/checkout`);
    return response.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiClient.delete(`/admin/reservations/${id}`);
    return response.data;
  },

  updateReservationStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/admin/reservations/${id}/status`, { status });
    return response.data;
  },

  deleteReservationPermanently: async (id: string) => {
    const response = await apiClient.delete(`/admin/reservations/${id}/permanent`);
    return response.data;
  },

  getRequests: async () => {
    const response = await apiClient.get('/admin/requests');
    return response.data;
  },

  updateRequestStatus: async (id: string, status: string, notes?: string) => {
    const response = await apiClient.put(`/admin/requests/${id}/status`, { status, notes });
    return response.data;
  },

  deleteRequestPermanently: async (id: string) => {
    const response = await apiClient.delete(`/admin/requests/${id}`);
    return response.data;
  },
};

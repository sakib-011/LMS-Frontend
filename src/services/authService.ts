import { apiClient } from './api';

export interface User {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR' | 'Student' | 'Moderator' | 'Administrator';
  department?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const AuthService = {
  // Login with credentials against real Spring Boot backend
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error('Authentication failed');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Get current user session
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user_data');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};



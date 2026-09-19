import { apiClient } from './api';
import { Book } from './bookService';

export interface StudentDashboardStats {
  currentlyBorrowed: number;
  totalBorrowed: number;
  pendingReservations: number;
  activeRequests: number;
  totalFines: number;
  recentBorrowings: any[];
}

export interface BorrowingItem {
  id: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  isOverdue: boolean;
  progress?: number;
}

export type BorrowedBookItem = BorrowingItem;

export interface ReservationItem {
  id: string;
  book: Book;
  reservedDate: string;
  expiryDate?: string;
  pickupDeadline?: string;
  queuePosition: number;
  status: 'pending' | 'ready' | 'fulfilled' | 'cancelled';
}

export interface BookRequestItem {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  notes?: string;
}

export interface DigitalBookItem {
  id: string;
  book: Book;
  progress: number;
  currentPage: number;
  lastRead: string;
  bookmarked: boolean;
  pdfUrl?: string;
}

export interface WishlistItem {
  id: string;
  book: Book;
  addedDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isUnread: boolean;
  type?: string;
}

export const StudentService = {
  getDashboard: async () => {
    const response = await apiClient.get<StudentDashboardStats>('/student/dashboard');
    return response.data;
  },

  getBorrowings: async () => {
    const response = await apiClient.get<BorrowingItem[]>('/student/borrowings');
    return response.data;
  },

  getReservations: async () => {
    const response = await apiClient.get<ReservationItem[]>('/student/reservations');
    return response.data;
  },

  createReservation: async (bookId: string) => {
    const response = await apiClient.post<ReservationItem>('/student/reservations', { bookId });
    return response.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiClient.delete(`/student/reservations/${id}`);
    return response.data;
  },

  getRequests: async () => {
    const response = await apiClient.get<BookRequestItem[]>('/student/requests');
    return response.data;
  },

  createRequest: async (data: { title: string; author: string; isbn?: string; reason?: string }) => {
    const response = await apiClient.post<BookRequestItem>('/student/requests', data);
    return response.data;
  },

  getDigitalLibrary: async () => {
    const response = await apiClient.get<DigitalBookItem[]>('/student/digital-library');
    return response.data;
  },

  updateDigitalProgress: async (id: string, payload: { progress?: number; currentPage?: number; bookmarked?: boolean }) => {
    const response = await apiClient.put<DigitalBookItem>(`/student/digital-library/${id}/progress`, payload);
    return response.data;
  },

  getWishlist: async () => {
    const response = await apiClient.get<WishlistItem[]>('/student/wishlist');
    return response.data;
  },

  addToWishlist: async (bookId: string) => {
    const response = await apiClient.post(`/student/wishlist/${bookId}`);
    return response.data;
  },

  removeFromWishlist: async (bookId: string) => {
    const response = await apiClient.delete(`/student/wishlist/${bookId}`);
    return response.data;
  },

  getNotifications: async () => {
    const response = await apiClient.get<NotificationItem[]>('/student/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.put<NotificationItem>(`/student/notifications/${id}/read`);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },
};

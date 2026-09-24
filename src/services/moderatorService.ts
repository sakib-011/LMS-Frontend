import { apiClient } from './api';
import { Book } from './bookService';
import { ReservationItem, BookRequestItem, BorrowedBookItem } from './studentService';

export interface ModeratorDashboardStats {
  issuedBooks: number;
  overdueLoans: number;
  pendingReservations: number;
  pendingRequests: number;
  totalBooks: number;
}

export interface ActivityLogItem {
  id: string;
  userEmail: string;
  action: string;
  category: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface FineItem {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  book: Partial<Book> | any;
  amount: number;
  reason: string;
  dateIssued: string;
  datePaid?: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
}

export const ModeratorService = {
  getDashboard: async () => {
    const response = await apiClient.get<ModeratorDashboardStats>('/moderator/dashboard');
    return response.data;
  },

  getActivity: async () => {
    const response = await apiClient.get<ActivityLogItem[]>('/moderator/activity');
    return response.data;
  },

  issueBook: async (studentEmail: string, bookId: string, dueDate?: string) => {
    const response = await apiClient.post('/moderator/borrowing/issue', { studentEmail, bookId, dueDate });
    return response.data;
  },

  renewBorrowing: async (borrowingId: string, dueDate?: string) => {
    const response = await apiClient.put(`/moderator/borrowing/${borrowingId}/renew`, { dueDate });
    return response.data;
  },

  getBorrowings: async () => {
    const response = await apiClient.get<BorrowedBookItem[]>('/moderator/borrowing');
    return response.data;
  },

  processReturn: async (borrowingId: string) => {
    const response = await apiClient.post('/moderator/returns/process', { borrowingId });
    return response.data;
  },

  getInventory: async () => {
    const response = await apiClient.get<Book[]>('/moderator/inventory');
    return response.data;
  },

  updateInventoryLocation: async (id: string, physicalStacks: string, physicalCopies?: number) => {
    const response = await apiClient.put<Book>(`/moderator/inventory/${id}/location`, { physicalStacks, physicalCopies });
    return response.data;
  },

  createBook: async (bookData: Partial<Book>) => {
    const response = await apiClient.post<Book>('/moderator/books', bookData);
    return response.data;
  },

  getReservations: async () => {
    const response = await apiClient.get<ReservationItem[]>('/moderator/reservations');
    return response.data;
  },

  markReservationReady: async (id: string) => {
    const response = await apiClient.put<ReservationItem>(`/moderator/reservations/${id}/ready`);
    return response.data;
  },

  checkoutReservation: async (id: string) => {
    const response = await apiClient.post(`/moderator/reservations/${id}/checkout`);
    return response.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiClient.delete(`/moderator/reservations/${id}`);
    return response.data;
  },

  updateReservationStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/moderator/reservations/${id}/status`, { status });
    return response.data;
  },

  deleteReservationPermanently: async (id: string) => {
    const response = await apiClient.delete(`/moderator/reservations/${id}/permanent`);
    return response.data;
  },

  getRequests: async () => {
    const response = await apiClient.get<BookRequestItem[]>('/moderator/requests');
    return response.data;
  },

  updateRequestStatus: async (id: string, status: string, notes?: string) => {
    const response = await apiClient.put<BookRequestItem>(`/moderator/requests/${id}/status`, { status, notes });
    return response.data;
  },

  deleteRequestPermanently: async (id: string) => {
    const response = await apiClient.delete(`/moderator/requests/${id}`);
    return response.data;
  },

  getFines: async () => {
    const response = await apiClient.get<FineItem[]>('/moderator/fines');
    return response.data;
  },

  collectFine: async (id: string) => {
    const response = await apiClient.post<FineItem>(`/moderator/fines/${id}/collect`);
    return response.data;
  },

  getStudents: async () => {
    const response = await apiClient.get('/moderator/students');
    return response.data;
  },
};

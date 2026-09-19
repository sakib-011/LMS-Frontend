import { apiClient } from './api';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  pages: number;
  rating: number;
  ratingCount: number;
  coverColor?: string;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  physicalCopies: number;
  physicalAvailable: number;
  hasDigital: boolean;
  edition?: string;
  description: string;
  physicalStacks?: string;
  gateScore?: number;
}

export interface CreateBookResponse {
  success: boolean;
  message: string;
  data: Book;
}

export const BookService = {
  // Fetch all books (with optional filters)
  getBooks: async (params?: Record<string, string | number>) => {
    const response = await apiClient.get<Book[]>('/books', { params });
    return response.data;
  },

  // Fetch a single book by ID
  getBookById: async (id: string) => {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },

  // Search books globally
  searchBooks: async (query: string) => {
    const response = await apiClient.get<Book[]>('/books/search', {
      params: { q: query }
    });
    return response.data;
  },

  // STEP 1: Save Book Data ONLY to Spring Boot -> PostgreSQL (No Image File)
  createBook: async (bookData: Partial<Book>): Promise<CreateBookResponse> => {
    const response = await apiClient.post<CreateBookResponse>('/books', bookData);
    return response.data;
  },

  // STEP 5: Update Database With Cloudinary Image URL + Public ID
  updateBookImage: async (
    bookId: string,
    imageUrl: string,
    cloudinaryPublicId: string
  ): Promise<CreateBookResponse> => {
    const response = await apiClient.patch<CreateBookResponse>(`/books/${bookId}/image`, {
      imageUrl,
      cloudinaryPublicId
    });
    return response.data;
  },

  // Update an existing book metadata
  updateBook: async (id: string, bookData: Partial<Book>) => {
    const response = await apiClient.put<Book>(`/books/${id}`, bookData);
    return response.data;
  },

  // Delete a book
  deleteBook: async (id: string) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  }
};

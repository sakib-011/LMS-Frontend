// ============================================================
// BookGrid — Central Mock Data
// ============================================================

export interface Book {
  edition?: string;
  gateScore?: number;
  physicalStacks?: string;
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  publisher?: string;
  year: number;
  rating: number;
  ratingCount: number;
  description: string;
  coverColor: string; // CSS color for placeholder
  imageUrl?: string;
  cloudinaryPublicId?: string;
  tags?: string[];
  physicalCopies: number;
  physicalAvailable: number;
  hasDigital?: boolean;
  pages?: number;
}

export interface BorrowedBook {
  id: string;
  book: Book;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  isOverdue: boolean;
  progress?: number; // reading progress 0-100
}

export interface Reservation {
  id: string;
  book: Book;
  reservedDate: string;
  expiryDate: string;
  queuePosition: number;
  status: 'pending' | 'ready' | 'expired' | 'cancelled';
  pickupDeadline?: string;
}

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'acquired';
  submittedDate: string;
  notes?: string;
}

export interface DigitalBook {
  id: string;
  book: Book;
  addedDate: string;
  lastRead?: string;
  progress: number; // 0-100
  bookmarked: boolean;
  currentPage: number;
}

export interface Review {
  id: string;
  book: Book;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  type: 'due' | 'reservation' | 'request' | 'system';
  icon: string;
}

export interface Activity {
  id: string;
  type: 'borrowed' | 'returned' | 'reserved' | 'reviewed' | 'requested';
  description: string;
  time: string;
  icon: string;
}

// ============================================================
// Books Catalog (18 entries)
// ============================================================
const RAW_BOOKS = [
  {
    id: 'b1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    category: 'Computer Science',
    isbn: '978-0-262-03384-8',
    publisher: 'MIT Press',
    year: 2022,
    rating: 4.8,
    ratingCount: 2847,
    description: 'The world\'s leading textbook on algorithms. Extensively revised and updated, this edition covers new topics including van Emde Boas trees and multithreaded algorithms. Cormen et al. is an essential reference for students and professionals.',
    coverColor: '#2D3748',
    tags: ['algorithms', 'data structures', 'programming'],
    physicalCopies: 8,
    physicalAvailable: 3,
    hasDigital: true,
    pages: 1292,
  },
  {
    id: 'b2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '978-0-13-235088-4',
    publisher: 'Prentice Hall',
    year: 2008,
    rating: 4.6,
    ratingCount: 5621,
    description: 'A handbook of agile software craftsmanship. Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    coverColor: '#1A202C',
    tags: ['software engineering', 'best practices', 'refactoring'],
    physicalCopies: 5,
    physicalAvailable: 0,
    hasDigital: true,
    pages: 431,
  },
  {
    id: 'b3',
    title: 'The Art of Computer Programming',
    author: 'Donald E. Knuth',
    category: 'Computer Science',
    isbn: '978-0-201-89683-1',
    publisher: 'Addison-Wesley',
    year: 2011,
    rating: 4.9,
    ratingCount: 1203,
    description: 'The bible of all fundamental algorithms and the work that taught many of today\'s software developers most of what they know about computer programming.',
    coverColor: '#744210',
    tags: ['algorithms', 'mathematics', 'computer science'],
    physicalCopies: 4,
    physicalAvailable: 2,
    hasDigital: false,
    pages: 672,
  },
  {
    id: 'b4',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    isbn: '978-0-553-38016-3',
    publisher: 'Bantam Books',
    year: 1998,
    rating: 4.7,
    ratingCount: 12456,
    description: 'Hawking\'s account of the history of the universe, from the big bang to black holes, written for a general audience.',
    coverColor: '#1C4532',
    tags: ['physics', 'cosmology', 'science'],
    physicalCopies: 10,
    physicalAvailable: 7,
    hasDigital: true,
    pages: 212,
  },
  {
    id: 'b5',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    isbn: '978-0-06-231609-7',
    publisher: 'Harper Collins',
    year: 2015,
    rating: 4.5,
    ratingCount: 18920,
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution covering the cognitive, agricultural, and scientific revolutions.',
    coverColor: '#553C1E',
    tags: ['history', 'anthropology', 'evolution'],
    physicalCopies: 6,
    physicalAvailable: 1,
    hasDigital: true,
    pages: 443,
  },
  {
    id: 'b6',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    category: 'Business',
    isbn: '978-0-307-88791-7',
    publisher: 'Crown Business',
    year: 2011,
    rating: 4.3,
    ratingCount: 9832,
    description: 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.',
    coverColor: '#234E52',
    tags: ['entrepreneurship', 'startup', 'innovation'],
    physicalCopies: 7,
    physicalAvailable: 4,
    hasDigital: true,
    pages: 336,
  },
  {
    id: 'b7',
    title: 'Engineering Mathematics',
    author: 'K.A. Stroud',
    category: 'Engineering',
    isbn: '978-0-230-27769-5',
    publisher: 'Palgrave Macmillan',
    year: 2013,
    rating: 4.6,
    ratingCount: 3241,
    description: 'An acclaimed textbook for engineering students, providing a thorough grounding in mathematics with worked examples at every step.',
    coverColor: '#2A4365',
    tags: ['mathematics', 'engineering', 'calculus'],
    physicalCopies: 12,
    physicalAvailable: 8,
    hasDigital: false,
    pages: 1024,
  },
  {
    id: 'b8',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    category: 'Literature',
    isbn: '978-0-06-112008-4',
    publisher: 'Harper Perennial',
    year: 2002,
    rating: 4.8,
    ratingCount: 34521,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    coverColor: '#3D2B1F',
    tags: ['fiction', 'classic', 'american literature'],
    physicalCopies: 9,
    physicalAvailable: 5,
    hasDigital: true,
    pages: 281,
  },
  {
    id: 'b9',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Science',
    isbn: '978-0-374-53355-7',
    publisher: 'Farrar, Straus and Giroux',
    year: 2011,
    rating: 4.6,
    ratingCount: 15432,
    description: 'Kahneman exposes the two systems that drive the way we think and offers practical insights to improve decision making.',
    coverColor: '#1A365D',
    tags: ['psychology', 'behavioral economics', 'decision making'],
    physicalCopies: 5,
    physicalAvailable: 2,
    hasDigital: true,
    pages: 499,
  },
  {
    id: 'b10',
    title: 'Calculus: Early Transcendentals',
    author: 'James Stewart',
    category: 'Mathematics',
    isbn: '978-1-285-74155-0',
    publisher: 'Cengage Learning',
    year: 2015,
    rating: 4.4,
    ratingCount: 7823,
    description: 'Acclaimed for its mathematical precision, James Stewart\'s calculus textbooks are widely used by millions of students worldwide.',
    coverColor: '#652B19',
    tags: ['calculus', 'mathematics', 'analysis'],
    physicalCopies: 15,
    physicalAvailable: 9,
    hasDigital: false,
    pages: 1368,
  },
  {
    id: 'b11',
    title: 'Design Patterns',
    author: 'Gang of Four',
    category: 'Computer Science',
    isbn: '978-0-201-63361-0',
    publisher: 'Addison-Wesley',
    year: 1994,
    rating: 4.7,
    ratingCount: 4512,
    description: 'Capturing a wealth of experience about the design of object-oriented software, the authors present 23 patterns for reusable OO design.',
    coverColor: '#322659',
    tags: ['design patterns', 'object-oriented', 'software architecture'],
    physicalCopies: 6,
    physicalAvailable: 0,
    hasDigital: true,
    pages: 395,
  },
  {
    id: 'b12',
    title: 'The Art of War',
    author: 'Sun Tzu',
    category: 'History',
    isbn: '978-1-59030-225-8',
    publisher: 'Shambhala',
    year: 2005,
    rating: 4.5,
    ratingCount: 22341,
    description: 'An ancient Chinese military treatise dating from the Late Spring and Autumn period of history. Comprises 13 chapters, each devoted to one aspect of warfare.',
    coverColor: '#7B341E',
    tags: ['strategy', 'philosophy', 'military'],
    physicalCopies: 8,
    physicalAvailable: 6,
    hasDigital: true,
    pages: 273,
  },
];

export const MOCK_BOOKS: Book[] = RAW_BOOKS.map((b, i) => ({
  ...b,
  edition: ['5th Ed.', '3rd Ed.', '4th Ed.', '2nd Ed.', '1st Ed.', '6th Ed.', '2nd Ed.', '1st Ed.', '4th Ed.', '8th Ed.', '1st Ed.', '1st Ed.'][i % 12] || '1st Ed.',
  gateScore: [9.82, 6.153, 5.81, 8.15, 5.5, 7.25, 9.12, 5.2, 4.8, 7.91, 6.83, 3.5][i % 12] || 5.0,
  physicalStacks: ['Stack 2A', 'Stack 5C', 'Stack 1B', 'Stack 3D', 'Stack 4A', 'Stack 6B', 'Stack 2C', 'Stack 1A', 'Stack 3B', 'Stack 5A', 'Stack 2D', 'Stack 4C'][i % 12] || 'Stack 1A',
}));

// ============================================================
// Currently Borrowed
// ============================================================
export const MOCK_BORROWED: BorrowedBook[] = [
  {
    id: 'bor1',
    book: MOCK_BOOKS[0],
    borrowDate: '2026-09-01',
    dueDate: '2026-09-22',
    isOverdue: false,
    progress: 45,
  },
  {
    id: 'bor2',
    book: MOCK_BOOKS[3],
    borrowDate: '2026-08-28',
    dueDate: '2026-09-18',
    isOverdue: true,
    progress: 80,
  },
  {
    id: 'bor3',
    book: MOCK_BOOKS[7],
    borrowDate: '2026-09-10',
    dueDate: '2026-09-30',
    isOverdue: false,
    progress: 20,
  },
];

export const MOCK_BORROW_HISTORY: BorrowedBook[] = [
  {
    id: 'bor4',
    book: MOCK_BOOKS[5],
    borrowDate: '2026-07-01',
    dueDate: '2026-07-21',
    returnDate: '2026-07-18',
    isOverdue: false,
    progress: 100,
  },
  {
    id: 'bor5',
    book: MOCK_BOOKS[4],
    borrowDate: '2026-06-15',
    dueDate: '2026-07-05',
    returnDate: '2026-07-02',
    isOverdue: false,
    progress: 100,
  },
];

// ============================================================
// Reservations
// ============================================================
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res1',
    book: MOCK_BOOKS[1],
    reservedDate: '2026-09-10',
    expiryDate: '2026-09-25',
    queuePosition: 1,
    status: 'ready',
    pickupDeadline: '2026-09-20',
  },
  {
    id: 'res2',
    book: MOCK_BOOKS[10],
    reservedDate: '2026-09-12',
    expiryDate: '2026-10-12',
    queuePosition: 3,
    status: 'pending',
  },
  {
    id: 'res3',
    book: MOCK_BOOKS[8],
    reservedDate: '2026-09-05',
    expiryDate: '2026-10-05',
    queuePosition: 2,
    status: 'pending',
  },
];

// ============================================================
// Book Requests
// ============================================================
export const MOCK_REQUESTS: BookRequest[] = [
  {
    id: 'req1',
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    isbn: '978-0-262-03561-3',
    reason: 'Required for my Machine Learning course project.',
    status: 'approved',
    submittedDate: '2026-08-15',
    notes: 'Will be available in 2-3 weeks.',
  },
  {
    id: 'req2',
    title: 'Principles of Neural Science',
    author: 'Eric R. Kandel',
    reason: 'Essential for Neuroscience elective studies.',
    status: 'pending',
    submittedDate: '2026-09-10',
  },
  {
    id: 'req3',
    title: 'Microeconomics',
    author: 'Paul Krugman',
    reason: 'Supplementary reading for Economics course.',
    status: 'rejected',
    submittedDate: '2026-07-20',
    notes: 'Similar title already available in the catalog.',
  },
];

// ============================================================
// Digital Library
// ============================================================
export const MOCK_DIGITAL: DigitalBook[] = [
  {
    id: 'dig1',
    book: MOCK_BOOKS[0],
    addedDate: '2026-08-01',
    lastRead: '2026-09-14',
    progress: 45,
    bookmarked: true,
    currentPage: 582,
  },
  {
    id: 'dig2',
    book: MOCK_BOOKS[3],
    addedDate: '2026-07-15',
    lastRead: '2026-09-10',
    progress: 80,
    bookmarked: false,
    currentPage: 170,
  },
  {
    id: 'dig3',
    book: MOCK_BOOKS[4],
    addedDate: '2026-09-01',
    lastRead: '2026-09-08',
    progress: 15,
    bookmarked: true,
    currentPage: 66,
  },
  {
    id: 'dig4',
    book: MOCK_BOOKS[5],
    addedDate: '2026-06-01',
    lastRead: '2026-06-20',
    progress: 100,
    bookmarked: false,
    currentPage: 336,
  },
];

// ============================================================
// Wishlist
// ============================================================
export const MOCK_WISHLIST: Book[] = [
  MOCK_BOOKS[2],
  MOCK_BOOKS[6],
  MOCK_BOOKS[9],
  MOCK_BOOKS[11],
];

// ============================================================
// Reviews
// ============================================================
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev1',
    book: MOCK_BOOKS[5],
    rating: 5,
    comment: 'Absolutely transformative. Every aspiring entrepreneur should read this. The build-measure-learn loop changed how I think about projects.',
    date: '2026-07-25',
    helpful: 12,
  },
  {
    id: 'rev2',
    book: MOCK_BOOKS[4],
    rating: 4,
    comment: 'A sweeping narrative of human history, though occasionally oversimplifies complex events. Still a fascinating read for anyone curious about where we came from.',
    date: '2026-07-05',
    helpful: 8,
  },
];

// ============================================================
// Notifications
// ============================================================
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Book Ready for Pickup',
    description: '"Clean Code" is ready for pickup at the main circulation desk. Please collect within 3 days.',
    time: '30 minutes ago',
    isUnread: true,
    type: 'reservation',
    icon: 'fas fa-check-circle',
  },
  {
    id: 'n2',
    title: 'Overdue: A Brief History of Time',
    description: 'Your borrowed copy of "A Brief History of Time" is 3 days overdue. Please return it to avoid additional fines.',
    time: '2 hours ago',
    isUnread: true,
    type: 'due',
    icon: 'fas fa-exclamation-circle',
  },
  {
    id: 'n3',
    title: 'Book Request Approved',
    description: 'Your request for "Deep Learning" by Ian Goodfellow has been approved. The library is acquiring a copy.',
    time: '1 day ago',
    isUnread: true,
    type: 'request',
    icon: 'fas fa-thumbs-up',
  },
  {
    id: 'n4',
    title: 'Due Reminder: Introduction to Algorithms',
    description: 'Your copy of "Introduction to Algorithms" is due in 7 days.',
    time: '3 days ago',
    isUnread: false,
    type: 'due',
    icon: 'fas fa-clock',
  },
  {
    id: 'n5',
    title: 'New Books in Computer Science',
    description: '12 new books have been added to the Computer Science collection this week.',
    time: '5 days ago',
    isUnread: false,
    type: 'system',
    icon: 'fas fa-book',
  },
];

// ============================================================
// Recent Activity
// ============================================================
export const MOCK_ACTIVITY: Activity[] = [
  { id: 'a1', type: 'reserved', description: 'Reserved "Clean Code" — now ready for pickup.', time: '30m ago', icon: 'fas fa-bookmark' },
  { id: 'a2', type: 'borrowed', description: 'Borrowed "To Kill a Mockingbird"', time: '5 days ago', icon: 'fas fa-book-reader' },
  { id: 'a3', type: 'returned', description: 'Returned "The Lean Startup"', time: '3 weeks ago', icon: 'fas fa-undo-alt' },
  { id: 'a4', type: 'reviewed', description: 'Left a 5-star review for "The Lean Startup"', time: '3 weeks ago', icon: 'fas fa-star' },
  { id: 'a5', type: 'requested', description: 'Requested "Deep Learning" by Ian Goodfellow', time: '1 month ago', icon: 'fas fa-plus-circle' },
];

// ============================================================
// Student Profile
// ============================================================
export const MOCK_STUDENT = {
  id: 'STU-2024-0440',
  name: 'Sakib Shourov',
  email: 'sakib.shourov@university.edu',
  department: 'Computer Science',
  phone: '+880 1700 000440',
  joinDate: '2024-01-15',
  membershipExpiry: '2027-01-14',
  totalBorrowed: 24,
  currentlyBorrowed: 3,
  totalReviews: 2,
  fines: 0.00,
};

export const MOCK_PERMISSIONS = {
  BOOK_VIEW: true,
  BOOK_CREATE: true,
  BOOK_UPDATE: true,
  BOOK_ARCHIVE: true,

  COPY_VIEW: true,
  COPY_CREATE: true,
  COPY_UPDATE: true,

  CATEGORY_MANAGE: true,
  AUTHOR_MANAGE: true,
  PUBLISHER_MANAGE: true,

  STUDENT_VIEW: true,
  STUDENT_UPDATE: true,

  BORROW_VIEW: true,
  BORROW_CREATE: true,
  BORROW_RENEW: true,

  RETURN_VIEW: true,
  RETURN_CREATE: true,

  RESERVATION_VIEW: true,
  RESERVATION_APPROVE: true,
  RESERVATION_CANCEL: true,

  REQUEST_VIEW: true,
  REQUEST_APPROVE: true,
  REQUEST_REJECT: true,

  FINE_VIEW: true,
  FINE_CREATE: true,
  FINE_UPDATE: true,
  FINE_WAIVE: true,

  EBOOK_VIEW: true,
  EBOOK_UPLOAD: true,
  EBOOK_UPDATE: true,

  REPORT_VIEW: true,
  REPORT_EXPORT: true,

  NOTIFICATION_SEND: true,
  ACTIVITY_LOG_VIEW: true,
};

export const MOCK_MODERATOR = {
  id: 'MOD9001',
  name: 'Sarah Librarian',
  role: 'Chief Librarian',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
};

export const MOCK_INVENTORY = [
  { id: 'C-001', bookId: 'b1', barcode: '10000001', qrCode: 'QR-001', shelf: '2A', rack: 'R1', condition: 'Good', status: 'Available' },
  { id: 'C-002', bookId: 'b1', barcode: '10000002', qrCode: 'QR-002', shelf: '2A', rack: 'R1', condition: 'Fair', status: 'Checked Out' },
  { id: 'C-003', bookId: 'b2', barcode: '10000003', qrCode: 'QR-003', shelf: '3B', rack: 'R2', condition: 'Excellent', status: 'Available' },
];

export const MOCK_ADMIN = {
  id: 'ADM001',
  name: 'System Administrator',
  role: 'Administrator',
  avatar: 'https://i.pravatar.cc/150?u=admin',
};

export const MOCK_USERS = [
  { ...MOCK_STUDENT, role: 'Student', status: 'Active' },
  { id: 'MOD9001', name: 'Sarah Librarian', email: 'sarah@bookgrid.edu', phone: '+1 987 654 321', role: 'Moderator', status: 'Active' },
  { id: 'STU1002', name: 'Jane Smith', email: 'jane@bookgrid.edu', phone: '+1 555 123 456', role: 'Student', status: 'Suspended' },
  { id: 'ADM001', name: 'System Administrator', email: 'admin@bookgrid.edu', phone: '+1 888 999 000', role: 'Administrator', status: 'Active' },
  { id: 'STU1003', name: 'John Doe', email: 'john@bookgrid.edu', phone: '+1 444 333 222', role: 'Student', status: 'Blocked' },
];

export const MOCK_ROLES = [
  { id: 'r1', name: 'Administrator', users: 2, type: 'System' },
  { id: 'r2', name: 'Moderator', users: 15, type: 'System' },
  { id: 'r3', name: 'Student', users: 1250, type: 'System' },
  { id: 'r4', name: 'Student Assistant', users: 8, type: 'Custom' },
];

export const MOCK_BORROWING_TRENDS = [
  { name: 'Mon', count: 120 },
  { name: 'Tue', count: 145 },
  { name: 'Wed', count: 110 },
  { name: 'Thu', count: 180 },
  { name: 'Fri', count: 210 },
  { name: 'Sat', count: 85 },
  { name: 'Sun', count: 60 },
];

export const MOCK_POPULAR_CATEGORIES = [
  { name: 'Computer Science', value: 400 },
  { name: 'Mathematics', value: 300 },
  { name: 'Physics', value: 200 },
  { name: 'Fiction', value: 150 },
];

export const MOCK_REVENUE_TRENDS = [
  { month: 'Jan', amount: 120 },
  { month: 'Feb', amount: 80 },
  { month: 'Mar', amount: 150 },
  { month: 'Apr', amount: 90 },
  { month: 'May', amount: 200 },
  { month: 'Jun', amount: 175 },
];

export const MOCK_USER_DISTRIBUTION = [
  { name: 'Students', value: 1250 },
  { name: 'Moderators', value: 15 },
  { name: 'Administrators', value: 2 },
];


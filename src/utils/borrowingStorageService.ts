// ============================================================
// BookGrid — Borrowing Ledger & Circulation Management Service
// ============================================================

export interface BorrowingRecord {
  id: string; // Transaction ID, e.g. "TXN-8E6E3C7F"
  bookId: string;
  bookTitle: string;
  author?: string;
  isbn?: string;
  barcode?: string;
  coverImage?: string;
  pdfUrl?: string;
  studentId: string; // e.g. "STU-2024-1440"
  studentName: string; // e.g. "Sakib Shourov"
  studentEmail: string; // e.g. "sakib-shourov@gmail.com"
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD if returned
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'RENEWED';
  condition?: 'Good' | 'Fair' | 'Damaged';
  fineAmount?: number;
}

const STORAGE_KEY = 'bookgrid_borrowings_ledger';

const SEED_BORROWINGS: BorrowingRecord[] = [
  {
    id: 'TXN-8E6E3C7F-9785',
    bookId: 'b1',
    bookTitle: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0-262-03384-8',
    barcode: 'BC-978-0-262-03384-8-1',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    studentId: 'STU-2024-1440',
    studentName: 'Sakib Shourov',
    studentEmail: 'sakib-shourov@gmail.com',
    borrowDate: '2026-09-10',
    dueDate: '2026-09-25',
    status: 'ISSUED'
  },
  {
    id: 'TXN-2B3A2FB5-8BB3',
    bookId: 'b2',
    bookTitle: 'Java: The Complete Reference',
    author: 'Herbert Schildt',
    isbn: '465485134',
    barcode: 'BC-465485134-1',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    studentId: 'STU-2024-1440',
    studentName: 'Sakib Shourov',
    studentEmail: 'sakib-shourov@gmail.com',
    borrowDate: '2026-09-14',
    dueDate: '2026-10-08',
    status: 'ISSUED'
  },
  {
    id: 'TXN-08D3843B-AFB1',
    bookId: 'b3',
    bookTitle: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0-553-38016-3',
    barcode: 'BC-978-0-553-38016-3-1',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    studentId: 'STU-2024-1440',
    studentName: 'Sakib Shourov',
    studentEmail: 'sakib-shourov@gmail.com',
    borrowDate: '2026-08-15',
    dueDate: '2026-09-15',
    returnDate: '2026-09-24',
    status: 'RETURNED',
    condition: 'Good',
    fineAmount: 2.50
  },
  {
    id: 'TXN-4F8912A3-11C4',
    bookId: 'b4',
    bookTitle: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235089-1',
    barcode: 'BC-978-0-13-235089-1-2',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    studentId: 'STD-102',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.j@university.edu',
    borrowDate: '2026-09-01',
    dueDate: '2026-09-22',
    status: 'ISSUED'
  }
];

export const BorrowingStorageService = {
  getBorrowings: (): BorrowingRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BORROWINGS));
        return SEED_BORROWINGS;
      }
      return JSON.parse(stored);
    } catch (e) {
      return SEED_BORROWINGS;
    }
  },

  saveBorrowings: (records: BorrowingRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {}
  },

  addBorrowing: (data: Partial<BorrowingRecord> & { bookId: string; bookTitle: string }): BorrowingRecord => {
    const list = BorrowingStorageService.getBorrowings();
    const today = new Date().toISOString().split('T')[0];

    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    const dueDateStr = defaultDue.toISOString().split('T')[0];

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newRecord: BorrowingRecord = {
      id: data.id || `TXN-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      author: data.author || 'Library Catalog',
      isbn: data.isbn || 'N/A',
      barcode: data.barcode || `BC-${data.isbn || data.bookId}-1`,
      coverImage: data.coverImage,
      pdfUrl: data.pdfUrl,
      studentId: data.studentId || 'STU-2024-1440',
      studentName: data.studentName || 'Sakib Shourov',
      studentEmail: data.studentEmail || 'sakib-shourov@gmail.com',
      borrowDate: data.borrowDate || today,
      dueDate: data.dueDate || dueDateStr,
      status: 'ISSUED'
    };

    const updated = [newRecord, ...list];
    BorrowingStorageService.saveBorrowings(updated);
    return newRecord;
  },

  returnBorrowing: (id: string, condition: 'Good' | 'Fair' | 'Damaged' = 'Good', fineAmount: number = 0): BorrowingRecord | null => {
    const list = BorrowingStorageService.getBorrowings();
    const today = new Date().toISOString().split('T')[0];
    const index = list.findIndex(b => b.id.toLowerCase() === id.toLowerCase());

    if (index === -1) return null;

    list[index] = {
      ...list[index],
      status: 'RETURNED',
      returnDate: today,
      condition,
      fineAmount
    };

    BorrowingStorageService.saveBorrowings(list);
    return list[index];
  },

  renewBorrowing: (id: string, newDueDate?: string): BorrowingRecord | null => {
    const list = BorrowingStorageService.getBorrowings();
    const index = list.findIndex(b => b.id.toLowerCase() === id.toLowerCase());

    if (index === -1) return null;

    let targetDueDate = newDueDate;
    if (!targetDueDate) {
      const current = new Date(list[index].dueDate || Date.now());
      current.setDate(current.getDate() + 14);
      targetDueDate = current.toISOString().split('T')[0];
    }

    list[index] = {
      ...list[index],
      dueDate: targetDueDate,
      status: 'RENEWED'
    };

    BorrowingStorageService.saveBorrowings(list);
    return list[index];
  },

  getStudentActiveBorrowings: (studentIdentifier: string): BorrowingRecord[] => {
    const list = BorrowingStorageService.getBorrowings();
    const q = studentIdentifier.toLowerCase().trim();
    return list.filter(b => 
      b.status !== 'RETURNED' && (
        b.studentId.toLowerCase() === q ||
        b.studentEmail.toLowerCase() === q ||
        b.studentName.toLowerCase().includes(q)
      )
    );
  },

  getStudentAllBorrowings: (studentIdentifier: string): BorrowingRecord[] => {
    const list = BorrowingStorageService.getBorrowings();
    const q = studentIdentifier.toLowerCase().trim();
    return list.filter(b => 
      b.studentId.toLowerCase() === q ||
      b.studentEmail.toLowerCase() === q ||
      b.studentName.toLowerCase().includes(q)
    );
  },

  getTodayBorrowingsCount: (): number => {
    const list = BorrowingStorageService.getBorrowings();
    const today = new Date().toISOString().split('T')[0];
    return list.filter(b => b.borrowDate === today).length;
  },

  getTodayReturnsCount: (): number => {
    const list = BorrowingStorageService.getBorrowings();
    const today = new Date().toISOString().split('T')[0];
    return list.filter(b => b.returnDate === today).length;
  },

  getStats: () => {
    const list = BorrowingStorageService.getBorrowings();
    const today = new Date().toISOString().split('T')[0];

    const active = list.filter(b => b.status !== 'RETURNED');
    const todayBorrows = list.filter(b => b.borrowDate === today);
    const todayReturns = list.filter(b => b.returnDate === today);
    const overdue = active.filter(b => new Date(b.dueDate) < new Date(today));

    return {
      totalBorrowings: list.length,
      activeBorrowings: active.length,
      todayBorrowings: todayBorrows.length,
      todayReturns: todayReturns.length,
      overdueBorrowings: overdue.length
    };
  }
};

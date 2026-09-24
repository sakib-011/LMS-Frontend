// ============================================================
// BookGrid — Fines & Penalties Ledger Management Service
// ============================================================

export interface FineRecord {
  id: string; // e.g. "FINE-9821"
  studentId: string; // e.g. "STU-2024-1440"
  studentName: string; // e.g. "Sakib Shourov"
  studentEmail: string; // e.g. "sakib-shourov@gmail.com"
  bookId?: string;
  bookTitle?: string;
  isbn?: string;
  reason: string; // e.g. "Late Return Fee" or "Damaged Book Repair"
  amount: number; // e.g. 2.50
  status: 'Unpaid' | 'Paid' | 'Waived';
  issueDate: string; // e.g. "2026-09-24"
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

const STORAGE_KEY = 'bookgrid_fines_ledger';

const INITIAL_FINES: FineRecord[] = [
  {
    id: 'FINE-1001',
    studentId: 'STU-2024-1440',
    studentName: 'Sakib Shourov',
    studentEmail: 'sakib-shourov@gmail.com',
    bookId: 'b3',
    bookTitle: 'A Brief History of Time',
    isbn: '978-0-553-38016-3',
    reason: 'Late Return Fee (9 days overdue)',
    amount: 2.50,
    status: 'Unpaid',
    issueDate: '2026-09-24'
  },
  {
    id: 'FINE-1002',
    studentId: 'STD-102',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.j@university.edu',
    bookId: 'b4',
    bookTitle: 'Clean Code',
    isbn: '978-0-13-235089-1',
    reason: 'Damaged Cover Fee',
    amount: 5.00,
    status: 'Unpaid',
    issueDate: '2026-09-20'
  },
  {
    id: 'FINE-1000',
    studentId: 'STU-2024-1440',
    studentName: 'Sakib Shourov',
    studentEmail: 'sakib-shourov@gmail.com',
    bookId: 'b1',
    bookTitle: 'Introduction to Algorithms',
    isbn: '978-0-262-03384-8',
    reason: 'Late Return Fee',
    amount: 4.00,
    status: 'Paid',
    issueDate: '2026-08-10',
    paidDate: '2026-08-12',
    paymentMethod: 'Cash at Desk'
  }
];

export const FineStorageService = {
  /**
   * Gets all fine records from persistent ledger
   */
  getFines: (): FineRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FINES));
        return INITIAL_FINES;
      }
      return JSON.parse(stored);
    } catch (e) {
      return INITIAL_FINES;
    }
  },

  /**
   * Saves fines ledger
   */
  saveFines: (fines: FineRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fines));
    } catch (e) {}
  },

  /**
   * Assesses and adds a new fine to the persistent ledger
   */
  addFine: (fineData: Omit<FineRecord, 'id' | 'issueDate'> & { id?: string; issueDate?: string }): FineRecord => {
    const fines = FineStorageService.getFines();
    const newRecord: FineRecord = {
      id: fineData.id || `FINE-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: fineData.studentId || 'STU-2024-1440',
      studentName: fineData.studentName || 'Sakib Shourov',
      studentEmail: fineData.studentEmail || 'sakib-shourov@gmail.com',
      bookId: fineData.bookId,
      bookTitle: fineData.bookTitle || 'Library Material',
      isbn: fineData.isbn,
      reason: fineData.reason || 'Overdue Fine',
      amount: fineData.amount > 0 ? fineData.amount : 2.50,
      status: fineData.status || 'Unpaid',
      issueDate: fineData.issueDate || new Date().toISOString().split('T')[0],
      paidDate: fineData.status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: fineData.paymentMethod,
      notes: fineData.notes
    };

    const updated = [newRecord, ...fines];
    FineStorageService.saveFines(updated);
    return newRecord;
  },

  /**
   * Updates fine status (Unpaid, Paid, Waived) and records payment method
   */
  updateFineStatus: (fineId: string, status: 'Unpaid' | 'Paid' | 'Waived', paymentMethod?: string): FineRecord | null => {
    const fines = FineStorageService.getFines();
    const index = fines.findIndex(f => f.id.toLowerCase() === fineId.toLowerCase());
    if (index === -1) return null;

    fines[index] = {
      ...fines[index],
      status,
      paidDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : fines[index].paidDate,
      paymentMethod: paymentMethod || fines[index].paymentMethod
    };

    FineStorageService.saveFines(fines);
    return fines[index];
  },

  /**
   * Returns total unpaid fine amount for a student by Student ID or Email
   */
  getStudentTotalUnpaidFines: (identifier: string): number => {
    const fines = FineStorageService.getFines();
    const q = identifier.toLowerCase().trim();
    return fines
      .filter(f => f.status === 'Unpaid' && (
        f.studentId.toLowerCase() === q ||
        f.studentEmail.toLowerCase() === q ||
        f.studentName.toLowerCase().includes(q)
      ))
      .reduce((sum, f) => sum + (f.amount || 0), 0);
  }
};

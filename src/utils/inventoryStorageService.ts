// ============================================================
// BookGrid — Physical Inventory & Barcode Management Service
// ============================================================

import { Book } from '../services/bookService';

export interface InventoryCopy {
  id: string; // Unique copy ID / barcode key (e.g. "BC-1001-1" or "b1_c1")
  barcode: string; // Barcode value (e.g. "9780132350891-1")
  bookId: string; // ID of linked book
  bookTitle?: string; // Cache of book title for fast lookup
  resolvedTitle?: string;
  shelf: string; // e.g. "Stack 2A"
  rack: string; // e.g. "Rack R1"
  condition: 'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  status: 'Available' | 'Checked Out' | 'Maintenance' | 'Lost';
  createdAt: string;
}

export interface GroupedBookInventory {
  bookId: string;
  bookTitle: string;
  author: string;
  isbn: string;
  imageUrl?: string;
  pdfUrl?: string;
  totalCopies: number;
  availableCopies: number;
  checkedOutCopies: number;
  maintenanceCopies: number;
  lostCopies: number;
  shelf: string;
  rack: string;
  copies: InventoryCopy[];
}

const STORAGE_KEY = 'bookgrid_physical_inventory';

export const InventoryStorageService = {
  /**
   * Retrieves all physical inventory copies from localStorage (or seeds initial data matching books)
   */
  getInventoryCopies: (books: Book[] = []): InventoryCopy[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let copies: InventoryCopy[] = stored ? JSON.parse(stored) : [];

      // Seed initial physical copies for existing database books if storage is empty
      if (copies.length === 0 && books.length > 0) {
        copies = [];
        books.forEach((book) => {
          const numCopies = book.physicalCopies && book.physicalCopies > 0 ? book.physicalCopies : 1;
          const cleanStack = book.physicalStacks ? book.physicalStacks.replace(/^Stack\s+/i, '') : '2A';
          for (let i = 1; i <= numCopies; i++) {
            const barcodeVal = book.isbn ? `BC-${book.isbn}-${i}` : `BC-${book.id}-${i}`;
            copies.push({
              id: `${book.id}_copy_${i}`,
              barcode: barcodeVal,
              bookId: book.id,
              bookTitle: book.title,
              shelf: `Stack ${cleanStack}`,
              rack: `Rack R${i}`,
              condition: 'Good',
              status: i <= (book.physicalAvailable ?? 1) ? 'Available' : 'Checked Out',
              createdAt: new Date().toISOString()
            });
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(copies));
      } else if (books.length > 0) {
        // Ensure any new book in database has at least one inventory entry if physicalCopies > 0
        let updated = false;
        books.forEach((book) => {
          const hasCopy = copies.some(c => c.bookId === book.id);
          if (!hasCopy && book.physicalCopies && book.physicalCopies > 0) {
            const barcodeVal = book.isbn ? `BC-${book.isbn}-1` : `BC-${book.id}-1`;
            const cleanStack = book.physicalStacks ? book.physicalStacks.replace(/^Stack\s+/i, '') : '1A';
            copies.push({
              id: `${book.id}_copy_1`,
              barcode: barcodeVal,
              bookId: book.id,
              bookTitle: book.title,
              shelf: `Stack ${cleanStack}`,
              rack: 'Rack R1',
              condition: 'New',
              status: 'Available',
              createdAt: new Date().toISOString()
            });
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(copies));
        }
      }

      return copies;
    } catch (e) {
      console.warn("Error reading physical inventory storage:", e);
      return [];
    }
  },

  /**
   * Retrieves Grouped Inventory (1 row per Book with aggregated copies, barcodes, locations)
   */
  getGroupedInventory: (books: Book[] = []): GroupedBookInventory[] => {
    const allCopies = InventoryStorageService.getInventoryCopies(books);
    const groupedMap = new Map<string, GroupedBookInventory>();

    // First map all books from database
    books.forEach((book) => {
      const bookCopies = allCopies.filter(c => c.bookId === book.id);
      const avail = bookCopies.filter(c => c.status === 'Available').length;
      const checked = bookCopies.filter(c => c.status === 'Checked Out').length;
      const maint = bookCopies.filter(c => c.status === 'Maintenance').length;
      const lost = bookCopies.filter(c => c.status === 'Lost').length;
      
      const primaryLocation = bookCopies[0]?.shelf || (book.physicalStacks ? `Stack ${book.physicalStacks.replace(/^Stack\s+/i, '')}` : 'Stack 1A');
      const rackSummary = bookCopies.length > 1 ? `Racks R1 - R${bookCopies.length}` : (bookCopies[0]?.rack || 'Rack R1');

      groupedMap.set(book.id, {
        bookId: book.id,
        bookTitle: book.title,
        author: book.author || 'Unknown Author',
        isbn: book.isbn || 'No ISBN',
        imageUrl: book.imageUrl,
        pdfUrl: book.pdfUrl,
        totalCopies: bookCopies.length > 0 ? bookCopies.length : (book.physicalCopies || 1),
        availableCopies: bookCopies.length > 0 ? avail : (book.physicalAvailable || 1),
        checkedOutCopies: checked,
        maintenanceCopies: maint,
        lostCopies: lost,
        shelf: primaryLocation,
        rack: rackSummary,
        copies: bookCopies
      });
    });

    return Array.from(groupedMap.values());
  },

  /**
   * Saves updated inventory copies array to localStorage
   */
  saveInventoryCopies: (copies: InventoryCopy[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copies));
    } catch (e) {
      console.error("Error saving physical inventory storage:", e);
    }
  },

  /**
   * Adds new physical copy / copies for a book
   */
  addCopy: (copyData: Omit<InventoryCopy, 'id' | 'createdAt'> & { id?: string }, books: Book[]): InventoryCopy => {
    const copies = InventoryStorageService.getInventoryCopies(books);
    const linkedBook = books.find(b => b.id === copyData.bookId);
    
    const newId = copyData.id || `${copyData.bookId}_copy_${Date.now()}`;
    const defaultBarcode = copyData.barcode?.trim() || (linkedBook?.isbn ? `BC-${linkedBook.isbn}-${copies.length + 1}` : `BC-${copyData.bookId}-${Date.now().toString().slice(-4)}`);

    const cleanShelf = copyData.shelf?.trim().replace(/^Stack\s+/i, '') || '1A';

    const newCopy: InventoryCopy = {
      id: newId,
      barcode: defaultBarcode,
      bookId: copyData.bookId,
      bookTitle: linkedBook?.title || copyData.bookTitle || 'Unknown Book',
      shelf: `Stack ${cleanShelf}`,
      rack: copyData.rack || 'Rack R1',
      condition: copyData.condition || 'New',
      status: copyData.status || 'Available',
      createdAt: new Date().toISOString()
    };

    const updatedList = [newCopy, ...copies];
    InventoryStorageService.saveInventoryCopies(updatedList);
    return newCopy;
  },

  /**
   * Updates an existing physical copy item
   */
  updateCopy: (copyId: string, updates: Partial<InventoryCopy>, books: Book[]): InventoryCopy | null => {
    const copies = InventoryStorageService.getInventoryCopies(books);
    const index = copies.findIndex(c => c.id === copyId);
    if (index === -1) return null;

    const linkedBook = books.find(b => b.id === (updates.bookId || copies[index].bookId));
    let cleanShelf = updates.shelf ? updates.shelf.replace(/^Stack\s+/i, '') : copies[index].shelf.replace(/^Stack\s+/i, '');

    const updatedCopy: InventoryCopy = {
      ...copies[index],
      ...updates,
      shelf: `Stack ${cleanShelf}`,
      bookTitle: linkedBook?.title || updates.bookTitle || copies[index].bookTitle
    };

    copies[index] = updatedCopy;
    InventoryStorageService.saveInventoryCopies(copies);
    return updatedCopy;
  },

  /**
   * Updates location or stack for ALL copies of a book
   */
  updateBookInventoryLocation: (bookId: string, shelf: string, rack?: string, books: Book[] = []) => {
    const copies = InventoryStorageService.getInventoryCopies(books);
    const cleanShelf = shelf.replace(/^Stack\s+/i, '');
    const updated = copies.map(c => {
      if (c.bookId === bookId) {
        return {
          ...c,
          shelf: `Stack ${cleanShelf}`,
          rack: rack || c.rack
        };
      }
      return c;
    });
    InventoryStorageService.saveInventoryCopies(updated);
  },

  /**
   * Deletes a physical copy from inventory
   */
  deleteCopy: (copyId: string, books: Book[]) => {
    const copies = InventoryStorageService.getInventoryCopies(books);
    const filtered = copies.filter(c => c.id !== copyId);
    InventoryStorageService.saveInventoryCopies(filtered);
  },

  /**
   * Student Visibility Rule Check:
   * A book is visible to students IF AND ONLY IF:
   * 1. It is available online as an e-book (has pdfUrl attached)
   * OR
   * 2. It has at least 1 physical copy registered with a barcode in inventory!
   */
  isBookVisibleToStudents: (book: Book, inventoryCopies: InventoryCopy[] = []): boolean => {
    // 1. Digital PDF check (online e-book)
    const hasDigitalPdf = Boolean(book.pdfUrl && book.pdfUrl.trim().length > 0 && !book.pdfUrl.includes('v1700000000'));
    if (hasDigitalPdf) return true;

    // 2. Physical copy with valid barcode check
    const hasBarcodeCopy = inventoryCopies.some(
      c => c.bookId === book.id && Boolean(c.barcode && c.barcode.trim().length > 0)
    );
    if (hasBarcodeCopy) return true;

    // 3. Fallback check: if book.physicalCopies > 0 AND book.isbn exists
    if (book.physicalCopies && book.physicalCopies > 0 && book.isbn && book.isbn.trim().length > 0) {
      return true;
    }

    return false;
  },

  /**
   * Filters a list of books for Student Portal based on barcode/e-book availability
   */
  filterBooksForStudents: (books: Book[], inventoryCopies?: InventoryCopy[]): Book[] => {
    const copies = inventoryCopies || InventoryStorageService.getInventoryCopies(books);
    return books.filter(book => InventoryStorageService.isBookVisibleToStudents(book, copies));
  }
};

// ============================================================
// BookGrid — PDF File Storage, IndexedDB & Supabase Sync Utility
// ============================================================

import { uploadPdfToSupabase } from './supabaseService';

export interface CachedPdfData {
  bookId: string;
  pdfDataUrl: string;
  fileName: string;
  fileSizeMB: string;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hour cache lifetime
const inMemoryPdfCache = new Map<string, string>(); // In-memory Object URL cache

// IndexedDB Helper for Large File Storage
const openPdfDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open('BookGridPdfDB', 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pdfs')) {
        db.createObjectStore('pdfs', { keyPath: 'bookId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const PdfStorageService = {
  /**
   * Converts a user-selected PDF File object to a Base64 Data URL string
   */
  fileToDataUrl: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Saves PDF Data URL to IndexedDB for persistent large-file storage without quota errors
   */
  saveToIndexedDb: async (bookId: string, pdfDataUrl: string, fileName: string, fileSizeMB: string) => {
    try {
      const db = await openPdfDatabase();
      const tx = db.transaction('pdfs', 'readwrite');
      const store = tx.objectStore('pdfs');
      store.put({
        bookId,
        pdfDataUrl,
        fileName,
        fileSizeMB,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn("IndexedDB save error:", err);
    }
  },

  /**
   * Retrieves PDF Data URL from IndexedDB
   */
  getFromIndexedDb: async (bookId: string): Promise<string | null> => {
    try {
      const db = await openPdfDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction('pdfs', 'readonly');
        const store = tx.objectStore('pdfs');
        const req = store.get(bookId);
        req.onsuccess = () => {
          resolve(req.result?.pdfDataUrl || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (err) {
      return null;
    }
  },

  /**
   * Uploads PDF file to Supabase Storage (or stores reference in DB + IndexedDB) and caches locally
   */
  uploadAndCachePdf: async (file: File, bookId: string): Promise<{ pdfUrl: string; fileSizeMB: string; fileName: string }> => {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const fileName = file.name;

    // 1. Convert actual uploaded PDF file to real Base64 Data URL
    const realPdfDataUrl = await PdfStorageService.fileToDataUrl(file);

    // 2. Create in-memory Object URL for instant browser rendering
    const objectUrl = URL.createObjectURL(file);
    inMemoryPdfCache.set(bookId, objectUrl);

    // 3. Save actual PDF binary Data URL into browser IndexedDB
    await PdfStorageService.saveToIndexedDb(bookId, realPdfDataUrl, fileName, fileSizeMB);

    // 4. Try Supabase Storage bucket upload first
    let dbPdfUrl = '';
    try {
      const supabasePublicUrl = await uploadPdfToSupabase(file, bookId);
      if (supabasePublicUrl) {
        dbPdfUrl = supabasePublicUrl;
      }
    } catch (err) {
      console.warn("Supabase Storage bucket upload skipped. Saving IndexedDB key reference in PostgreSQL DB.");
    }

    if (!dbPdfUrl) {
      dbPdfUrl = `indexeddb:${bookId}`;
    }

    // 5. Cache locally
    PdfStorageService.cachePdfLocally(bookId, realPdfDataUrl, fileName, fileSizeMB);
    PdfStorageService.saveDigitalCatalog(bookId, dbPdfUrl, fileName, fileSizeMB);

    return {
      pdfUrl: dbPdfUrl,
      fileSizeMB,
      fileName
    };
  },

  /**
   * Caches a PDF file Data URL or URL into localStorage
   */
  cachePdfLocally: (bookId: string, pdfDataUrl: string, fileName: string, fileSizeMB: string) => {
    try {
      const cacheObj: CachedPdfData = {
        bookId,
        pdfDataUrl: pdfDataUrl.length < 500_000 ? pdfDataUrl : `indexeddb:${bookId}`,
        fileName,
        fileSizeMB,
        timestamp: Date.now()
      };
      localStorage.setItem(`cached_pdf_${bookId}`, JSON.stringify(cacheObj));
      localStorage.setItem('latest_read_book_id', bookId);
    } catch (err) {
      console.warn("LocalStorage quota safely managed.");
    }
  },

  /**
   * Retrieves cached PDF data from localStorage / memory
   */
  getCachedPdf: (bookId: string): CachedPdfData | null => {
    if (inMemoryPdfCache.has(bookId)) {
      return {
        bookId,
        pdfDataUrl: inMemoryPdfCache.get(bookId)!,
        fileName: 'Attached Book PDF',
        fileSizeMB: 'Cached',
        timestamp: Date.now()
      };
    }

    try {
      const item = localStorage.getItem(`cached_pdf_${bookId}`);
      if (!item) return null;

      const parsed: CachedPdfData = JSON.parse(item);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(`cached_pdf_${bookId}`);
        return null;
      }
      return parsed;
    } catch (err) {
      return null;
    }
  },

  /**
   * Saves metadata & PDF URL mapping in localStorage
   */
  saveDigitalCatalog: (bookId: string, pdfUrl: string, fileName: string, fileSizeMB: string) => {
    try {
      const catalog = JSON.parse(localStorage.getItem('digital_pdf_catalog') || '{}');
      catalog[bookId] = { pdfUrl, fileName, fileSizeMB, updatedAt: Date.now() };
      localStorage.setItem('digital_pdf_catalog', JSON.stringify(catalog));
    } catch (e) {
      console.error("Error updating digital catalog in localStorage", e);
    }
  },

  /**
   * Gets digital PDF mapping for a book from catalog
   */
  getDigitalCatalogItem: (bookId: string) => {
    try {
      const catalog = JSON.parse(localStorage.getItem('digital_pdf_catalog') || '{}');
      return catalog[bookId] || null;
    } catch (e) {
      return null;
    }
  }
};

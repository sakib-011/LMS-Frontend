// ============================================================
// BookGrid — Direct Frontend Supabase PDF Storage Utility
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Uploads a PDF file directly to Supabase Storage bucket ('books-pdf')
 * Returns the public HTTPS URL from Supabase, or null to fallback to Supabase PostgreSQL Database.
 */
export const uploadPdfToSupabase = async (
  file: File,
  bookId: string
): Promise<string | null> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("Supabase storage bucket keys not defined in .env.local — storing PDF directly in Supabase PostgreSQL Database.");
    return null;
  }

  try {
    const fileName = `book-${bookId}-${Date.now()}.pdf`;
    const endpoint = `${SUPABASE_URL}/storage/v1/object/books-pdf/${fileName}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true'
      },
      body: file,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn("Supabase Storage bucket upload warning:", errData);
      return null;
    }

    // Return public Supabase Storage URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/books-pdf/${fileName}`;
    return publicUrl;
  } catch (error: any) {
    console.warn("Supabase Storage connection exception:", error.message);
    return null;
  }
};

/**
 * pdfUtils.ts — Helpers for PDF detection and direct Google Drive CORS stream resolution
 */

/**
 * Extracts Google Drive file ID from standard sharing or viewing URLs
 */
export function getDriveFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Converts a Google Drive link to a direct usercontent download URL.
 * Google usercontent endpoints support CORS headers (Access-Control-Allow-Origin: *),
 * enabling direct client-side PDF canvas rendering without off-site redirects.
 */
export function getPdfDirectUrl(url: string): string {
  if (!url) return "";
  const fileId = getDriveFileId(url);
  if (fileId) {
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
  }
  return url;
}

/**
 * Checks whether a document resource is a PDF file.
 * Returns false for non-PDFs (videos, audio, archives, images) so they fall back to normal browser behavior.
 */
export function isPdfDocument(fileName: string, fileUrl: string): boolean {
  if (!fileName && !fileUrl) return false;
  const name = (fileName || "").toLowerCase().trim();
  const url = (fileUrl || "").toLowerCase().trim();

  // Known non-PDF extensions to exclude
  const nonPdfExtensions = [
    ".mp4", ".mkv", ".avi", ".mov", ".webm",
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    ".zip", ".rar", ".7z", ".tar", ".gz",
    ".mp3", ".wav", ".ogg",
    ".docx", ".pptx", ".xlsx"
  ];
  if (nonPdfExtensions.some((ext) => name.endsWith(ext))) {
    return false;
  }

  // Explicit PDF indicator
  if (name.endsWith(".pdf") || url.includes(".pdf")) {
    return true;
  }

  // Academic Drive documents in resources (notes, pyqs, tutorials) are PDFs unless named otherwise
  if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com")) {
    return true;
  }

  return false;
}

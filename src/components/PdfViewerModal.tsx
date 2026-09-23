import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";
import { getDriveEmbedUrl, getDriveDownloadUrl } from "../lib/pdfUtils";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
}: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Derive the embeddable preview URL (Google Drive /preview format) and direct download URL
  const embedUrl = getDriveEmbedUrl(fileUrl);
  const downloadUrl = getDriveDownloadUrl(fileUrl);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reset loading / error state on fileUrl change
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setHasError(false);
    }
  }, [isOpen, fileUrl]);

  // Keyboard navigation: Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/60 backdrop-blur-md select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Document Viewer - ${fileName}`}
    >
      {/* ── Top Bar / Header ── */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-surface border-b border-outline-variant flex items-center justify-between gap-3 z-20 flex-shrink-0 shadow-xs">
        {/* Left: Document info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[60%] sm:max-w-[70%]">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-on-surface truncate" title={fileName}>
              {fileName}
            </h2>
            <p className="text-[10px] text-on-surface-variant hidden sm:block">In-Site Document Viewer</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Download direct file */}
          <a
            href={downloadUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 sm:h-9 px-3 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-center gap-1.5 text-on-surface hover:text-primary hover:border-primary/40 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Download document"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Download</span>
          </a>

          {/* Close modal */}
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Close viewer (Esc)"
            aria-label="Close viewer"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </header>

      {/* ── Main Viewport with Embedded Drive Preview Iframe ── */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-surface-dim">
        {/* Loading Spinner */}
        {loading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-dim/95 backdrop-blur-xs z-10 pointer-events-none">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-on-surface">Opening document preview…</p>
            <p className="text-xs text-on-surface-variant">Loading embedded Google Drive viewer</p>
          </div>
        )}

        {/* Error Fallback — ONLY shown if PDF is not showing */}
        {hasError ? (
          <div className="glass-card border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md text-center space-y-4 shadow-xl z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface mb-1">Cannot Load Embedded Preview</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This document requires direct Google Drive access or private sign-in permissions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open on Google Drive
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-6xl flex flex-col items-center justify-center">
            <div className="relative w-full h-full rounded-2xl border border-outline-variant shadow-xl bg-surface overflow-hidden">
              <iframe
                src={embedUrl}
                title={`Preview - ${fileName}`}
                className="w-full h-full border-0 block"
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setHasError(true);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

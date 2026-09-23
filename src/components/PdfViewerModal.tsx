import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";
import { getDriveEmbedUrl } from "../lib/pdfUtils";

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

  // Derive the embeddable preview URL (Google Drive /preview format)
  const embedUrl = getDriveEmbedUrl(fileUrl);

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
      className="fixed inset-0 z-[200] flex flex-col bg-[#050811]/95 backdrop-blur-xl select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Document Viewer - ${fileName}`}
    >
      {/* ── Top Bar / Header ── */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[#0c1424] border-b border-[#23324f] flex items-center justify-between gap-3 z-20 flex-shrink-0 shadow-lg">
        {/* Left: Document info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[65%] sm:max-w-[70%]">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate" title={fileName}>
              {fileName}
            </h2>
            <p className="text-[10px] text-[#8ca0ba] hidden sm:block">In-Site Document Viewer</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Download direct file */}
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#23324f] bg-[#131d33] flex items-center justify-center text-[#8ca0ba] hover:text-primary hover:border-primary/40 active:scale-95 transition-all cursor-pointer"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Open on Google Drive in new tab */}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#23324f] bg-[#131d33] flex items-center justify-center text-[#8ca0ba] hover:text-white hover:border-[#8ca0ba]/40 active:scale-95 transition-all cursor-pointer"
            title="Open in Google Drive"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close modal */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer ml-1"
            title="Close viewer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Viewport with Embedded Drive Preview Iframe ── */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-[#070b14]">
        {/* Loading Spinner */}
        {loading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070b14] z-10 pointer-events-none">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-white">Opening document preview…</p>
            <p className="text-xs text-[#6b7e94]">Loading embedded Google Drive viewer</p>
          </div>
        )}

        {/* Error Fallback */}
        {hasError ? (
          <div className="glass-card border border-red-500/30 bg-[#160e15] rounded-2xl p-6 sm:p-8 max-w-md text-center space-y-4 shadow-2xl z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Cannot Load Embedded Preview</h3>
              <p className="text-xs text-[#a0949d] leading-relaxed">
                This document requires direct Google Drive access or private sign-in permissions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-primary text-[#002114] rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open on Google Drive
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-[#23151f] border border-[#3b2334] text-white rounded-xl font-bold text-xs hover:bg-[#321c2b] active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={`Preview - ${fileName}`}
            className="w-full h-full max-w-6xl rounded-2xl border border-[#23324f] shadow-2xl bg-[#0c1424]"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setHasError(true);
            }}
          />
        )}
      </main>
    </div>
  );
}

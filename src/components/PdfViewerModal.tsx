import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Maximize2
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getPdfDirectUrl } from "../lib/pdfUtils";

// Configure pdfjs worker using Vite's asset bundling with CDN fallback
if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

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
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Load PDF document data
  useEffect(() => {
    if (!isOpen || !fileUrl) {
      setPdfDoc(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const directUrl = getPdfDirectUrl(fileUrl);

    (async () => {
      try {
        const response = await fetch(directUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch document (${response.status})`);
        }
        const buffer = await response.arrayBuffer();
        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@6.3.289/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        console.error("PDF loading error:", err);
        setError("Unable to render PDF inline. You can still view it directly on Google Drive.");
        setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [isOpen, fileUrl]);

  // Render active page to canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setPageRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale });

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;
      setPageRendering(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Error rendering PDF page:", err);
      }
      setPageRendering(false);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    if (!loading && pdfDoc) {
      renderPage();
    }
  }, [loading, pdfDoc, currentPage, scale, renderPage]);

  // Page navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1 && !pageRendering) {
      setCurrentPage((prev) => prev - 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages && !pageRendering) {
      setCurrentPage((prev) => prev + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.6));
  };

  const handleResetZoom = () => {
    setScale(1.15);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "=" || e.key === "+") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentPage, numPages, pageRendering, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#050811]/95 backdrop-blur-xl select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`PDF Viewer - ${fileName}`}
    >
      {/* ── Top Bar / Header ── */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[#0c1424] border-b border-[#23324f] flex items-center justify-between gap-2 z-20 flex-shrink-0 shadow-lg">
        {/* Left: Document info */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-[35%] sm:max-w-[40%]">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate" title={fileName}>
              {fileName}
            </h2>
            <p className="text-[10px] text-[#8ca0ba] hidden sm:block">Inline PDF Preview</p>
          </div>
        </div>

        {/* Center: Page Controls & Zoom Controls */}
        {!loading && !error && (
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Page navigation */}
            <div className="flex items-center bg-[#131d33] border border-[#23324f] rounded-xl px-1 py-0.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || pageRendering}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#8ca0ba] hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Previous page (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-2 py-0.5 font-mono text-[11px] sm:text-xs font-bold text-white min-w-[50px] sm:min-w-[65px] text-center select-none">
                <span className="text-primary">{currentPage}</span>
                <span className="text-[#59708f] mx-1">/</span>
                <span>{numPages || 1}</span>
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= numPages || pageRendering}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#8ca0ba] hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Next page (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-[#131d33] border border-[#23324f] rounded-xl px-1 py-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#8ca0ba] hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 sm:px-2 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-[#8ca0ba] hover:text-white transition-colors cursor-pointer select-none"
                title="Reset zoom to 100%"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3.0}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#8ca0ba] hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

          {/* Fallback to Google Drive in new tab */}
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

      {/* ── Main Viewport ── */}
      <main
        ref={containerRef}
        className="flex-1 overflow-auto p-3 sm:p-8 flex items-start justify-center custom-scrollbar bg-[#050811]"
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center my-auto py-20 gap-3 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-white">Loading document preview…</p>
            <p className="text-xs text-[#6b7e94]">Streaming pages from cloud storage</p>
          </div>
        )}

        {/* Error Fallback */}
        {error && !loading && (
          <div className="glass-card border border-red-500/30 bg-[#160e15] rounded-2xl p-6 sm:p-8 max-w-md my-auto text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Cannot Preview Document</h3>
              <p className="text-xs text-[#a0949d] leading-relaxed">
                {error}
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
        )}

        {/* Canvas Render Page */}
        {!loading && !error && (
          <div className="flex flex-col items-center my-auto transition-transform duration-150">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-[#23324f] bg-white">
              <canvas ref={canvasRef} className="block max-w-none" />
            </div>
            <p className="text-[11px] text-[#6b7e94] mt-3 font-mono">
              Page {currentPage} of {numPages} • Use ← → arrow keys to flip pages
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

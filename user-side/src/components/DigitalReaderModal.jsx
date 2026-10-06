import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Maximize2, 
  Minimize2,
  BookOpen, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function DigitalReaderModal({ book, onClose }) {
  if (!book) return null;

  const [loadedBook, setLoadedBook] = useState(book);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Fetch full book data from backend if needed
  useEffect(() => {
    let isMounted = true;
    fetch(`http://localhost:5000/api/books/${book.bookId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.data) {
          setLoadedBook(data.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [book.bookId]);

  const activeBook = loadedBook || book;

  // Determine the live interactive reader URL (Flipbook or PDF Reader)
  let liveReaderUrl = null;
  if (activeBook.embedReaderUrl) {
    liveReaderUrl = activeBook.embedReaderUrl;
  } else if (activeBook.bookId?.startsWith('IA-')) {
    const iaId = activeBook.bookId.replace('IA-', '');
    liveReaderUrl = `https://archive.org/embed/${iaId}`;
  } else if (activeBook.pdfUrl) {
    liveReaderUrl = `${activeBook.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
  } else {
    liveReaderUrl = `http://localhost:5000/api/books/${activeBook.bookId}/pdf#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
  }

  // Handle PDF Download
  const handleDownloadPdf = () => {
    setDownloading(true);
    setDownloadDone(false);

    let downloadUrl = activeBook.pdfUrl;
    if (!downloadUrl || downloadUrl.includes('#')) {
      downloadUrl = `http://localhost:5000/api/books/${activeBook.bookId}/pdf`;
    }

    const cleanName = (activeBook.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = activeBook.downloadPdfFilename || `${cleanName}_Complete_Edition.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    }, 1200);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className={`w-full ${isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-6xl h-[95vh] rounded-3xl'} bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-200`}
      >
        
        {/* ================= HEADER BAR ================= */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          
          {/* Book Identity in Native Language */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight">
                  {activeBook.originalScriptTitle || activeBook.title}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 shrink-0">
                  {activeBook.language || 'Original Edition'}
                </span>
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                  📖 Live Flipbook
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {activeBook.originalAuthor ? `${activeBook.originalAuthor} • ` : ''}By {activeBook.author} {activeBook.publicationYear ? `(${activeBook.publicationYear})` : ''}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Fullscreen, Download, Close */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center space-x-1"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Book View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="text-[11px] font-semibold">{isFullscreen ? 'Exit' : 'Expand'}</span>
            </button>

            {/* Download Real PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              title="Download Full PDF"
            >
              {downloadDone ? (
                <>
                  <FileCheck2 className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? 'Preparing...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= LIVE BOOK VIEWER (INTERACTIVE FLIPBOOK / PDF) ================= */}
        {activeBook.isRestricted && (
          <div className="bg-amber-950/70 border-b border-amber-600/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 shrink-0">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Publisher Preview Mode:</strong> This copyrighted edition shows pages 1–9 as sample preview. You can unlock and borrow all pages for free on Internet Archive.
              </span>
            </div>
            <a
              href={activeBook.borrowUrl || activeBook.readOnlineUrl || `https://archive.org/details/${activeBook.bookId?.replace('IA-', '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <span>Borrow & Unlock Full Book Free</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex-1 w-full h-full relative bg-slate-950 flex flex-col overflow-hidden">
          
          {/* Loading Indicator */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-950/90 z-10">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-xs text-purple-200 font-semibold tracking-wide">
                Loading Live Book Pages ({activeBook.language || 'Original'} Edition)...
              </p>
            </div>
          )}

          {/* Real Live Flipbook / PDF iframe */}
          <iframe 
            src={liveReaderUrl}
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-0 bg-slate-950" 
            allowFullScreen 
            title={activeBook.title}
          />
        </div>

        {/* ================= FOOTER BAR ================= */}
        <div className="p-2.5 px-5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Live Reading Session Active</span>
            <span>•</span>
            <span>Swipe or click arrows to turn pages</span>
          </div>

          <div className="flex items-center space-x-3">
            {activeBook.readOnlineUrl && (
              <a
                href={activeBook.readOnlineUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-xs font-semibold"
              >
                <span>External Mirror</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={handleDownloadPdf}
              className="text-purple-400 hover:text-purple-300 font-bold"
            >
              Download Full File
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

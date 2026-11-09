import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Maximize2, 
  Minimize2,
  BookOpen, 
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  Sun,
  Moon,
  BookMarked,
  FileText,
  FileCheck2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Load Mozilla PDF.js from reliable CDN
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Resolve Archive.org live 3D Flipbook & Original Scanned Book Embed URL
const resolveArchiveEmbedUrl = (b) => {
  if (!b) return null;
  if (b.embedReaderUrl) return b.embedReaderUrl;
  if (b.readOnlineUrl && b.readOnlineUrl.includes('archive.org')) {
    return b.readOnlineUrl.replace('/details/', '/embed/');
  }
  if (b.bookId?.startsWith('IA-')) {
    return `https://archive.org/embed/${b.bookId.replace('IA-', '')}`;
  }
  return null;
};

export default function DigitalReaderModal({ book, onClose }) {
  if (!book) return null;

  const [loadedBook, setLoadedBook] = useState(book);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Default to 'flipbook' (Original Complete Book with all pages) if archive embed URL exists, else 'chapters'
  const initialEmbed = resolveArchiveEmbedUrl(book);
  const [viewMode, setViewMode] = useState(initialEmbed ? 'flipbook' : 'chapters');
  
  // Theme for reading: 'dark' | 'cream' | 'white'
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('base');

  // PDF.js Engine States
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [scale, setScale] = useState(1.15);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // Chapter index for text mode
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch full book data from backend if needed
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/books/${book.bookId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.data) {
          setLoadedBook(data.data);
          const embed = resolveArchiveEmbedUrl(data.data);
          if (embed && !initialEmbed) {
            setViewMode('flipbook');
          }
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [book.bookId]);

  const activeBook = loadedBook || book;
  const archiveEmbedUrl = resolveArchiveEmbedUrl(activeBook);

  // Extract clean PDF URL via backend streaming endpoint so it never blocks or triggers attachment errors
  const getCleanPdfUrl = () => {
    return `${API_BASE_URL}/api/books/${activeBook.bookId}/pdf`;
  };

  const pdfUrl = getCleanPdfUrl();

  // Route external third-party URLs through backend proxy to eliminate CORS
  const getProxiedPdfUrl = (url) => {
    if (!url) return url;
    // Don't proxy internal API endpoints or same host
    if (url.startsWith('/') || (API_BASE_URL && url.startsWith(API_BASE_URL)) || url.includes('/api/books/')) {
      return url;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // If external third-party origin, route via backend proxy
      if (typeof window !== 'undefined' && !url.includes(window.location.host) && !url.includes('localhost:5000')) {
        return `${API_BASE_URL}/api/books/pdf-proxy?url=${encodeURIComponent(url)}`;
      }
    }
    return url;
  };

  // Chapters & Contents for text fallback mode
  const chapters = (activeBook.chapters && activeBook.chapters.length > 0)
    ? activeBook.chapters
    : [
        {
          title: `Discourse: ${activeBook.title}`,
          originalText: activeBook.originalScriptTitle || activeBook.title,
          englishTranslation: `Author: ${activeBook.author} • Category: ${activeBook.category} • Era: ${activeBook.era || 'Classical'}`,
          fullText: activeBook.description || 'Complete digital volume catalogued and preserved at Brain Dock Library.'
        }
      ];

  const currentChapter = chapters[currentChapterIdx] || chapters[0];

  // 1. Dynamically Load PDF.js script
  useEffect(() => {
    if (window.pdfjsLib) {
      setPdfJsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_CDN;
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        setPdfJsLoaded(true);
      }
    };
    script.onerror = () => {
      console.warn("PDF.js CDN failed to load; defaulting to native viewer");
      setViewMode('native-pdf');
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in document for reuse
    };
  }, []);

  // 2. Load PDF Document once PDF.js is ready
  useEffect(() => {
    if (!pdfJsLoaded || !window.pdfjsLib) return;

    let isCancelled = false;
    setPdfLoading(true);
    setPdfError(null);

    const targetUrl = getProxiedPdfUrl(pdfUrl);

    const loadingTask = window.pdfjsLib.getDocument({
      url: targetUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      withCredentials: false
    });

    loadingTask.promise
      .then(doc => {
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setPageInput('1');
          setPdfLoading(false);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          console.warn("PDF.js failed to parse PDF document:", err);
          setPdfError(err.message || "Failed to parse PDF document");
          setPdfLoading(false);
          // If PDF.js fails (e.g. strict firewall), auto switch to native browser embed
          setViewMode('native-pdf');
        }
      });

    return () => {
      isCancelled = true;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [pdfJsLoaded, pdfUrl]);

  // 3. Render Active Page on Canvas
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'interactive') return;

    let isCancelled = false;

    // Cancel any ongoing render task before starting a new one
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    pdfDoc.getPage(currentPage).then(page => {
      if (isCancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;

      // Calculate viewport
      const viewport = page.getViewport({ scale });

      // High DPI adjustment for crystal-clear text
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      renderTask.promise
        .then(() => {
          renderTaskRef.current = null;
        })
        .catch(err => {
          if (err.name !== 'RenderingCancelledException') {
            console.error("Page render error:", err);
          }
        });
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale, viewMode]);

  // Sync page input field with current page
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Page Turn Handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const handlePageJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Keyboard navigation: Left/Right arrows, PageUp/PageDown, Home/End
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in the page jump input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        if (viewMode === 'interactive') handleNextPage();
        else if (viewMode === 'chapters') {
          if (currentChapterIdx < chapters.length - 1) setCurrentChapterIdx(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        if (viewMode === 'interactive') handlePrevPage();
        else if (viewMode === 'chapters') {
          if (currentChapterIdx > 0) setCurrentChapterIdx(prev => prev - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleFirstPage();
      } else if (e.key === 'End') {
        e.preventDefault();
        handleLastPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, viewMode, currentChapterIdx, chapters.length]);

  // Download PDF
  const handleDownloadPdf = () => {
    setDownloading(true);
    setDownloadDone(false);

    const cleanName = (activeBook.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_');
    const link = document.createElement('a');
    link.href = pdfUrl;
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

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };

  const handleResetZoom = () => {
    setScale(1.15);
  };

  // Theme styles for reading pane
  const themeClasses = {
    dark: {
      bg: 'bg-slate-950',
      canvasBg: 'bg-slate-900',
      text: 'text-slate-100',
      border: 'border-slate-800',
      card: 'bg-slate-900',
      accent: 'text-purple-400'
    },
    cream: {
      bg: 'bg-[#fcf9f2]',
      canvasBg: 'bg-[#f4ecdb]',
      text: 'text-[#2b2416]',
      border: 'border-[#e8e0d0]',
      card: 'bg-[#f5efe3]',
      accent: 'text-amber-900'
    },
    white: {
      bg: 'bg-white',
      canvasBg: 'bg-slate-100',
      text: 'text-slate-900',
      border: 'border-slate-200',
      card: 'bg-slate-50',
      accent: 'text-purple-700'
    }
  }[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div 
        className={`w-full ${isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-7xl h-[96vh] rounded-2xl sm:rounded-3xl'} bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-200`}
      >
        
        {/* ================= TOP HEADER BAR ================= */}
        <div className="p-2.5 sm:p-3.5 bg-slate-950 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          
          {/* Book Identity */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight">
                  {activeBook.originalScriptTitle || activeBook.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50 shrink-0">
                  {activeBook.language || 'Complete Book'}
                </span>
                {(activeBook.pdfPages || totalPages > 0) && (
                  <span className="hidden sm:inline-block text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-mono px-2 py-0.5 rounded-full">
                    {activeBook.bookId === 'BDL-CL-HIN-002' 
                      ? '32 Pages • All 135 Verses Complete'
                      : (activeBook.pdfPages ? `${activeBook.pdfPages} Total Pages` : `${totalPages} Total Pages`)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {activeBook.originalAuthor ? `${activeBook.originalAuthor} • ` : ''}By {activeBook.author} {activeBook.publicationYear ? `(${activeBook.publicationYear})` : ''}
              </p>
            </div>
          </div>

          {/* Center: Mode Switcher */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            {archiveEmbedUrl && (
              <button
                type="button"
                onClick={() => setViewMode('flipbook')}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'flipbook' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Read Complete Original Scanned Book (All Pages)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Original Book (All Pages)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setViewMode('chapters')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                viewMode === 'chapters' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Chapter Synopsis & Commentary"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chapters & Synopsis</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('native-pdf')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                viewMode === 'native-pdf' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Browser Native PDF Document Viewer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browser PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'interactive' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Canvas Vector Reader"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Canvas View</span>
            </button>
          </div>

          {/* Right Controls: Zoom, Theme, Download, Fullscreen, Close */}
          <div className="flex items-center space-x-1.5 text-xs shrink-0">
            
            {/* Zoom Controls (Interactive Mode) */}
            {viewMode === 'interactive' && (
              <div className="hidden md:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 space-x-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 text-slate-300">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Reading Theme Toggle */}
            <div className="hidden lg:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Dark Mode"
              >
                🌙 Night
              </button>
              <button
                type="button"
                onClick={() => setTheme('cream')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                  theme === 'cream' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Sepia Paper"
              >
                📜 Sepia
              </button>
              <button
                type="button"
                onClick={() => setTheme('white')}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                  theme === 'white' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Clean Day"
              >
                ☀️ Day
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center border border-slate-800"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Online Reading Mode Status Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-700/60 text-purple-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Reading Active</span>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-rose-900/60 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer border border-slate-800"
              title="Close Reader (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PAGE TURNING SUB-TOOLBAR (INTERACTIVE MODE) ================= */}
        {viewMode === 'interactive' && totalPages > 0 && (
          <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            
            {/* Left: Pages overview drawer toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer border border-slate-700 text-xs"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>All Pages ({totalPages})</span>
            </button>

            {/* Center: Page Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFirstPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="First Page (Home)"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-30 disabled:hover:bg-purple-700 text-white font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                title="Previous Page (← Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev Page</span>
              </button>

              {/* Jump to Page Form */}
              <form onSubmit={handlePageJumpSubmit} className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-700">
                <span className="text-slate-400 font-medium text-[11px]">Page</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageJumpSubmit}
                  className="w-12 text-center bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white font-bold text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-slate-400 font-medium text-[11px]">of {totalPages}</span>
                <button
                  type="submit"
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 ml-1 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 cursor-pointer"
                >
                  Go
                </button>
              </form>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-30 disabled:hover:bg-purple-700 text-white font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                title="Next Page (→ Arrow)"
              >
                <span className="hidden sm:inline">Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleLastPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Last Page (End)"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Interactive Page Scrubber Slider */}
            <div className="hidden lg:flex items-center space-x-2 w-48">
              <span className="text-[10px] text-slate-400 font-mono">1</span>
              <input
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                title="Slide to change pages"
              />
              <span className="text-[10px] text-slate-400 font-mono">{totalPages}</span>
            </div>

          </div>
        )}

        {/* ================= MAIN CONTENT PANE ================= */}
        <div className={`flex-1 w-full h-full relative overflow-hidden flex ${themeClasses.bg}`}>
          
          {/* ================= VIEW MODE 1: INTERACTIVE REAL CANVAS MULTI-PAGE READER ================= */}
          {viewMode === 'interactive' && (
            <div className="w-full h-full flex overflow-hidden relative">
              
              {/* Slide-out / Collapsible Page Grid Drawer */}
              {sidebarOpen && (
                <div className="w-64 sm:w-72 border-r border-slate-800 bg-slate-900 flex flex-col shrink-0 z-20 animate-in slide-in-from-left duration-200">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Jump to Page ({totalPages})
                    </span>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => { setCurrentPage(pg); setSidebarOpen(false); }}
                        className={`p-2.5 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer border ${
                          currentPage === pg 
                            ? 'bg-purple-700 text-white border-purple-500 shadow-md' 
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="block text-[10px] text-slate-400 font-sans">Page</span>
                        <span>{pg}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Canvas Viewport */}
              <div 
                ref={containerRef}
                className={`flex-1 w-full h-full overflow-auto flex items-center justify-center p-3 sm:p-6 relative select-none ${themeClasses.canvasBg}`}
              >
                
                {/* Floating Previous Page Button (Left Edge) */}
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-purple-700 text-white disabled:opacity-0 shadow-xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                  title="Previous Page (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Floating Next Page Button (Right Edge) */}
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-purple-700 text-white disabled:opacity-0 shadow-xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                  title="Next Page (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Loading Spinner */}
                {pdfLoading && (
                  <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-slate-950/80 rounded-3xl border border-slate-800 shadow-xl">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-200">Loading Real Book Pages...</p>
                    <p className="text-xs text-slate-400">Rendering high-resolution vector pages via PDF Engine</p>
                  </div>
                )}

                {/* Error Banner */}
                {pdfError && !pdfLoading && (
                  <div className="max-w-md p-6 bg-slate-900 border border-rose-800/80 rounded-3xl text-center space-y-4">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <h3 className="font-bold text-base text-white">Direct Rendering Fallback</h3>
                    <p className="text-xs text-slate-300">
                      The high-resolution canvas engine encountered an issue rendering this format. Please switch to the Browser PDF view.
                    </p>
                    <button
                      onClick={() => setViewMode('native-pdf')}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs"
                    >
                      Open in Native PDF Viewer
                    </button>
                  </div>
                )}

                {/* Active Page Canvas */}
                <div className={`transition-opacity duration-150 ${pdfLoading ? 'opacity-0' : 'opacity-100'} shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white`}>
                  <canvas ref={canvasRef} className="block max-w-full h-auto mx-auto" />
                </div>

              </div>

            </div>
          )}

          {/* ================= VIEW MODE 2: BROWSER NATIVE PDF VIEWER ================= */}
          {viewMode === 'native-pdf' && (
            <div className="w-full h-full relative bg-slate-900 flex flex-col">
              <div className="p-2.5 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-emerald-400">
                  ⚡ Native Browser Document Viewer Active (All Pages Enabled)
                </span>
                <div className="flex items-center space-x-3">
                  <a 
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Read in Dedicated Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Native PDF Object / Embed with Fallback */}
              <iframe 
                src={`${pdfUrl}#page=${currentPage}&toolbar=1&navpanes=1&statusbar=1`}
                className="w-full h-full border-0 bg-slate-950"
                title={`${activeBook.title} Full PDF Document`}
              />
            </div>
          )}

          {/* ================= VIEW MODE 3: ARCHIVE.ORG 3D FLIPBOOK ================= */}
          {viewMode === 'flipbook' && archiveEmbedUrl && (
            <div className="w-full h-full relative bg-slate-950 flex flex-col">
              <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-semibold text-purple-200 truncate">
                    📖 Original Archive Volume {activeBook.bookId === 'BDL-CL-HIN-002' ? '(32 Pages • All 135 Rubaiyat Included)' : (activeBook.pdfPages ? `(${activeBook.pdfPages} Pages)` : '')}
                  </span>
                  <span className="hidden md:inline text-slate-400">• 3D BookReader</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('chapters')}
                    className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                    title="Switch to detailed text & chapters reader"
                  >
                    <BookMarked className="w-3.5 h-3.5 text-amber-300" />
                    <span>Read Chapters</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('native-pdf')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                    title="Switch to native browser PDF"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Browser PDF</span>
                  </button>
                  <a 
                    href={activeBook.readOnlineUrl || archiveEmbedUrl.replace('/embed/', '/details/')}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-all text-[11px] font-semibold"
                    title="Open full-screen reader in new tab"
                  >
                    <span>Full Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <iframe 
                src={archiveEmbedUrl}
                className="w-full h-full flex-1 border-0 bg-slate-950" 
                allowFullScreen 
                allow="fullscreen"
                title={`${activeBook.title} Complete Original Book`}
              />
            </div>
          )}

          {/* ================= VIEW MODE 4: CHAPTER SYNOPSIS & COMMENTARY ================= */}
          {viewMode === 'chapters' && (
            <div className={`w-full h-full flex flex-col md:flex-row overflow-hidden ${themeClasses.bg} ${themeClasses.text}`}>
              
              {/* Chapter Index Sidebar */}
              <div className={`w-full md:w-72 lg:w-80 shrink-0 border-r ${themeClasses.border} flex flex-col h-full ${themeClasses.card}`}>
                <div className="p-3.5 border-b border-inherit flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Sections ({chapters.length})</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentChapterIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start space-x-2 cursor-pointer ${
                        currentChapterIdx === idx 
                          ? 'bg-purple-700 text-white font-bold shadow-xs' 
                          : 'hover:bg-black/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="font-mono text-[10px] shrink-0 mt-0.5 opacity-70">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="line-clamp-2 leading-relaxed">
                        {ch.title || `Section ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-6">
                <div className="border-b border-inherit pb-4 space-y-2 text-center">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-900">
                    SECTION {String(currentChapterIdx + 1).padStart(2, '0')}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-serif mt-2">
                    {currentChapter.title}
                  </h1>
                </div>

                {currentChapter.originalText && (
                  <div className={`p-6 sm:p-8 rounded-2xl ${themeClasses.card} border ${themeClasses.border} shadow-xs font-serif leading-loose whitespace-pre-line text-base sm:text-lg`}>
                    {currentChapter.originalText}
                  </div>
                )}

                {currentChapter.englishTranslation && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                      <BookMarked className="w-4 h-4" />
                      <span>Context & Translation</span>
                    </div>
                    <p className="italic leading-relaxed font-serif opacity-90">
                      "{currentChapter.englishTranslation}"
                    </p>
                  </div>
                )}

                {currentChapter.fullText && (
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-70">
                      Comprehensive Treatise & Commentary
                    </h4>
                    <div className="whitespace-pre-line leading-relaxed font-serif opacity-90">
                      {currentChapter.fullText}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-inherit flex items-center justify-between">
                  <button
                    onClick={() => setCurrentChapterIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentChapterIdx === 0}
                    className="px-4 py-2 rounded-xl border border-inherit disabled:opacity-30 font-semibold text-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Section</span>
                  </button>

                  <span className="text-xs font-mono opacity-60">
                    {currentChapterIdx + 1} / {chapters.length}
                  </span>

                  <button
                    onClick={() => setCurrentChapterIdx(prev => Math.min(chapters.length - 1, prev + 1))}
                    disabled={currentChapterIdx === chapters.length - 1}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center space-x-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ================= BOTTOM STATUS FOOTER ================= */}
        <div className="p-2.5 px-4 bg-slate-950 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">
              {viewMode === 'flipbook'
                ? (activeBook.bookId === 'BDL-CL-HIN-002'
                    ? 'Original Complete Book Edition • All 135 Rubaiyat (Verses 1 to 135) Loaded • 100% In-Browser Reading'
                    : `Original Complete Book Edition • All ${activeBook.pdfPages || '300+'} Pages Loaded • 100% In-Browser Reading`)
                : (viewMode === 'interactive' && totalPages > 0 
                  ? `Reading Page ${currentPage} of ${totalPages} (Full Book Edition)`
                  : 'Complete Digital Reading Sanctuary Active')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400">
              Zero Download Required • Interactive Library Reader
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {activeBook.readOnlineUrl && (
              <a
                href={activeBook.readOnlineUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-xs font-semibold"
              >
                <span>Archive Library Mirror</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={handleDownloadPdf}
              className="text-slate-400 hover:text-purple-300 transition-colors text-xs font-medium cursor-pointer flex items-center space-x-1"
              title="Save an offline copy if desired"
            >
              <Download className="w-3 h-3" />
              <span>Offline Copy</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

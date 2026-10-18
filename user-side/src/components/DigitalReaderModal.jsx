import React, { useState, useEffect } from 'react';
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
  List,
  Sun,
  Moon,
  BookMarked,
  FileText,
  FileCheck2,
  Sparkles,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function DigitalReaderModal({ book, onClose }) {
  if (!book) return null;

  const [loadedBook, setLoadedBook] = useState(book);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Reading mode: 'reader' (Native Interactive Book) | 'flipbook' (Archive.org embed) | 'pdf' (Google Docs PDF embed)
  const [viewMode, setViewMode] = useState('reader');
  
  // Theme: 'cream' (Classic warm book paper) | 'dark' (Midnight library) | 'white' (Modern clean)
  const [theme, setTheme] = useState('cream');
  
  // Font Size: 'sm' | 'base' | 'lg' | 'xl'
  const [fontSize, setFontSize] = useState('base');

  // Fetch full book data from backend if needed
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/books/${book.bookId}`)
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

  // Extract clean PDF URL (without localhost:5000)
  const getCleanPdfUrl = () => {
    let raw = activeBook.pdfUrl;
    if (!raw) return `${API_BASE_URL}/api/books/${activeBook.bookId}/pdf`;
    if (raw.startsWith('http://localhost:5000')) {
      return raw.replace('http://localhost:5000', API_BASE_URL);
    }
    if (raw.startsWith('/')) {
      return `${API_BASE_URL}${raw}`;
    }
    return raw;
  };

  const pdfUrl = getCleanPdfUrl();

  // Determine Archive.org live embed URL if applicable
  let archiveEmbedUrl = null;
  if (activeBook.embedReaderUrl) {
    archiveEmbedUrl = activeBook.embedReaderUrl;
  } else if (activeBook.bookId?.startsWith('IA-')) {
    const iaId = activeBook.bookId.replace('IA-', '');
    archiveEmbedUrl = `https://archive.org/embed/${iaId}`;
  }

  // Chapters & Contents
  const chapters = (activeBook.chapters && activeBook.chapters.length > 0)
    ? activeBook.chapters
    : [
        {
          title: `Introductory Discourse: ${activeBook.title}`,
          originalText: activeBook.originalScriptTitle || activeBook.title,
          englishTranslation: `Author: ${activeBook.author} • Category: ${activeBook.category} • Era: ${activeBook.era || 'Classical'}`,
          fullText: activeBook.description || 'Complete digital edition catalogued and preserved at Brain Dock Library.'
        }
      ];

  const currentChapter = chapters[currentChapterIdx] || chapters[0];

  // RTL detection for Urdu, Persian, Arabic
  const isRtl = (activeBook.language || '').toLowerCase().includes('urdu') ||
                (activeBook.language || '').toLowerCase().includes('persian') ||
                (activeBook.language || '').toLowerCase().includes('farsi') ||
                (activeBook.language || '').toLowerCase().includes('arabic');

  // Keyboard Navigation: Left & Right arrow keys to turn chapters / pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevChapter();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIdx, chapters.length]);

  const handleNextChapter = () => {
    if (currentChapterIdx < chapters.length - 1) {
      setCurrentChapterIdx(prev => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(prev => prev - 1);
    }
  };

  // Handle PDF Download
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

  // Theme styles for reading pane
  const themeClasses = {
    cream: {
      bg: 'bg-[#fcf9f2]',
      text: 'text-[#2b2416]',
      border: 'border-[#e8e0d0]',
      card: 'bg-[#f5efe3]',
      accent: 'text-amber-900',
      tag: 'bg-[#ece4d2] text-[#4d3d28]',
      highlight: 'bg-[#fff7e6] border-[#eedeb8]'
    },
    dark: {
      bg: 'bg-[#0f172a]',
      text: 'text-slate-100',
      border: 'border-slate-800',
      card: 'bg-slate-900',
      accent: 'text-purple-300',
      tag: 'bg-slate-800 text-slate-300',
      highlight: 'bg-slate-900/80 border-slate-800'
    },
    white: {
      bg: 'bg-white',
      text: 'text-slate-800',
      border: 'border-slate-200',
      card: 'bg-slate-50',
      accent: 'text-purple-700',
      tag: 'bg-slate-100 text-slate-700',
      highlight: 'bg-purple-50/50 border-purple-100'
    }
  }[theme];

  const fontSizeClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl'
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div 
        className={`w-full ${isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-6xl h-[95vh] rounded-2xl sm:rounded-3xl'} bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white transition-all duration-200`}
      >
        
        {/* ================= HEADER BAR ================= */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
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
              </div>
              <p className="text-xs text-slate-400 truncate">
                {activeBook.originalAuthor ? `${activeBook.originalAuthor} • ` : ''}By {activeBook.author} {activeBook.publicationYear ? `(${activeBook.publicationYear})` : ''}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Mode Switcher, Themes, Font, Fullscreen, Download, Close */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs shrink-0">
            
            {/* View Mode Toggle: Reader vs Flipbook vs PDF */}
            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'reader' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Interactive Book Reader"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Book Reader</span>
              </button>

              {archiveEmbedUrl && (
                <button
                  type="button"
                  onClick={() => setViewMode('flipbook')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                    viewMode === 'flipbook' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Archive.org 3D Flipbook"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D Flipbook</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'pdf' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Embedded PDF Document Viewer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF View</span>
              </button>
            </div>

            {/* Font Size Adjuster (for Reader mode) */}
            {viewMode === 'reader' && (
              <div className="hidden md:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize(prev => prev === 'xl' ? 'lg' : prev === 'lg' ? 'base' : 'sm')}
                  className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Smaller Font"
                >
                  A-
                </button>
                <span className="text-[10px] text-slate-500 px-1 font-mono">{fontSize.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl')}
                  className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Larger Font"
                >
                  A+
                </button>
              </div>
            )}

            {/* Reading Theme Toggle (for Reader mode) */}
            {viewMode === 'reader' && (
              <div className="hidden lg:flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setTheme('cream')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    theme === 'cream' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Classic Cream Paper"
                >
                  📜 Sepia
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dark Midnight"
                >
                  🌙 Night
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('white')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    theme === 'white' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Clean White"
                >
                  ☀️ Day
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center space-x-1 border border-slate-800"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Book View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Real PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              title="Download Full PDF Edition"
            >
              {downloadDone ? (
                <>
                  <FileCheck2 className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                  <span className="hidden sm:inline">{downloading ? 'Preparing...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer border border-slate-800"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= MAIN CONTENT PANE ================= */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex bg-slate-950">
          
          {/* ================= VIEW MODE 1: NATIVE INTERACTIVE BOOK READER (DEFAULT) ================= */}
          {viewMode === 'reader' && (
            <div className={`w-full h-full flex flex-col md:flex-row overflow-hidden ${themeClasses.bg} ${themeClasses.text}`}>
              
              {/* Collapsible Chapter Index / TOC Sidebar */}
              <div 
                className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-72 lg:w-80 shrink-0 border-r ${themeClasses.border} flex flex-col h-full ${themeClasses.card} transition-all`}
              >
                <div className="p-3.5 border-b border-inherit flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <List className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Chapters & Ghazals ({chapters.length})</span>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 rounded-lg hover:bg-black/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentChapterIdx(idx); setSidebarOpen(false); }}
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
                        {ch.title || `Chapter ${idx + 1}`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Book Info Summary in Sidebar Footer */}
                <div className="p-3 border-t border-inherit text-[11px] opacity-75 space-y-1">
                  <p className="truncate font-semibold">{activeBook.title}</p>
                  <p className="truncate">Publisher: {activeBook.publisher || 'Classical Archive'}</p>
                  <p>Rating: ⭐ {activeBook.rating || 5.0} • {activeBook.pdfPages || chapters.length * 15} Pages</p>
                </div>
              </div>

              {/* Main Reading Canvas */}
              <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                
                {/* Mobile Sidebar Toggle & Page Status */}
                <div className={`p-2.5 px-4 border-b ${themeClasses.border} flex items-center justify-between text-xs`}>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden flex items-center space-x-1.5 font-semibold text-purple-700"
                  >
                    <List className="w-4 h-4" />
                    <span>Table of Contents</span>
                  </button>
                  
                  <span className="text-[11px] font-semibold opacity-70">
                    Chapter {currentChapterIdx + 1} of {chapters.length}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handlePrevChapter}
                      disabled={currentChapterIdx === 0}
                      className="p-1 rounded-lg border border-inherit disabled:opacity-30 hover:bg-black/5"
                      title="Previous Chapter (← Left Arrow)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextChapter}
                      disabled={currentChapterIdx === chapters.length - 1}
                      className="p-1 rounded-lg border border-inherit disabled:opacity-30 hover:bg-black/5"
                      title="Next Chapter (→ Right Arrow)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chapter Text Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-4xl mx-auto w-full space-y-6">
                  
                  {/* Chapter Header */}
                  <div className="border-b border-inherit pb-4 space-y-2 text-center">
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${themeClasses.tag}`}>
                      SECTION {String(currentChapterIdx + 1).padStart(2, '0')}
                    </span>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight font-serif mt-2">
                      {currentChapter.title}
                    </h1>
                  </div>

                  {/* Primary Original Text (Urdu Nastaliq / Sanskrit / Hindi / Gujarati / Classical) */}
                  {currentChapter.originalText && (
                    <div 
                      dir={isRtl ? 'rtl' : 'ltr'} 
                      className={`p-6 sm:p-8 rounded-2xl ${themeClasses.card} border ${themeClasses.border} shadow-xs font-serif leading-loose ${fontSizeClasses} ${
                        isRtl ? 'text-center text-xl sm:text-2xl font-medium tracking-wide' : 'whitespace-pre-line'
                      }`}
                    >
                      {currentChapter.originalText}
                    </div>
                  )}

                  {/* English Translation & Meaning / Classical Commentary */}
                  {currentChapter.englishTranslation && (
                    <div className={`p-5 sm:p-6 rounded-2xl ${themeClasses.highlight} border space-y-2`}>
                      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-700">
                        <BookMarked className="w-4 h-4" />
                        <span>Translation & Classical Context</span>
                      </div>
                      <p className={`italic leading-relaxed ${fontSizeClasses} opacity-90 font-serif`}>
                        "{currentChapter.englishTranslation}"
                      </p>
                    </div>
                  )}

                  {/* Deep Full Text / Commentary */}
                  {currentChapter.fullText && currentChapter.fullText !== currentChapter.originalText && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider opacity-70">
                        Comprehensive Treatise & Notes
                      </h4>
                      <div className={`whitespace-pre-line leading-relaxed font-serif ${fontSizeClasses} opacity-90`}>
                        {currentChapter.fullText}
                      </div>
                    </div>
                  )}

                  {/* Key Takeaways if available */}
                  {currentChapter.keyTakeaways && currentChapter.keyTakeaways.length > 0 && (
                    <div className={`p-5 rounded-2xl ${themeClasses.card} border ${themeClasses.border} space-y-3`}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Core Insights & Literary Themes</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1.5 text-xs opacity-85 leading-relaxed">
                        {currentChapter.keyTakeaways.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Navigation Buttons at Bottom of Reading Pane */}
                  <div className="pt-8 border-t border-inherit flex items-center justify-between gap-4">
                    <button
                      onClick={handlePrevChapter}
                      disabled={currentChapterIdx === 0}
                      className="px-4 py-2.5 rounded-xl border border-inherit disabled:opacity-30 hover:bg-black/5 font-semibold text-xs flex items-center space-x-2 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Section</span>
                    </button>

                    <span className="text-xs font-mono opacity-60">
                      — {currentChapterIdx + 1} / {chapters.length} —
                    </span>

                    <button
                      onClick={handleNextChapter}
                      disabled={currentChapterIdx === chapters.length - 1}
                      className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-40"
                    >
                      <span>Next Section</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================= VIEW MODE 2: ARCHIVE.ORG 3D FLIPBOOK ================= */}
          {viewMode === 'flipbook' && archiveEmbedUrl && (
            <div className="w-full h-full relative bg-slate-950 flex flex-col">
              <iframe 
                src={archiveEmbedUrl}
                className="w-full h-full border-0 bg-slate-950" 
                allowFullScreen 
                title={activeBook.title}
              />
            </div>
          )}

          {/* ================= VIEW MODE 3: EMBEDDED PDF VIEWER (GOOGLE DOCS OR DIRECT) ================= */}
          {viewMode === 'pdf' && (
            <div className="w-full h-full relative bg-slate-900 flex flex-col">
              
              {/* PDF Top Bar Helper */}
              <div className="p-2.5 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Rendering High-Resolution Multi-Page PDF Document...</span>
                <div className="flex items-center space-x-3">
                  <a 
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
                  >
                    <span>Open in Full Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    onClick={handleDownloadPdf}
                    className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold"
                  >
                    Download File
                  </button>
                </div>
              </div>

              {/* Embedded Document */}
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                className="w-full h-full border-0 bg-slate-950"
                title={`${activeBook.title} PDF Document`}
              />
            </div>
          )}

        </div>

        {/* ================= FOOTER BAR ================= */}
        <div className="p-2.5 px-5 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Live Reading Session Active</span>
            <span>•</span>
            <span>Use Left (←) and Right (→) keys to turn sections</span>
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
              className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
            >
              Download Complete PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

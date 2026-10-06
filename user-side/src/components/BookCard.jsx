import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Download, Sparkles, Globe, FileText } from 'lucide-react';

export default function BookCard({ book, onReadOnline, onDownloadPdf }) {
  const handleRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReadOnline) {
      onReadOnline(book);
    } else if (book.readOnlineUrl) {
      window.open(book.readOnlineUrl, '_blank');
    }
  };

  const handlePdf = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownloadPdf) {
      onDownloadPdf(book);
    } else {
      const url = book.pdfUrl || `http://localhost:5000/api/books/${book.bookId}/pdf`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-purple-100 hover:border-purple-300 shadow-purple-card hover:shadow-purple-glow transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Cover Image Container */}
      <Link to={`/books/${book.bookId}`} className="relative h-64 overflow-hidden bg-purple-950/5 flex items-center justify-center">
        <img 
          src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-900/90 text-purple-100 backdrop-blur-md shadow-xs border border-purple-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Online E-Book
          </span>

          {book.language && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-purple-200 backdrop-blur-md border border-white/10">
              {book.language}
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold px-2 py-1 rounded-lg flex items-center space-x-1 border border-white/10">
          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          <span>{book.rating || 4.8}</span>
        </div>

        {/* Category Pill on Image Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
          <span className="bg-purple-900/80 backdrop-blur-md border border-purple-400/30 px-2.5 py-0.5 rounded-md font-medium truncate max-w-[170px]">
            {book.category}
          </span>
          <span className="text-[11px] text-purple-200/90 font-mono bg-black/50 px-2 py-0.5 rounded">
            {book.bookId}
          </span>
        </div>
      </Link>

      {/* Book Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/books/${book.bookId}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-700 transition-colors line-clamp-1">
              {book.title}
            </h3>
          </Link>
          
          {/* Original Script Title (e.g. સરસ્વતીચંદ્ર, भगवद्गीता, गोदान) */}
          {book.originalScriptTitle && (
            <p className="text-xs text-purple-700 font-bold truncate mt-0.5 font-serif">
              {book.originalScriptTitle}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            by <span className="text-purple-900 font-medium">{book.author}</span>
            {book.originalAuthor && <span className="text-slate-400 ml-1">({book.originalAuthor})</span>}
          </p>
        </div>

        {/* Access Status Info */}
        <div className="flex items-center justify-between bg-purple-50/70 rounded-xl px-3 py-2 text-xs text-purple-900 border border-purple-100">
          <span className="flex items-center space-x-1.5 font-semibold text-purple-800">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Instant Digital Access</span>
          </span>
          <span className="text-emerald-700 font-bold text-[11px]">Free</span>
        </div>

        {/* Action Buttons: 100% Online Read & PDF */}
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleRead}
              className="flex items-center justify-center space-x-1 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs py-2 px-2.5 rounded-xl transition-all shadow-xs"
              title="Read Online in Browser"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Online</span>
            </button>

            <button 
              onClick={handlePdf}
              className="flex items-center justify-center space-x-1 bg-purple-100/70 hover:bg-purple-200 text-purple-950 font-bold text-xs py-2 px-2.5 rounded-xl transition-colors border border-purple-200"
              title="Download PDF or Manuscript"
            >
              <Download className="w-3.5 h-3.5 text-purple-700" />
              <span>PDF / E-Book</span>
            </button>
          </div>

          <Link 
            to={`/books/${book.bookId}`}
            className="w-full flex items-center justify-center text-[11px] text-slate-500 hover:text-purple-700 font-medium py-1 transition-colors"
          >
            View Book Details & Chapters →
          </Link>
        </div>
      </div>
    </div>
  );
}

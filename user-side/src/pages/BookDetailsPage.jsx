import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  ShieldCheck,
  BookOpen,
  Download,
  Sparkles,
  Globe
} from 'lucide-react';
import BookCard from '../components/BookCard';
import DigitalReaderModal from '../components/DigitalReaderModal';

export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBook(data.data);
          setSimilarBooks(data.similarBooks || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8FD] flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FAF8FD] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-xs text-slate-500">The requested book ID does not exist in the digital catalogue.</p>
        <Link to="/books" className="bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold">
          Return to E-Library
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link to="/books" className="inline-flex items-center space-x-2 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to E-Library</span>
        </Link>

        {/* Main Details Card */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          
          {/* Left Column: Cover & Digital Access Actions */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-100 group">
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-purple-900/90 text-white text-[11px] font-mono px-2.5 py-1 rounded-md backdrop-blur-md">
                  {book.bookId}
                </span>
              </div>
            </div>

            {/* Digital Access Details Widget */}
            <div className="w-full max-w-[280px] mt-6 p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Format:</span>
                <span className="text-purple-700 font-bold flex items-center bg-purple-100/80 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                  Digital E-Book
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 bg-white/80 p-2.5 rounded-xl border border-purple-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Language:</span>
                  <strong className="text-purple-900">{book.language || 'English'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Online Access:</span>
                  <span className="text-emerald-700 font-bold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    Available 24/7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost:</span>
                  <span className="text-emerald-700 font-bold">100% Free Full-Text</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Read Online & PDF Download */}
            <div className="w-full max-w-[280px] mt-4 space-y-2">
              <button 
                onClick={() => setIsReaderOpen(true)}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white shadow-purple-glow hover:shadow-lg transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Full Book Online</span>
              </button>

              <a 
                href={`http://localhost:5000/api/books/${book.bookId}/pdf`}
                download={book.downloadPdfFilename || `${(book.title || 'Book').replace(/[^a-zA-Z0-9_-]/g, '_')}_Complete_Edition.pdf`}
                className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-200 transition-colors"
              >
                <Download className="w-4 h-4 text-purple-700" />
                <span>Download Complete PDF (A4)</span>
              </a>

              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setToastMessage('Book link copied to clipboard!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-900 font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-purple-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Book Link</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Description */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  {book.category}
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                  Published {book.publicationYear}
                </span>
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  {book.language || 'English'}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {book.title}
                </h1>
                {book.originalScriptTitle && (
                  <h2 className="text-xl sm:text-2xl font-bold text-purple-700 mt-1 font-serif">
                    {book.originalScriptTitle}
                  </h2>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <p>
                  By <span className="font-bold text-purple-900">{book.author}</span>
                  {book.originalAuthor && <span className="text-purple-600 ml-1 font-medium">({book.originalAuthor})</span>}
                </p>
                <span>•</span>
                <div className="flex items-center text-amber-500 font-bold text-xs space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{book.rating || 4.9}</span>
                  <span className="text-slate-400 font-normal">({book.reviewsCount || 120} readers)</span>
                </div>
              </div>

              {/* Quick Metadata Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400">Language</p>
                  <p className="font-bold text-slate-900 truncate">{book.language || 'English'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Publisher</p>
                  <p className="font-bold text-slate-900 truncate">{book.publisher || 'Digital Press'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Classification</p>
                  <p className="font-bold text-purple-900 truncate">{book.category}</p>
                </div>
                <div>
                  <p className="text-slate-400">Format</p>
                  <p className="font-bold text-emerald-700">Digital E-Book</p>
                </div>
              </div>

              {/* Tabs: Overview, Chapters & Bibliographic Details */}
              <div className="pt-2">
                <div className="flex space-x-4 border-b border-slate-200 text-sm font-bold">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 ${activeTab === 'overview' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Synopsis & Overview
                  </button>
                  {book.chapters && (
                    <button 
                      onClick={() => setActiveTab('chapters')}
                      className={`pb-3 ${activeTab === 'chapters' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Chapters ({book.chapters.length})
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 ${activeTab === 'details' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Bibliographic Details
                  </button>
                </div>

                <div className="py-4 text-sm text-slate-600 leading-relaxed">
                  {activeTab === 'overview' ? (
                    <div className="space-y-4">
                      <p className="leading-relaxed">{book.description}</p>
                      
                      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-purple-950 text-xs">Ready to read this book?</h4>
                          <p className="text-[11px] text-purple-700">Open full screen in-browser digital reader with customizable fonts, themes and chapters.</p>
                        </div>
                        <button
                          onClick={() => setIsReaderOpen(true)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0"
                        >
                          Launch Reader →
                        </button>
                      </div>

                      {book.tags && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {book.tags.map(t => (
                            <span key={t} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-lg border border-purple-100 font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'chapters' ? (
                    <div className="space-y-3">
                      {book.chapters?.map((ch, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{ch.title}</span>
                          <button
                            onClick={() => setIsReaderOpen(true)}
                            className="text-purple-700 text-xs font-bold hover:underline"
                          >
                            Read Section
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p><strong>Full Title:</strong> {book.title}</p>
                      {book.originalScriptTitle && <p><strong>Original Script:</strong> {book.originalScriptTitle}</p>}
                      <p><strong>Primary Author:</strong> {book.author}</p>
                      <p><strong>Language:</strong> {book.language || 'English'}</p>
                      <p><strong>Standard Identification (ISBN):</strong> {book.isbn}</p>
                      <p><strong>Catalog Classification:</strong> {book.category}</p>
                      <p><strong>Digital Archive:</strong> Brain Dock Central E-Library</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Citation Notice */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs text-purple-900 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Verified digital copy in Brain Dock Online Archive</span>
              </span>
              <span className="font-mono text-[11px] text-purple-600">ONLINE-ARCHIVE-2026</span>
            </div>
          </div>
        </div>

        {/* Similar Books Section */}
        {similarBooks.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Recommended Digital Titles</h3>
              <Link to="/books" className="text-xs font-bold text-purple-700 hover:underline">
                View All E-Books →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarBooks.map(b => (
                <BookCard key={b.bookId} book={b} onReadOnline={(bk) => { setBook(bk); setIsReaderOpen(true); }} />
              ))}
            </div>
          </div>
        )}

        {/* Interactive In-Browser Digital Reader Modal */}
        {isReaderOpen && (
          <DigitalReaderModal 
            book={book} 
            onClose={() => setIsReaderOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}

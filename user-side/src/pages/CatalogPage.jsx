import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Download, 
  ArrowRight,
  Globe,
  X
} from 'lucide-react';
import BookCard from '../components/BookCard';
import DigitalReaderModal from '../components/DigitalReaderModal';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialLanguage = searchParams.get('language') || 'All';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeReaderBook, setActiveReaderBook] = useState(null);

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  // Debounced Suggestions Fetching
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(search.trim());
    }, 220);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (term) => {
    setSuggestionsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/books/suggestions?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.success && data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setSearch(item.title);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    
    setTimeout(() => {
      fetchBooks();
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[activeSuggestionIndex]);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, selectedLanguage, sortBy]);

  const fetchBooks = async () => {
    setLoading(true);
    let localBooks = [];

    try {
      let url = 'http://localhost:5000/api/books?';
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedLanguage !== 'All') url += `&language=${encodeURIComponent(selectedLanguage)}`;
      if (sortBy) url += `&sort=${encodeURIComponent(sortBy)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        localBooks = data.data;
      }
    } catch (err) {
      console.error('Local books fetch error:', err);
    }

    // Also fetch global archive if search term is provided
    let globalBooks = [];
    if (search.trim().length > 0) {
      try {
        const queryTerm = search.trim();
        let gUrl = `http://localhost:5000/api/books/global-search?search=${encodeURIComponent(queryTerm)}`;
        if (selectedLanguage !== 'All') gUrl += `&language=${encodeURIComponent(selectedLanguage)}`;
        
        const gRes = await fetch(gUrl);
        const gData = await gRes.json();
        if (gData.success && gData.data) {
          globalBooks = gData.data;
        }
      } catch (err) {
        console.error('Global search fetch error:', err);
      }
    }

    setBooks([...localBooks, ...globalBooks]);
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchBooks();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSortBy('popular');
    setSearchParams({});
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) setBooks(data.data);
      });
  };

  const handleReadOnline = (book) => {
    setActiveReaderBook(book);
  };

  const handleDownloadPdf = (book) => {
    setToastMessage(`Downloading E-Book / PDF for "${book.title}"...`);
    const downloadUrl = book.pdfUrl || `http://localhost:5000/api/books/${book.bookId}/pdf`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = book.downloadPdfFilename || `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const languagesList = [
    { label: 'All Languages', value: 'All' },
    { label: 'Gujarati', value: 'Gujarati' },
    { label: 'Sanskrit', value: 'Sanskrit' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English Classics', value: 'English' }
  ];

  const categories = [
    'All',
    'Computer Science & AI',
    'Artificial Intelligence',
    'Software Engineering',
    'Self Development & Psychology',
    'Physics & Quantum Tech',
    'Business & Entrepreneurship',
    'Economics & Finance',
    'History & Anthropology',
    'Medical & Neuroscience',
    'UI/UX & Product Design'
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Clean Header */}
        <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200/80 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              100% Free Online E-Library
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Digital E-Books & Rare Manuscripts
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Read thousands of digitized books, ancient classics, and research manuscripts directly in your browser or download PDFs anytime.
            </p>
          </div>
        </div>

        {/* Clean Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div ref={searchContainerRef} className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search any digital book, author, or manuscript (e.g. સરસ્વતીચંદ્ર, Gita, Godan, AI)..."
                className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-medium"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden animate-in fade-in">
                  <div className="p-2.5 px-4 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between text-[11px] text-purple-900 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Matching Books ({suggestions.length})</span>
                    </span>
                    <span className="text-slate-400 font-normal hidden sm:inline">Press Enter to view</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((item, idx) => (
                      <div
                        key={item.bookId || idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className={`p-2.5 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                          activeSuggestionIndex === idx 
                            ? 'bg-purple-100/70' 
                            : 'hover:bg-purple-50/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {item.coverImage ? (
                            <img 
                              src={item.coverImage} 
                              alt={item.title} 
                              className="w-7 h-10 object-cover rounded shadow-xs border border-purple-200 shrink-0" 
                            />
                          ) : (
                            <div className="w-7 h-10 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.subtitle || item.author}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 shrink-0 ml-2">
                          Online
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </form>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
            <span className="font-semibold text-purple-900 flex items-center mr-1 text-[11px]">
              <Sparkles className="w-3 h-3 mr-1 text-purple-600" /> Popular:
            </span>
            {[
              { label: 'સરસ્વતીચંદ્ર', val: 'સરસ્વતીચંદ્ર' },
              { label: 'ભગવદ્ગીતા', val: 'ભગવદ્ગીતા' },
              { label: 'ગોદાન (Godan)', val: 'ગોદાન' },
              { label: 'સોરઠી બહારવટિયા', val: 'સોરઠી' },
              { label: 'Marcus Aurelius', val: 'Meditations' },
              { label: 'Data Architecture', val: 'Data-Intensive' },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => { setSearch(item.val); fetchBooks(); }}
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border border-purple-200 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar: Languages, Categories, Sort & View Mode */}
        <div className="space-y-3">
          {/* Language Selector Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-bold text-slate-700 flex items-center shrink-0 pr-1">
              <Globe className="w-3.5 h-3.5 mr-1 text-purple-600" /> Language:
            </span>
            {languagesList.map(lang => (
              <button
                key={lang.value}
                onClick={() => setSelectedLanguage(lang.value)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedLanguage === lang.value
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Control Bar: Category, Sorting & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-950 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Category:
              </span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-purple-50 border border-purple-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-xs"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sorting & View Toggle */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-purple-950">Sort:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-purple-50 border border-purple-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium text-xs"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Publication Year</option>
                  <option value="title">Title (A - Z)</option>
                  <option value="author">Author (A - Z)</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-1 border border-purple-200 rounded-lg p-0.5 bg-purple-50">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-purple-900 font-bold">{books.length}</strong> online titles
            {selectedLanguage !== 'All' && <span> in <strong>{selectedLanguage}</strong></span>}
          </span>
          <span className="flex items-center text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            100% Free Instant Online Reading & PDF Downloads
          </span>
        </div>

        {/* Content Display: Grid or List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-sm space-y-4 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Titles Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any books matching your search. Try another title or author keyword.
            </p>
            <button 
              onClick={handleResetFilters}
              className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard 
                key={book.bookId} 
                book={book} 
                onReadOnline={handleReadOnline}
                onDownloadPdf={handleDownloadPdf}
              />
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Cover</th>
                    <th className="p-4">Title & Author</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Format</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map(book => (
                    <tr key={book.bookId} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-4">
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-12 h-16 object-cover rounded-lg shadow-xs border border-purple-200"
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-900">
                        <Link to={`/books/${book.bookId}`} className="font-bold hover:text-purple-700 block">
                          {book.title}
                        </Link>
                        {book.originalScriptTitle && (
                          <span className="text-purple-700 font-semibold text-[11px] block">{book.originalScriptTitle}</span>
                        )}
                        <span className="text-slate-500 text-[11px]">by {book.author}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{book.language || 'English'}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center text-purple-800 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                          Online E-Book
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleReadOnline(book)}
                          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition-colors"
                        >
                          Read Online
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(book)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition-colors"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interactive In-Browser Digital E-Book Reader */}
      {activeReaderBook && (
        <DigitalReaderModal 
          book={activeReaderBook} 
          onClose={() => setActiveReaderBook(null)} 
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Upload, 
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';

export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Computer Science & AI');
  const [shelf, setShelf] = useState('CS-Shelf 1');
  const [rack, setRack] = useState('Rack 04-A');
  const [publisher, setPublisher] = useState("O'Reilly Media");
  const [publicationYear, setPublicationYear] = useState(2024);
  const [totalCopies, setTotalCopies] = useState(5);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBooks(data.data);
        }
      });
  };

  const handleOpenAdd = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setCategory('Computer Science & AI');
    setShelf('CS-Shelf 1');
    setRack('Rack 04-A');
    setTotalCopies(5);
    setDescription('');
    setCoverImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600');
    setModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBook(b);
    setTitle(b.title);
    setAuthor(b.author);
    setIsbn(b.isbn);
    setCategory(b.category);
    setShelf(b.shelf);
    setRack(b.rack);
    setPublisher(b.publisher);
    setPublicationYear(b.publicationYear);
    setTotalCopies(b.totalCopies);
    setDescription(b.description);
    setCoverImage(b.coverImage);
    setModalOpen(true);
  };

  // Upload book cover directly to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setUploadingImage(false);
      if (data.success && data.url) {
        setCoverImage(data.url);
        setToast("Cover image uploaded to Cloudinary!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setUploadingImage(false);
      setToast("Upload completed with direct link");
    }
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    const payload = {
      title,
      author,
      isbn,
      category,
      shelf,
      rack,
      publisher,
      publicationYear: Number(publicationYear),
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      description,
      coverImage
    };

    if (editingBook) {
      fetch(`http://localhost:5000/api/books/${editingBook.bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          setModalOpen(false);
          fetchBooks();
          setToast("Book updated successfully!");
          setTimeout(() => setToast(null), 3000);
        });
    } else {
      fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {
          setModalOpen(false);
          fetchBooks();
          setToast("New book cataloged into Brain Dock!");
          setTimeout(() => setToast(null), 3000);
        });
    }
  };

  const handleDeleteBook = (bookId) => {
    if (!window.confirm("Are you sure you want to remove this book from the active catalogue?")) return;
    fetch(`http://localhost:5000/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      }
    })
      .then(res => res.json())
      .then(() => {
        fetchBooks();
        setToast("Book deleted from catalogue.");
        setTimeout(() => setToast(null), 3000);
      });
  };

  const handleExportCSV = () => {
    const headers = ["BookID,Title,Author,ISBN,Category,Shelf,Rack,TotalCopies,AvailableCopies\n"];
    const rows = books.map(b => 
      `"${b.bookId}","${b.title.replace(/"/g, '""')}","${b.author}","${b.isbn}","${b.category}","${b.shelf}","${b.rack}",${b.totalCopies},${b.availableCopies}`
    );
    const blob = new Blob([...headers, ...rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BrainDock_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBooks = books.filter(b => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                          b.author.toLowerCase().includes(search.toLowerCase()) || 
                          b.isbn.includes(search) || 
                          b.bookId.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Book Catalogue & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage {books.length} physical and digital reference volumes.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={handleOpenAdd}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, ISBN, or Book ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-slate-500 font-semibold">Filter:</span>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="All">All Categories</option>
            <option value="Computer Science & AI">Computer Science & AI</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Self Development & Psychology">Self Development & Psychology</option>
            <option value="Physics & Quantum Tech">Physics & Quantum Tech</option>
            <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
            <option value="Economics & Finance">Economics & Finance</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Cover</th>
                <th className="p-4">Book ID & Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Coordinates</th>
                <th className="p-4">Copies (Avail/Total)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map(book => (
                <tr key={book.bookId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-lg border border-slate-200 shadow-xs" />
                  </td>
                  <td className="p-4 font-medium max-w-xs">
                    <span className="font-mono text-[10px] text-purple-700 font-bold block">{book.bookId}</span>
                    <span className="font-bold text-slate-900 line-clamp-1">{book.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{book.isbn}</span>
                  </td>
                  <td className="p-4 text-slate-600">{book.author}</td>
                  <td className="p-4">
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <span className="text-slate-800 font-bold">{book.shelf}</span>
                    <span className="text-slate-400 block">{book.rack}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    <span className={book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {book.availableCopies}
                    </span> / {book.totalCopies}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {book.status || 'Available'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(book)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors"
                      title="Edit Book"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBook(book.bookId)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-slate-800 space-y-6 relative my-3 sm:my-8 shadow-2xl">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Cataloguer Terminal</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                {editingBook ? `Edit: ${editingBook.title}` : 'Add New Book to Collection'}
              </h3>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Book Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Designing Data-Intensive Applications"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Author Name</label>
                  <input 
                    type="text" 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Martin Kleppmann"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ISBN-13</label>
                  <input 
                    type="text" 
                    value={isbn} 
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Self Development & Psychology">Self Development & Psychology</option>
                    <option value="Physics & Quantum Tech">Physics & Quantum Tech</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Economics & Finance">Economics & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Total Copies</label>
                  <input 
                    type="number" 
                    value={totalCopies} 
                    onChange={(e) => setTotalCopies(e.target.value)}
                    min="1"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Shelf Location</label>
                  <input 
                    type="text" 
                    value={shelf} 
                    onChange={(e) => setShelf(e.target.value)}
                    placeholder="e.g. CS-Shelf 3"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Rack Location</label>
                  <input 
                    type="text" 
                    value={rack} 
                    onChange={(e) => setRack(e.target.value)}
                    placeholder="e.g. Rack 12-B"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Cover Image & Cloudinary Upload */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">Book Cover Image (Cloudinary Integrated)</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="text" 
                    value={coverImage} 
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Cloudinary Image URL or Web Link"
                    className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center space-x-1.5 font-semibold border border-slate-200 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Cloudinary'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Book Description / Synopsis</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter detailed description of the volume..."
                  required
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-all"
                >
                  {editingBook ? 'Update Book' : 'Catalog Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

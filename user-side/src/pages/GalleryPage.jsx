import React, { useState } from 'react';
import { Layers, Sparkles, X, Eye } from 'lucide-react';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const photos = [
    {
      category: 'Reading Area',
      title: 'Main Atrium Silent Reading Hall',
      src: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Study Pods',
      title: 'Turing Acoustic Isolation Pods',
      src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Library',
      title: 'Curated Open Stacks & Reference Aisles',
      src: 'https://images.unsplash.com/photo-1507842229451-2e5f5f4b005e?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Facilities',
      title: 'Ergonomic Desk Suites with Fast Charging',
      src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Events',
      title: 'Brain Dock Annual AI Summit & Discussion',
      src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Study Pods',
      title: 'Ada Lovelace Collaborative Brainstorm Suite',
      src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Facilities',
      title: 'Smart RFID Lockers & Biometric Bay',
      src: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1000&auto=format&fit=crop&q=80'
    },
    {
      category: 'Reading Area',
      title: 'Natural Light Vista & Panoramic Study Terrace',
      src: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80'
    }
  ];

  const categories = ['All', 'Reading Area', 'Study Pods', 'Library', 'Facilities', 'Events'];

  const filteredPhotos = activeCategory === 'All' 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Visual Tour
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Brain Dock <span className="text-gradient-dark-purple">Campus Gallery</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Take a visual walkthrough of our architectural spaces, ergonomic reading halls, and high-performance study suites.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-purple-700 text-white shadow-purple-glow' 
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-purple-card hover:shadow-2xl transition-all duration-300"
            >
              <img 
                src={photo.src} 
                alt={photo.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute top-4 left-4">
                <span className="bg-purple-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md">
                  {photo.category}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <h4 className="font-bold text-sm leading-snug">{photo.title}</h4>
                <div className="flex items-center space-x-1 text-[11px] text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to expand full resolution</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={selectedPhoto.src} alt={selectedPhoto.title} className="w-full max-h-[75vh] object-cover" />
              <div className="p-6 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase">{selectedPhoto.category}</span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPhoto.title}</h3>
                </div>
                <span className="text-xs text-slate-400">Brain Dock Digital Library</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

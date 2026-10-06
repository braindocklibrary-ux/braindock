import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, ArrowRight } from 'lucide-react';

export default function AuthorsPage() {
  const authors = [
    {
      name: 'Martin Kleppmann',
      field: 'Distributed Systems & Data Intensive Computing',
      bio: 'Associate Professor of Computer Science at University of Cambridge, author of Designing Data-Intensive Applications.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      booksCount: 6,
      topBook: 'Designing Data-Intensive Applications'
    },
    {
      name: 'Ian Goodfellow',
      field: 'Deep Learning & Artificial Intelligence',
      bio: 'Pioneer of Generative Adversarial Networks (GANs), former research scientist at Google Brain and Apple AI.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      booksCount: 4,
      topBook: 'Deep Learning & Neural Networks'
    },
    {
      name: 'James Clear',
      field: 'Behavioral Psychology & Habit Optimization',
      bio: 'Author of the #1 New York Times bestseller Atomic Habits, focusing on habits, decision making, and continuous improvement.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      booksCount: 3,
      topBook: 'Atomic Habits'
    },
    {
      name: 'Robert C. Martin (Uncle Bob)',
      field: 'Software Engineering Architecture',
      bio: 'Co-author of the Agile Manifesto, legendary advocate for clean code, solid design principles, and software craftsmanship.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      booksCount: 8,
      topBook: 'Clean Code: Handbook of Software Craft'
    },
    {
      name: 'Yuval Noah Harari',
      field: 'History, Anthropology & Future Studies',
      bio: 'Historian, philosopher, and professor at Hebrew University of Jerusalem, author of Sapiens, Homo Deus, and Nexus.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
      booksCount: 5,
      topBook: 'Sapiens: A Brief History of Humankind'
    },
    {
      name: 'Morgan Housel',
      field: 'Behavioral Finance & Economics',
      bio: 'Partner at Collaborative Fund and bestselling author exploring how human behavior and psychology shape personal finance.',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      booksCount: 3,
      topBook: 'The Psychology of Money'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Intellectual Pioneers
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Featured Authors in Our <span className="text-gradient-dark-purple">Collection</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Read transformative perspectives from world-leading researchers, engineers, historians, and thought leaders curated in Brain Dock.
          </p>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authors.map((author, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card hover:shadow-purple-glow hover:border-purple-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={author.image} 
                    alt={author.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{author.name}</h3>
                    <p className="text-xs text-purple-700 font-medium">{author.field}</p>
                  </div>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{author.bio}</p>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Flagship Work in Library</p>
                  <p className="font-bold text-slate-800 truncate">{author.topBook}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{author.booksCount} Titles Available</span>
                <Link 
                  to={`/books?search=${encodeURIComponent(author.name)}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700 hover:text-purple-900"
                >
                  <span>Explore Books</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

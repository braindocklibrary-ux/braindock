import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Code, 
  Atom, 
  Brain, 
  TrendingUp, 
  BookMarked, 
  Activity, 
  Palette, 
  Layers, 
  Globe, 
  ArrowRight 
} from 'lucide-react';

export default function CategoriesPage() {
  const categories = [
    {
      name: 'Computer Science & AI',
      icon: Cpu,
      count: '4,280 Volumes',
      desc: 'Distributed systems, database internals, algorithms, and cloud native architectures.'
    },
    {
      name: 'Artificial Intelligence',
      icon: Brain,
      count: '3,150 Volumes',
      desc: 'Deep learning, transformers, computer vision, natural language processing, and RL.'
    },
    {
      name: 'Software Engineering',
      icon: Code,
      count: '5,120 Volumes',
      desc: 'Clean architecture, design patterns, microservices, DevOps, and agile craftsmanship.'
    },
    {
      name: 'Physics & Quantum Tech',
      icon: Atom,
      count: '2,400 Volumes',
      desc: 'Quantum computing, theoretical astrophysics, thermodynamics, and particle dynamics.'
    },
    {
      name: 'Business & Entrepreneurship',
      icon: TrendingUp,
      count: '4,890 Volumes',
      desc: 'Zero-to-one startups, venture capital, product strategy, and market economics.'
    },
    {
      name: 'Self Development & Psychology',
      icon: BookMarked,
      count: '3,800 Volumes',
      desc: 'Habit mastery, cognitive performance, high-focus productivity, and resilience.'
    },
    {
      name: 'Economics & Finance',
      icon: Layers,
      count: '2,900 Volumes',
      desc: 'Macroeconomics, quantitative finance, behavioral wealth, and global markets.'
    },
    {
      name: 'Medical & Neuroscience',
      icon: Activity,
      count: '3,450 Volumes',
      desc: 'Neurobiology, brain plasticity, cellular medicine, and clinical physiology.'
    },
    {
      name: 'UI/UX & Product Design',
      icon: Palette,
      count: '1,950 Volumes',
      desc: 'Design systems, visual hierarchy, ergonomics, typography, and human factors.'
    },
    {
      name: 'History & Anthropology',
      icon: Globe,
      count: '3,600 Volumes',
      desc: 'World civilizations, geopolitical history, evolutionary anthropology, and archaeology.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Catalog Taxonomy
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Explore Books by <span className="text-gradient-dark-purple">Disciplines</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Our collection spans tens of thousands of peer-reviewed, masterclass, and foundational texts classified under international library catalog standards.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={idx}
                to={`/books?category=${encodeURIComponent(cat.name)}`}
                className="p-8 rounded-3xl bg-white border border-purple-100 shadow-purple-card hover:shadow-purple-glow hover:border-purple-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-50 flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>Browse Category Shelf</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}

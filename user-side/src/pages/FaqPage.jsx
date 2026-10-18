import React, { useState } from 'react';
import { Search, ChevronDown, HelpCircle, Sparkles, RotateCcw } from 'lucide-react';
import { fallbackFaqs } from '../data/fallbackData';

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = fallbackFaqs;

  const categories = ['All', 'Membership', 'Circulation', 'Hours & Access', 'Study Pods', 'Fines & Payments', 'Facilities'];

  const normalizedSearch = search.toLowerCase().trim().replace(/[\s-_]/g, '');

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    if (!matchesCat) return false;
    if (!normalizedSearch) return true;

    const qNorm = f.q.toLowerCase().replace(/[\s-_]/g, '');
    const aNorm = f.a.toLowerCase().replace(/[\s-_]/g, '');
    const tagMatch = f.tags && f.tags.some(t => t.toLowerCase().replace(/[\s-_]/g, '').includes(normalizedSearch));

    return qNorm.includes(normalizedSearch) || aNorm.includes(normalizedSearch) || tagMatch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked <span className="text-gradient-dark-purple">Questions</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Find answers to commonly asked questions regarding library memberships, acoustic pods, circulation, and digital cards.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword, e.g. 'renew', 'pods', 'wifi'..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-purple-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-purple-card"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === c 
                  ? 'bg-purple-700 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List or Empty Feedback */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  aria-expanded={openIdx === idx}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:text-purple-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 pr-4">
                    <span className="text-xs bg-purple-50 text-purple-700 font-mono px-2 py-0.5 rounded border border-purple-200 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-sm sm:text-base">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-purple-600 shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
                </button>

                {openIdx === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-purple-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Feedback (QA-09) */
          <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border border-purple-200">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">No Matching Questions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any questions matching <strong className="text-purple-900">"{search}"</strong>. Try checking your spelling or use general keywords like "wifi", "pods", or "renew".
              </p>
            </div>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters & Show All FAQs</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

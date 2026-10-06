import React, { useState } from 'react';
import { Search, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      category: 'Membership',
      q: 'How do I activate my Brain Dock Digital Membership Card?',
      a: 'Once you sign up and choose a membership plan, your Digital Membership Card is instantly generated in your Member Portal. You can view the live QR code, save it to Apple/Google Wallet, or download a printable PDF copy.'
    },
    {
      category: 'Circulation',
      q: 'Can I renew my borrowed books online without visiting the library?',
      a: 'Yes! Navigate to your Member Portal > Currently Issued Books and click "Renew Online". As long as another member has not reserved the volume and you have renewals remaining, your loan period extends by 14 to 21 days.'
    },
    {
      category: 'Hours & Access',
      q: 'How does 24/7 night access work?',
      a: 'All enrolled students across both membership plans are registered in our biometric access controller. You can punch in via fingerprint or face recognition 24/7 for seamless entry.'
    },
    {
      category: 'Study Pods',
      q: 'How do I reserve a Turing Soundproof Pod?',
      a: 'Head over to the Study Rooms page, select your preferred suite, choose an available date and 2-hour slot, and confirm. Your reservation confirmation will be delivered to your portal.'
    },
    {
      category: 'Fines & Payments',
      q: 'How are overdue book fines calculated and settled?',
      a: 'A nominal fine of ₹10 per day is calculated after the loan period expires. You can settle fines in seconds via UPI QR directly from the Member Portal under Fines & Payments.'
    },
    {
      category: 'Facilities',
      q: 'Can I bring my own laptop and external monitors?',
      a: 'Absolutely. Every single reading desk and study pod features individual 65W USB-C charging, universal power strips, and low-latency Wi-Fi 7 mesh. Select pods also feature built-in 4K external displays.'
    },
    {
      category: 'Membership',
      q: 'Can I switch or upgrade my membership plan midway?',
      a: 'Yes, upgrades take effect immediately and previous unused balances are prorated toward your new plan tier.'
    }
  ];

  const categories = ['All', 'Membership', 'Circulation', 'Hours & Access', 'Study Pods', 'Fines & Payments', 'Facilities'];

  const filteredFaqs = faqs.filter(f => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === c 
                  ? 'bg-purple-700 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:text-purple-700 transition-colors"
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

      </div>
    </div>
  );
}

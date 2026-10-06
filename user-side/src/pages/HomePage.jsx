import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Wifi, 
  Clock, 
  ShieldCheck, 
  Users, 
  Zap, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Star, 
  VolumeX, 
  Cpu, 
  ChevronDown,
  Laptop,
  Lock,
  Armchair,
  Coffee,
  Utensils,
  Monitor
} from 'lucide-react';
import BookCard from '../components/BookCard';

const getFeatureIcon = (name) => {
  switch (name) {
    case 'Laptop': return Laptop;
    case 'Lock': return Lock;
    case 'Armchair': return Armchair;
    case 'Coffee': return Coffee;
    case 'Utensils': return Utensils;
    case 'Monitor': return Monitor;
    case 'VolumeX': return VolumeX;
    case 'Wifi': return Wifi;
    case 'Clock': return Clock;
    case 'ShieldCheck': return ShieldCheck;
    case 'Cpu': return Cpu;
    case 'Layers': return Layers;
    case 'BookOpen': return BookOpen;
    case 'Users': return Users;
    default: return Sparkles;
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('featured');
  const [faqOpen, setFaqOpen] = useState(null);
  const [statsConfig, setStatsConfig] = useState({ isVisible: false, items: [] });
  const [featuresConfig, setFeaturesConfig] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBooks(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/content/homepage-stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setStatsConfig(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/content/features')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setFeaturesConfig(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/books');
    }
  };

  const featuredBooks = books.filter(b => b.isFeatured).slice(0, 4);
  const popularBooks = books.filter(b => b.isPopular).slice(0, 4);
  const newArrivals = books.filter(b => b.isNewArrival).slice(0, 4);

  const displayedBooks = activeTab === 'featured' 
    ? (featuredBooks.length ? featuredBooks : books.slice(0, 4))
    : activeTab === 'popular'
    ? (popularBooks.length ? popularBooks : books.slice(0, 4))
    : (newArrivals.length ? newArrivals : books.slice(0, 4));

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-800">
      
      {/* ================= HERO SECTION (CLEAN, WARM, EYE-FRIENDLY) ================= */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F7F4FB] via-[#FAF8FD] to-[#FBFBFE] border-b border-purple-100/60 overflow-hidden">
        
        {/* Soft, Non-Harsh Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/25 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Soft Badge */}
            <div className="inline-flex items-center space-x-2 bg-white border border-purple-200/80 px-4 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Official Digital Library & Research Sanctuary
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              A Quiet Sanctuary for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800">
                Deep Intellectual Work.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Brain Dock Library combines architectural silence with an expansive physical and digital collection. 
              Soundproof acoustic pods, 1 Gbps research commons, smart RFID book issues, and ergonomic focus spaces.
            </p>

            {/* Quick Hero Search Input */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0 relative flex items-center shadow-sm rounded-2xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 45,000+ books by title, author, ISBN, or topic..."
                  className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white border border-purple-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm transition-all shadow-xs"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link 
                to="/books" 
                className="flex items-center space-x-2 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all"
              >
                <span>Browse Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/membership" 
                className="flex items-center space-x-2 bg-white hover:bg-purple-50 text-purple-900 px-6 py-3.5 rounded-xl font-bold text-sm border border-purple-200 transition-all shadow-xs"
              >
                <span>Membership Plans</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </Link>
            </div>

            {/* Calm Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>24/7 Smart Pass Entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Soundproof Focus Pods</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Self-Checkout</span>
              </div>
            </div>
          </div>

          {/* Right Refined Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-purple-100 shadow-[0_12px_40px_rgb(76,29,149,0.08)]">
              
              {/* Header with Official Logo */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <img 
                  src="/logo.png" 
                  alt="Brain Dock Logo" 
                  className="h-10 w-auto object-contain"
                />
                <span className="text-[11px] font-mono bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200 font-bold">
                  DOCK-TERMINAL
                </span>
              </div>

              {/* Status Overview */}
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-700 font-semibold flex items-center space-x-1.5">
                      <VolumeX className="w-4 h-4 text-purple-700" />
                      <span>Silent Reading Zone Acoustics</span>
                    </span>
                    <span className="text-xs font-bold text-purple-900">38 dB (Library Whisper)</span>
                  </div>
                  <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
                    <div className="bg-purple-700 h-2 rounded-full w-[28%]"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-800">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-500 font-medium">Available Study Pods</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">4 of 6 Free</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">Ready to Book</span>
                  </div>
                  <Link to="/seats" className="p-4 bg-slate-50 hover:bg-purple-50/60 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all block">
                    <p className="text-[11px] text-slate-500 font-medium">102 Reading Desks</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">Live Floor</p>
                    <span className="text-[11px] text-purple-700 font-semibold flex items-center space-x-1">
                      <span>Open 3D Seat Map</span>
                      <ArrowRight className="w-3 h-3 inline" />
                    </span>
                  </Link>
                </div>

                {/* Featured Book Preview */}
                <div className="p-3.5 bg-white rounded-2xl border border-purple-100 flex items-center space-x-3.5 shadow-xs">
                  <img 
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200" 
                    alt="Book Cover" 
                    className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold">Featured Digital Book</span>
                    <p className="text-xs font-bold text-slate-900 truncate">Designing Data-Intensive Apps</p>
                    <p className="text-[11px] text-emerald-700 font-semibold truncate">🟢 Online Full-Text • Instant Access</p>
                  </div>
                  <Link to="/books" className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Bottom Turnstile Gate Indicator */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-medium text-slate-700">Turnstile Biometrics Active</span>
                </span>
                <span className="font-mono text-purple-800 font-semibold">24/7 Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REFINED STATISTICS SECTION ================= */}
      {statsConfig?.isVisible && statsConfig?.items?.length > 0 && (
        <section className="bg-white border-b border-slate-100 py-12 px-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {statsConfig.items.map((stat, idx) => (
              <div 
                key={stat.id || idx} 
                className={`space-y-1 ${idx === statsConfig.items.length - 1 && statsConfig.items.length % 2 !== 0 ? 'col-span-2 md:col-span-1' : ''}`}
              >
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stat.number}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= WHY BRAIN DOCK LIBRARY ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {featuresConfig?.badge || 'The Brain Dock Difference'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {featuresConfig?.title || 'Engineered for Concentration & Clarity'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {featuresConfig?.subtitle || 'We removed the noise, slow checkouts, and visual clutter to build a reading ecosystem focused purely on comprehension.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuresConfig?.items || [
            {
              id: 'feat-1',
              icon: 'Laptop',
              title: 'Personal Dedicated Desk',
              description: 'Your own fixed study desk reserved 24/7 with personal multi-plug power sockets, soft-reading LED lamp, and partition privacy.',
              tag: 'Personal Desk'
            },
            {
              id: 'feat-2',
              icon: 'Lock',
              title: 'Personal Secure Locker',
              description: 'Spacious individual lock & key locker for safe storage of heavy reference books, laptops, bags, and study notes.',
              tag: 'Personal Locker'
            },
            {
              id: 'feat-3',
              icon: 'Armchair',
              title: 'Ergonomic Revolving Chair',
              description: '360° revolving executive mesh chairs with breathable backrest, adjustable height, and lumbar support for fatigue-free 12+ hour study sessions.',
              tag: 'Revolving Chair'
            },
            {
              id: 'feat-4',
              icon: 'Coffee',
              title: 'Hygienic Pantry Area',
              description: 'Dedicated clean pantry & refreshment lounge equipped with chilled RO drinking water, hot tea/coffee station, dining tables, and microwave.',
              tag: 'Pantry Area'
            },
            {
              id: 'feat-5',
              icon: 'VolumeX',
              title: 'Acoustic Soundproofing & AC',
              description: 'Calibrated acoustic sound-dampening walls, double-glazed glass, and strict whisper policies ensuring pin-drop silence below 40dB.',
              tag: 'Silent Zone'
            },
            {
              id: 'feat-6',
              icon: 'Wifi',
              title: 'Wi-Fi 7 Gigabit High-Speed Mesh',
              description: 'Low-latency symmetrical fiber mesh internet with seamless roaming and unlimited bandwidth for video lectures and research.',
              tag: 'Gigabit Mesh'
            },
            {
              id: 'feat-7',
              icon: 'Clock',
              title: '24/7 Biometric Smart Punch',
              description: 'High-speed fingerprint and smart terminal access for round-the-clock entry with real-time student study hours tracking.',
              tag: '24/7 Access'
            },
            {
              id: 'feat-8',
              icon: 'ShieldCheck',
              title: 'CCTV Surveillance & Safety',
              description: 'Full HD CCTV camera coverage with dedicated campus security, female scholar safety protocols, and emergency assistance.',
              tag: '100% Secure'
            }
          ]).map((feat) => {
            const IconComp = getFeatureIcon(feat.icon);
            return (
              <div 
                key={feat.id} 
                className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    {feat.tag && (
                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/70 px-2 py-0.5 rounded-md">
                        {feat.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= CURATED BOOKS ================= */}
      <section className="py-16 bg-[#F7F6FB] border-y border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-purple-700">Digital Archive</span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Curated Reading Collection</h2>
              <p className="text-slate-600 text-sm mt-1">Explore top-rated volumes, research papers, and technical handbooks.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
              <button 
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'featured' 
                    ? 'bg-purple-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Featured
              </button>
              <button 
                onClick={() => setActiveTab('popular')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'popular' 
                    ? 'bg-purple-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Most Borrowed
              </button>
              <button 
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'new' 
                    ? 'bg-purple-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                New Arrivals
              </button>
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedBooks.map(book => (
              <BookCard key={book.bookId} book={book} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/books" 
              className="inline-flex items-center space-x-2 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition-all"
            >
              <span>Explore All 45,000+ Books</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SOUNDPROOF STUDY PODS ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Acoustic Isolation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Soundproof Study Pods & Reserved Suites
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Need to conduct a doctoral defense, lead a virtual symposium, or engage in 6 hours of unbroken problem solving? 
              Brain Dock's private acoustic suites provide 45dB acoustic isolation with dual 4K displays and HEPA air filtration.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
                <span>Zero-Noise acoustic isolation with private climate vents</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
                <span>Smart privacy glass switches from clear to frost</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
                <span>Instant slot reservations through your Member Portal</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-4">
              <Link 
                to="/study-rooms" 
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-xs"
              >
                Reserve a Study Room
              </Link>
              <Link 
                to="/seats" 
                className="bg-white hover:bg-purple-50 text-purple-900 font-bold text-sm px-6 py-3.5 rounded-xl border border-purple-200 hover:border-purple-300 transition-all shadow-xs flex items-center space-x-2"
              >
                <span>View 3D 102-Seat Map</span>
                <ArrowRight className="w-4 h-4 text-purple-700" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80" 
                alt="Soundproof Study Pod" 
                className="w-full h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs uppercase font-bold text-purple-300">Floor 2 • Innovation Wing</span>
                <h4 className="text-xl font-bold">Turing Neural Pod (45dB Soundproof)</h4>
                <p className="text-xs text-slate-300 mt-1">Equipped with 4K display, motorized sit-stand desk, and HEPA filtration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MEMBERSHIP PLANS (CALM, CLEAN SAAS STYLE) ================= */}
      <section className="py-20 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Transparent Membership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple, Predictable Plans
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Special inaugural offer for the first 50 students at ₹849/month, and standard admissions at ₹999/month with 100% identical luxury facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 items-stretch">
            
            {/* Offer 1: First 50 Students @ ₹849 */}
            <div className="bg-white border-2 border-purple-600 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative transform lg:-translate-y-2">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>FIRST 50 ADMISSIONS OFFER</span>
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                    Inaugural Special
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Save ₹150/mo
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">First 50 Students</h3>
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">₹849</span>
                  <span className="text-xs text-slate-500 ml-2 font-medium">/ month</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Special introductory fee reserved strictly for the first 50 admissions.
                </p>
                
                <div className="space-y-3 mt-6 border-t border-purple-100 pt-6 text-xs text-slate-700">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Personal Reserved Desk</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Ergonomic Revolving Executive Chair</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Dedicated Personal Locker</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Pantry Area & RO Drinking Water</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">24/7 Silent AC Reading Sanctuary Access</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Smart Biometric (Fingerprint/Face) Door Security</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">1 Gbps Ultra-Fast Optical Wi-Fi Mesh</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Personal Desk Power Sockets & LED Lighting</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Digital E-Library & OPAC Privileges</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/register" 
                className="mt-8 block text-center bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
              >
                Claim ₹849 Admission Offer
              </Link>
            </div>

            {/* Offer 2: Standard Admissions @ ₹999 */}
            <div className="bg-slate-50 border border-slate-200 hover:border-purple-200 rounded-3xl p-8 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-300">
                    Standard Plan
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    51st Admission Onwards
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mt-3">Standard Membership</h3>
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">₹999</span>
                  <span className="text-xs text-slate-500 ml-2 font-medium">/ month</span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Regular fee applicable after the first 50 seats with identical facilities.
                </p>
                
                <div className="space-y-3 mt-6 border-t border-slate-200 pt-6 text-xs text-slate-700">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Personal Reserved Desk</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Ergonomic Revolving Executive Chair</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Dedicated Personal Locker</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Pantry Area & RO Drinking Water</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">24/7 Silent AC Reading Sanctuary Access</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Smart Biometric (Fingerprint/Face) Door Security</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">1 Gbps Ultra-Fast Optical Wi-Fi Mesh</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Personal Desk Power Sockets & LED Lighting</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Digital E-Library & OPAC Privileges</span>
                  </div>
                </div>
              </div>

              <Link 
                to="/register" 
                className="mt-8 block text-center bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-xs border border-slate-300 transition-all shadow-xs"
              >
                Join for ₹999 / month
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Member Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Serious Thinkers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              "Brain Dock Library has completely transformed my research routine. The Turing soundproof pods with high-speed fiber allow me to train models and write papers in pure, uninterrupted peace."
            </p>
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Dr. Sameer Desai" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Dr. Sameer Desai</h4>
                <p className="text-xs text-purple-800 font-semibold">AI Researcher & Data Architect</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              "The silent reading environment and ergonomic chairs made 12-hour study sessions effortless. The digital seat reservation system ensures I never lose my favorite desk."
            </p>
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" alt="Riddhi Pandya" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Riddhi Pandya</h4>
                <p className="text-xs text-purple-800 font-semibold">UPSC Aspirant (AIR 42)</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              "Hands down the best library ecosystem I have experienced. The book collection is modern, the digital membership card on mobile works flawlessly, and the atmosphere is world-class."
            </p>
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" alt="Kabir Singhania" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Kabir Singhania</h4>
                <p className="text-xs text-purple-800 font-semibold">Staff Software Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="py-16 bg-[#F7F6FB] border-t border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-purple-700">FAQ</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How do I activate my Brain Dock Digital Membership Card?",
                a: "Once you sign up and choose a membership plan, your Digital Membership Card is instantly generated in your Member Portal. You can view the live QR code, save it to Apple/Google Wallet, or download a printable PDF copy."
              },
              {
                q: "What are the operating hours of Brain Dock Library?",
                a: "The general library and circulation desk operate from 07:00 AM to 11:00 PM. For Scholar and Executive members, 24/7 biometric and QR access is active throughout the year."
              },
              {
                q: "How do I book a private soundproof pod or study room?",
                a: "Navigate to the Study Rooms section in the website or your member dashboard, select your preferred room, pick a date and time slot, and confirm. Your reservation code will be emailed and displayed on your dashboard."
              },
              {
                q: "What happens if a book is overdue?",
                a: "A late fee of ₹10/day applies after the grace period. You will receive automated reminders before the due date, and fines can be settled seamlessly via UPI through your portal."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button 
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:text-purple-700 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REFINED FOOTER BANNER ================= */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl shadow-purple-950/40 mb-2">
            <img 
              src="/logo.png" 
              alt="Brain Dock Logo" 
              className="h-10 sm:h-12 w-auto mx-auto object-contain"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Elevate Your Daily Reading Routine?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join thousands of active scholars, developers, and writers. Unlock 24/7 access, quiet study pods, and our complete catalogue today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link 
              to="/register" 
              className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all"
            >
              Get Your Digital Membership
            </Link>
            <Link 
              to="/contact" 
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm border border-slate-700 transition-all"
            >
              Book a Campus Tour
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

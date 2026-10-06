import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Clock, 
  ArrowRight,
  LogOut,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenNotifications }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [studentSession, setStudentSession] = useState(null);
  const { user, logout, unreadNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const checkSession = () => {
      try {
        const saved = localStorage.getItem('bdl_student_session');
        if (saved) {
          setStudentSession(JSON.parse(saved));
        } else {
          setStudentSession(null);
        }
      } catch (e) {
        setStudentSession(null);
      }
    };
    checkSession();
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleStudentLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem('bdl_student_session');
    setStudentSession(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-200">
      {/* Main Clean Navigation Bar */}
      <nav className="clean-glass-nav shadow-xs bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* OFFICIAL BRAND LOGO */}
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <img 
                src="/logo.png" 
                alt="Brain Dock Library Official Logo" 
                className="h-8 sm:h-11 w-auto object-contain transition-transform duration-200 hover:scale-102"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 text-slate-700">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/books" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/books') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Digital Books
              </Link>
              <Link 
                to="/seats" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/seats') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Seat Booking
              </Link>
              <Link 
                to="/study-rooms" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/study-rooms') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Study Rooms
              </Link>
              <Link 
                to="/membership" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/membership') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Membership
              </Link>
              <Link 
                to="/facilities" 
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/facilities') ? 'text-purple-700 bg-purple-50' : 'hover:text-purple-900 hover:bg-slate-50'
                }`}
              >
                Facilities
              </Link>

              {/* More Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  className="flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-purple-900 hover:bg-slate-50 transition-colors"
                >
                  <span>More</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                    <Link to="/events" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">Events & Workshops</Link>
                    <Link to="/gallery" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">Campus Gallery</Link>
                    <Link to="/rules" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">Rules & Guidelines</Link>
                    <Link to="/about" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">About Brain Dock</Link>
                    <Link to="/faq" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">FAQ & Helpdesk</Link>
                    <Link to="/contact" className="block px-4 py-2 text-sm text-slate-700 hover:text-purple-900 hover:bg-purple-50 font-medium">Contact Concierge</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2.5">
              {/* Search Shortcut */}
              <button 
                onClick={() => navigate('/books')}
                className="p-2.5 rounded-xl text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                title="Search books..."
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              {user && (
                <button 
                  onClick={onOpenNotifications}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}

              {/* Student Portal Account Badge */}
              {studentSession?.student ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link 
                    to="/student-portal" 
                    className="flex items-center space-x-2.5 bg-purple-50 hover:bg-purple-100 text-purple-950 px-3 py-1.5 rounded-xl border border-purple-200 transition-all shadow-xs group"
                    title="Open Student Portal"
                  >
                    {studentSession.student.photoUrl ? (
                      <img 
                        src={studentSession.student.photoUrl} 
                        alt={studentSession.student.studentName} 
                        className="w-8 h-8 rounded-full object-cover border border-purple-300 ring-2 ring-purple-100 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                        {studentSession.student.studentName ? studentSession.student.studentName[0].toUpperCase() : 'S'}
                      </div>
                    )}
                    
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-xs text-slate-800 group-hover:text-purple-800 transition-colors leading-tight whitespace-nowrap">
                        {studentSession.student.studentName}
                      </div>
                      <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Desk #{studentSession.student.allocatedSeatNumber || studentSession.student.biometricPin || '01'}</span>
                      </div>
                    </div>
                  </Link>

                  <button 
                    onClick={handleStudentLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Log Out Student"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/student-portal"
                  className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 shrink-0"
                >
                  <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
                  <span className="hidden min-[360px]:inline">Student Portal</span>
                  <span className="inline min-[360px]:hidden">Portal</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            <Link 
              to="/student-portal" 
              onClick={() => setMobileMenuOpen(false)} 
              className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200"
            >
              <span className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-purple-700" />
                <span>Student Portal</span>
              </span>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </Link>

            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Home</Link>
            <Link to="/books" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Digital Books</Link>
            <Link to="/seats" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Seat Booking</Link>
            <Link to="/study-rooms" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Study Rooms</Link>
            <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Membership Plans</Link>
            <Link to="/facilities" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Facilities</Link>
            <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Events & Workshops</Link>
            <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Campus Gallery</Link>
            <Link to="/rules" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Rules & Guidelines</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">About Us</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-purple-50">Contact Concierge</Link>
            
            <div className="pt-3 border-t border-slate-100">
              <a 
                href="http://localhost:5174" 
                target="_blank" 
                rel="noreferrer" 
                className="w-full flex items-center justify-center space-x-2 bg-purple-50 text-purple-900 border border-purple-200 py-2.5 rounded-xl font-bold text-xs"
              >
                <span>Admin ERP Control Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F0FB] text-slate-700 border-t border-purple-100/80 pt-14 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          
          {/* Brand Info & Mission */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <img 
                src="/logo.png" 
                alt="Brain Dock Library Official Logo" 
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              />
            </Link>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Brain Dock Library is an intelligent 24/7 reading sanctuary & digital knowledge terminal. 
              Equipped with soundproof study desks, biometric punch security, gigabit fiber mesh, and research amenities.
            </p>
          </div>

          {/* Column 1: Library Core */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 text-xs font-extrabold tracking-wider uppercase font-mono flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              <span>Library Core</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li><Link to="/books" className="hover:text-purple-700 transition-colors font-medium">Digital Catalogue</Link></li>
              <li><Link to="/categories" className="hover:text-purple-700 transition-colors font-medium">Book Categories</Link></li>
              <li><Link to="/authors" className="hover:text-purple-700 transition-colors font-medium">Featured Authors</Link></li>
              <li><Link to="/study-rooms" className="hover:text-purple-700 transition-colors font-medium">Study Rooms</Link></li>
              <li><Link to="/seats" className="hover:text-purple-700 transition-colors font-medium">Seat Booking</Link></li>
              <li><Link to="/facilities" className="hover:text-purple-700 transition-colors font-medium">Campus Facilities</Link></li>
            </ul>
          </div>

          {/* Column 2: Membership & Student LMS */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 text-xs font-extrabold tracking-wider uppercase font-mono flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span>Student & Plans</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <li><Link to="/membership" className="hover:text-purple-700 transition-colors font-medium">Membership Plans</Link></li>
              <li>
                <Link to="/student-portal" className="inline-flex items-center space-x-1 font-bold text-purple-700 hover:text-purple-900 transition-colors">
                  <span>Student Portal (LMS)</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li><Link to="/student-portal" className="hover:text-purple-700 transition-colors font-medium">Biometric Attendance Logs</Link></li>
              <li><Link to="/events" className="hover:text-purple-700 transition-colors font-medium">Workshops & Events</Link></li>
              <li><Link to="/announcements" className="hover:text-purple-700 transition-colors font-medium">Official Announcements</Link></li>
              <li><Link to="/gallery" className="hover:text-purple-700 transition-colors font-medium">Virtual Photo Tour</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact & Campus Visit */}
          <div className="space-y-3.5">
            <h4 className="text-slate-900 text-xs font-extrabold tracking-wider uppercase font-mono flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Campus & Helpdesk</span>
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 shrink-0 mt-0.5 border border-purple-200/60">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="leading-relaxed">2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 shrink-0 border border-purple-200/60">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a href="tel:+916356006100" className="hover:text-purple-700 transition-colors font-bold font-mono">
                  +91 63 5600 6100
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 shrink-0 border border-purple-200/60">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a href="mailto:concierge@braindocklibrary.com" className="hover:text-purple-700 transition-colors truncate">
                  concierge@braindocklibrary.com
                </a>
              </div>

              <div className="flex items-start space-x-2.5 pt-1">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5 border border-emerald-200/60">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">24/7 Access For Members</p>
                  <p className="text-[11px] text-slate-500">Staff Desk: 7:00 AM – 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Brain Dock Library. All Rights Reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-1.5 text-xs">
            <Link to="/rules" className="hover:text-purple-700 transition-colors">Library Rules</Link>
            <Link to="/privacy" className="hover:text-purple-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-purple-700 transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-purple-700 transition-colors">Help & FAQ</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

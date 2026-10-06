import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserCheck, 
  ArrowLeftRight, 
  Bookmark, 
  VolumeX, 
  Grid, 
  Lock, 
  CreditCard, 
  AlertCircle, 
  Calendar, 
  Bell, 
  Image, 
  FileBarChart, 
  Settings, 
  ShieldCheck, 
  History, 
  Layers, 
  ExternalLink,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { currentStaff, logout, mobileSidebarOpen, closeMobileSidebar } = useAdminAuth();

  const menuSections = [
    {
      title: '👑 Director & Owner Desk',
      items: [
        { name: '102 Seats & Fee Portal', path: '/owner-portal', icon: ShieldCheck, badge: 'EXCLUSIVE' }
      ]
    },
    {
      title: 'Core Operations',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Reports & Analytics', path: '/reports', icon: FileBarChart },
        { name: 'Audit Logs', path: '/audit-logs', icon: History }
      ]
    },
    {
      title: 'Circulation & Books',
      items: [
        { name: 'Book Catalogue (CRUD)', path: '/books', icon: BookOpen },
        { name: 'Circulation Desk (Issue/Return)', path: '/circulation', icon: ArrowLeftRight },
        { name: 'Book Reservations', path: '/reservations', icon: Bookmark }
      ]
    },
    {
      title: 'Members & Personnel',
      items: [
        { name: 'Members Directory', path: '/members', icon: Users },
        { name: 'Staff & Personnel', path: '/staff', icon: UserCheck },
        { name: 'Membership Plans', path: '/financials', icon: Layers }
      ]
    },
    {
      title: 'Spaces & Facilities',
      items: [
        { name: 'Study Rooms & Seats', path: '/facilities', icon: VolumeX },
        { name: 'Lockers Management', path: '/facilities', icon: Lock }
      ]
    },
    {
      title: 'Accounts & Fines',
      items: [
        { name: 'Payments & Fine Collection', path: '/financials', icon: CreditCard }
      ]
    },
    {
      title: 'Communications & Web',
      items: [
        { name: 'Events & Workshops', path: '/events', icon: Calendar },
        { name: 'Announcements & Alerts', path: '/events', icon: Bell },
        { name: 'Web Content & Gallery', path: '/content', icon: Image }
      ]
    },
    {
      title: 'System & Governance',
      items: [
        { name: 'Library Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col h-screen text-slate-700 select-none shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-[1px_0_4px_rgba(0,0,0,0.02)] shrink-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Official Brand Logo Area */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <Link to="/owner-portal" onClick={closeMobileSidebar} className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Brain Dock Library Official Logo" 
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-purple-900 font-extrabold bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              SUPER ADMIN
            </span>
            <a 
              href="http://localhost:5173" 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] font-medium text-slate-500 hover:text-purple-700 flex items-center space-x-1 transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Navigation Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </p>
              {section.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active 
                        ? 'bg-purple-50 text-purple-900 shadow-xs border border-purple-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-purple-700' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          {item.badge}
                        </span>
                      )}
                      {active && <ChevronRight className="w-3.5 h-3.5 text-purple-700" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

      {/* Super Admin Profile Card & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img 
            src={currentStaff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} 
            alt={currentStaff.name} 
            className="w-9 h-9 rounded-xl object-cover border border-purple-200 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{currentStaff.name}</p>
            <div className="flex items-center space-x-1 text-[10px] text-purple-700 font-extrabold">
              <ShieldCheck className="w-3 h-3" />
              <span>SUPER ADMIN</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
    </>
  );
}

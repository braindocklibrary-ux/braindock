import React from 'react';
import { 
  Bell, 
  ExternalLink, 
  Database, 
  ShieldCheck,
  LogOut,
  Menu
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminHeader() {
  const { currentStaff, logout, toggleMobileSidebar } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      
      {/* Left: Mobile Drawer Trigger & System Status */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-slate-100 transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-slate-700 hidden sm:inline truncate">Brain Dock Library Terminal</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 shrink-0">
          <Database className="w-3.5 h-3.5 text-purple-600" />
          <span>MongoDB Atlas Sync: Connected</span>
        </div>
      </div>

      {/* Right Actions & Super Admin Badge */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        
        {/* Permanent Super Admin Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-purple-50 border border-purple-200/80 px-2 sm:px-3 py-1.5 rounded-xl shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
          <div className="text-left hidden sm:block leading-tight">
            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Access Level</span>
            <span className="text-xs font-black text-purple-950">SUPER ADMIN</span>
          </div>
        </div>

        {/* View Public Website */}
        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noreferrer"
          className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-2.5 sm:px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-xs"
        >
          <span className="hidden min-[420px]:inline">User Website</span>
          <span className="inline min-[420px]:hidden">Site</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {/* Notifications Icon */}
        <div className="relative">
          <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600"></span>
          </button>
        </div>

        {/* Secure Logout Button */}
        <button
          onClick={logout}
          title="Sign out of Super Admin session"
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  ArrowLeftRight, 
  AlertTriangle, 
  DollarSign, 
  Bookmark, 
  Eye, 
  Plus, 
  Sparkles, 
  VolumeX, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
  
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 45,
    availableBooks: 39,
    issuedBooks: 2,
    overdueBooks: 1,
    totalMembers: 6,
    activeMembers: 6,
    totalRevenue: 148500,
    pendingFines: 50,
    studySeats: 18,
    availableSeats: 14,
    dailyVisitors: 342,
    digitalResources: 18450
  });

  const [charts, setCharts] = useState({
    monthlyIssues: [
      { month: 'Apr', count: 120 },
      { month: 'May', count: 155 },
      { month: 'Jun', count: 190 },
      { month: 'Jul', count: 240 },
      { month: 'Aug', count: 310 },
      { month: 'Sep', count: 420 }
    ],
    categoryDistribution: [
      { name: 'Computer Science & AI', count: 42 },
      { name: 'Literature & Philosophy', count: 28 },
      { name: 'Business & Finance', count: 24 },
      { name: 'Quantum & Physics', count: 18 },
      { name: 'Medical & Neuroscience', count: 15 }
    ]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/reports/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStats(data.data);
          if (data.charts) setCharts(data.charts);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner - Eye-Friendly Crisp Card */}
      <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/80 text-[11px] text-purple-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time Operations Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Brain Dock Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Live monitoring of physical circulation, biometric turnstiles, acoustic pods, and member subscriptions.
          </p>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            to="/books" 
            className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </Link>
          <Link 
            to="/circulation" 
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <ArrowLeftRight className="w-4 h-4 text-purple-700" />
            <span>Circulation Desk</span>
          </Link>
        </div>
      </div>

      {/* 10 Core Stat Metrics Grid - Clean, High Legibility, Calm */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Books</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBooks}</h3>
          <span className="text-[11px] font-medium text-emerald-600">{stats.availableBooks} Available Now</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Members</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.activeMembers}</h3>
          <span className="text-[11px] font-medium text-purple-700">100% Verified</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issued Books</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.issuedBooks}</h3>
          <span className="text-[11px] font-medium text-slate-500">Active Loans</span>
        </div>

        <div className="bg-white border border-rose-100 p-5 rounded-2xl shadow-xs hover:border-rose-300 transition-all">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Overdue Items</span>
          <h3 className="text-2xl font-bold text-rose-700 mt-1">{stats.overdueBooks}</h3>
          <span className="text-[11px] font-medium text-rose-500">Notice Dispatched</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalRevenue?.toLocaleString()}</h3>
          <span className="text-[11px] font-medium text-emerald-600">+24% this quarter</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Fines</span>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">₹{stats.pendingFines}</h3>
          <span className="text-[11px] font-medium text-slate-500">Late returns</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Study Seats</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.studySeats} Total</h3>
          <span className="text-[11px] font-medium text-emerald-600">{stats.availableSeats} Available</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Daily Footfall</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.dailyVisitors}</h3>
          <span className="text-[11px] font-medium text-slate-500">Turnstile entries</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Digital Papers</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.digitalResources}</h3>
          <span className="text-[11px] font-medium text-purple-700">Indexed Journals</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-purple-300 transition-all">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cloud Storage</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">Online</h3>
          <span className="text-[11px] font-medium text-slate-500">hiifll86 Active</span>
        </div>

      </div>

      {/* Visual Analytics Charts - Clean Slate & Purple */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Circulation Bar Trend */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Circulation Activity</h3>
              <p className="text-xs text-slate-400">Total books loaned per calendar month</p>
            </div>
            <span className="text-[10px] text-purple-800 bg-purple-50 font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
              2026 METRIC
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-8 px-2 border-b border-slate-100 pb-2">
            {charts.monthlyIssues.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-slate-500 font-mono font-semibold">{item.count}</span>
                <div 
                  className="w-full bg-purple-600 hover:bg-purple-700 rounded-t-lg transition-all duration-300"
                  style={{ height: `${(item.count / 450) * 100}%` }}
                ></div>
                <span className="text-[11px] text-slate-600 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution Progress Bars */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Borrowed Disciplines</h3>
              <p className="text-xs text-slate-400">Proportional demand across faculties</p>
            </div>
            <span className="text-[10px] text-purple-800 bg-purple-50 font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
              RATIO
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {charts.categoryDistribution.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                  <span className="text-slate-900 font-mono font-bold">{cat.count}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cat.count}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Circulation Activity Feed */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Circulation & Desk Feed</h3>
            <p className="text-xs text-slate-400">Real-time checkouts and alert triggers</p>
          </div>
          <Link to="/circulation" className="text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors">
            View All Issues →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <div>
                <p className="font-bold text-slate-900">Designing Data-Intensive Applications</p>
                <p className="text-slate-500 text-[11px]">Issued to Aarav Mehta (BDL-MEM-8842)</p>
              </div>
            </div>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium px-2.5 py-1 rounded-md text-[11px]">
              Due: 08 Oct 2026
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              <div>
                <p className="font-bold text-slate-900">Deep Learning & Neural Networks</p>
                <p className="text-slate-500 text-[11px]">Overdue with Sneha Roy (BDL-MEM-9921) • Fine: ₹40</p>
              </div>
            </div>
            <span className="text-rose-700 bg-rose-50 border border-rose-200 font-medium px-2.5 py-1 rounded-md text-[11px]">
              Overdue (4 Days)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}

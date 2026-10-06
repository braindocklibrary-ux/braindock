import React, { useState } from 'react';
import { Settings, Database, CloudRain, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  const [libraryName, setLibraryName] = useState('BRAIN DOCK LIBRARY');
  const [finePerDay, setFinePerDay] = useState(10);
  const [defaultLoanDays, setDefaultLoanDays] = useState(14);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          System Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Library System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure operational rules, database synchronization, and cloud storage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Database & Cloudinary Status Cards */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">MongoDB Atlas Cluster</h4>
              <p className="text-xs text-emerald-600 font-semibold">Active & Synced</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Cluster: cluster0.7dpsi7g.mongodb.net
          </p>
          <p className="text-[11px] text-slate-400">
            Database: braindock_library • Fallback cache: Operational
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cloudinary CDN Storage</h4>
              <p className="text-xs text-emerald-600 font-semibold">hiifll86 Connected</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Key: 462785225922261 • Folder: braindock
          </p>
          <p className="text-[11px] text-slate-400">
            Official logos & book covers hosted with HTTPS delivery.
          </p>
        </div>

      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900">General Circulation Rules</h3>
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Official Brand Name</label>
            <input 
              type="text" 
              value={libraryName} 
              onChange={(e) => setLibraryName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Late Return Fine (₹ per day)</label>
              <input 
                type="number" 
                value={finePerDay} 
                onChange={(e) => setFinePerDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Default Loan Duration (Days)</label>
              <input 
                type="number" 
                value={defaultLoanDays} 
                onChange={(e) => setDefaultLoanDays(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button 
              type="submit" 
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
            {saved && (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-medium text-xs flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settings synchronized</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

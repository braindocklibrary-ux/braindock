import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Pin, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAnnouncements(data.data);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Administrative Notices
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Official <span className="text-gradient-dark-purple">Announcements</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Stay up to date with holiday library schedules, new acquisitions, technical upgrades, and member notices.
          </p>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.map(ann => (
            <div 
              key={ann.announcementId}
              className={`p-6 sm:p-8 rounded-3xl bg-white border transition-all shadow-purple-card ${
                ann.isPinned ? 'border-purple-400 bg-purple-50/20' : 'border-purple-100'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  {ann.isPinned && (
                    <span className="inline-flex items-center space-x-1 bg-purple-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" />
                      <span>PINNED</span>
                    </span>
                  )}
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {ann.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ann.priority === 'High' || ann.priority === 'Urgent' 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ann.priority} Priority
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {ann.announcementId}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{ann.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>

              <div className="mt-4 pt-4 border-t border-purple-50 flex items-center justify-between text-xs text-slate-400">
                <span>Issued by: <strong className="text-purple-900">{ann.publishedBy}</strong></span>
                <span>Active Notification</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

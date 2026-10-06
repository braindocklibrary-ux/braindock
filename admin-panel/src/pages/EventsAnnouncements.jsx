import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, Pin, Users, Clock, MapPin, X } from 'lucide-react';

export default function EventsAnnouncements() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('events');

  // Announcement form modal
  const [annModal, setAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('General');
  const [annPriority, setAnnPriority] = useState('Normal');

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => { if (data.success) setEvents(data.data); });

    fetch('http://localhost:5000/api/announcements')
      .then(res => res.json())
      .then(data => { if (data.success) setAnnouncements(data.data); });
  }, []);

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({
        title: annTitle,
        content: annContent,
        category: annCategory,
        priority: annPriority,
        isPinned: false
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnnouncements([data.data, ...announcements]);
          setAnnModal(false);
          setAnnTitle('');
          setAnnContent('');
        }
      });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Public Outreach & Alerts
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Events & Official Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule author symposiums and publish broadcast notices across the library network.</p>
        </div>

        <button 
          onClick={() => setAnnModal(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="flex space-x-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl text-xs font-semibold shadow-xs">
        <button 
          onClick={() => setActiveTab('events')} 
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'events' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Upcoming Events ({events.length})
        </button>
        <button 
          onClick={() => setActiveTab('announcements')} 
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Announcements ({announcements.length})
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(e => (
            <div key={e.eventId} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs hover:border-purple-300 transition-all">
              <span className="font-mono text-[10px] text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 font-bold">{e.eventId}</span>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{e.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{e.description}</p>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p>Speaker: <strong className="text-purple-750 font-bold">{e.speaker}</strong></p>
                <p>Date: {e.date} • {e.time}</p>
                <p>Enrolled: <strong className="text-emerald-700 font-bold">{e.registeredSeats}</strong> / {e.totalSeats} seats</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.announcementId} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-2 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-purple-50 text-purple-800 font-mono px-2 py-0.5 rounded border border-purple-200 font-semibold">{ann.announcementId}</span>
                <span className="text-xs font-bold text-purple-900">{ann.category}</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{ann.priority} Priority</span>
              </div>
              <h4 className="font-bold text-slate-900 text-base">{ann.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      {annModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setAnnModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-5 shadow-2xl relative my-4 sm:my-10">
            <button 
              onClick={() => setAnnModal(false)} 
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900">Publish Official Notice</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Headline</label>
                <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select value={annCategory} onChange={(e) => setAnnCategory(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <option value="General">General</option>
                    <option value="Holiday">Holiday Schedule</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="New Acquisition">New Acquisition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Priority</label>
                  <select value={annPriority} onChange={(e) => setAnnPriority(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Content / Body</label>
                <textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} rows="3" className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600" required></textarea>
              </div>
              <div className="flex items-center space-x-3 pt-3">
                <button type="button" onClick={() => setAnnModal(false)} className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold">Cancel</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

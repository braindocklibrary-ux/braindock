import React from 'react';
import { X, Check, Bell, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { unreadNotifications, setUnreadNotifications } = useAuth();

  if (!isOpen) return null;

  const sampleNotifications = [
    {
      id: 1,
      type: 'book',
      title: 'Due Date Approaching',
      desc: '"Designing Data-Intensive Applications" is due on 08 Oct 2026. Auto-renewal available.',
      time: '10 mins ago',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      id: 2,
      type: 'room',
      title: 'Study Room Confirmed',
      desc: 'Turing Neural Pod booked for 28 Sep 2026, 04:00 PM - 06:00 PM.',
      time: '2 hours ago',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Upcoming Workshop Announcement',
      desc: '"Future of Generative AI" registration is open for library members.',
      time: 'Yesterday',
      icon: Bell,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  const handleMarkAllRead = () => {
    setUnreadNotifications(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-white text-slate-800 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
                <Bell className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Member Notifications</h3>
                <p className="text-xs text-slate-500">Updates on loans, bookings & alerts</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Subbar */}
          <div className="px-6 py-3 bg-purple-50 flex items-center justify-between border-b border-purple-100">
            <span className="text-xs font-semibold text-purple-900">
              {unreadNotifications > 0 ? `${unreadNotifications} Unread Updates` : 'All caught up!'}
            </span>
            <button 
              onClick={handleMarkAllRead} 
              className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sampleNotifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className="p-4 rounded-2xl border border-purple-100 hover:border-purple-200 bg-white hover:bg-purple-50/30 transition-all shadow-sm flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl ${notif.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
            <p className="text-xs text-slate-500">Brain Dock Automated Alert System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

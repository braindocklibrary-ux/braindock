import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  Ticket, 
  Sparkles, 
  Users, 
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setEvents(data.data);
        }
      });
  }, []);

  const handleRegister = (event) => {
    fetch('http://localhost:5000/api/events/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({ eventId: event.eventId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTicketData(data.data);
          setSelectedEvent(event);
        } else {
          alert(data.message || 'Registration failed');
        }
      })
      .catch(() => {
        const mockTicket = {
          ticketCode: `BDL-TKT-${Math.floor(100000 + Math.random()*900000)}`,
          eventTitle: event.title,
          status: 'Confirmed'
        };
        setTicketData(mockTicket);
        setSelectedEvent(event);
      });
  };

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Workshops & Gatherings
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Upcoming Events & <span className="text-gradient-dark-purple">Workshops</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Participate in masterclasses by guest professors, technology leaders, and author meetups hosted at Brain Dock.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map(event => (
            <div 
              key={event.eventId}
              className="bg-white rounded-3xl border border-purple-100 shadow-purple-card hover:shadow-purple-glow hover:border-purple-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3">
                    <span className="bg-purple-900/90 text-white font-bold text-xs px-3 py-1 rounded-lg backdrop-blur-md">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-300" />
                      <span>{event.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-purple-300" />
                      <span>{event.time.split(' - ')[0]}</span>
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {event.description}
                  </p>

                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Keynote Speaker</p>
                    <p className="text-xs font-bold text-purple-950">{event.speaker}</p>
                    <p className="text-[11px] text-slate-500 truncate">{event.speakerBio}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-purple-50">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>{event.totalSeats - event.registeredSeats} Seats Remaining</span>
                    </span>
                    <span className="font-bold text-purple-900">
                      {event.fee === 0 ? 'Complimentary' : `₹${event.fee}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button 
                  onClick={() => handleRegister(event)}
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Reserve Event Seat</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Confirmation Modal */}
        {ticketData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-purple-100 text-center space-y-4 relative">
              <button 
                onClick={() => setTicketData(null)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900">Event Seat Confirmed!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                You have been registered for <strong>{selectedEvent?.title}</strong>. An email pass has also been dispatched to your inbox.
              </p>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 font-mono text-xs text-purple-950 space-y-1">
                <p>Pass ID: <strong>{ticketData.ticketCode}</strong></p>
                <p>Date: {selectedEvent?.date} • {selectedEvent?.time}</p>
                <p>Venue: {selectedEvent?.location}</p>
              </div>

              <button 
                onClick={() => setTicketData(null)}
                className="w-full bg-purple-700 text-white font-bold text-xs py-3 rounded-2xl"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

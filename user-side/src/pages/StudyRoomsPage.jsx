import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  VolumeX, 
  Monitor, 
  Wifi, 
  Tv, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudyRoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 12:00 PM');
  const [purpose, setPurpose] = useState('Doctoral Research & Focused Writing');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setRooms(data.data);
          if (data.bookings) {
            setUserBookings(data.bookings);
          }
        }
      });
  }, []);

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:30 PM - 02:30 PM',
    '03:00 PM - 05:00 PM',
    '05:30 PM - 07:30 PM',
    '08:00 PM - 10:00 PM'
  ];

  const handleBookRoom = (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    fetch('http://localhost:5000/api/rooms/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({
        roomId: selectedRoom.roomId,
        date: selectedDate,
        timeSlot: selectedSlot,
        purpose
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBookingSuccess(data.data);
          setUserBookings(prev => [data.data, ...prev]);
        }
      })
      .catch(() => {
        // Fallback local booking
        const mockBooking = {
          bookingId: `RMB-${Math.floor(100000 + Math.random()*900000)}`,
          roomName: selectedRoom.name,
          date: selectedDate,
          timeSlot: selectedSlot,
          status: 'Confirmed'
        };
        setBookingSuccess(mockBooking);
        setUserBookings(prev => [mockBooking, ...prev]);
      });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="bg-white text-slate-800 p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              Acoustic Pods & Studios
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Soundproof Study Rooms</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Book calibrated 45dB acoustic isolation pods for uninterrupted deep study, thesis writing, remote defenses, or collaborative brainstorming sessions.
            </p>
          </div>
        </div>

        {/* Available Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map(room => (
            <div 
              key={room.roomId} 
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Room Photo */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-900/90 backdrop-blur-md text-white font-mono text-xs font-bold px-3 py-1 rounded-lg border border-purple-400/30">
                      {room.roomId}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
                      Available
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">{room.type}</span>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-purple-50">
                    <span className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span>Capacity: <strong className="text-slate-800 font-bold">{room.capacity} Persons</strong></span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span>{room.floor}</span>
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-purple-900 font-bold uppercase tracking-wider">Features & Equipment</p>
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.map(am => (
                        <span key={am} className="text-xs bg-purple-50 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-100 flex items-center space-x-1">
                          <Check className="w-3 h-3 text-purple-600" />
                          <span>{am}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 pt-0">
                <button 
                  onClick={() => { setSelectedRoom(room); setBookingSuccess(null); }}
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2"
                >
                  <span>Select & Book Time Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal / Dialog */}
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 relative space-y-6">
              
              <button 
                onClick={() => setSelectedRoom(null)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {bookingSuccess ? (
                /* Success View */
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Study Room Reserved!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Your reservation for <strong>{bookingSuccess.roomName}</strong> is confirmed. Tap your Smart RFID card or mobile QR pass at the room door scanner.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 font-mono text-xs space-y-1 text-purple-950">
                    <p>Booking ID: <strong>{bookingSuccess.bookingId}</strong></p>
                    <p>Date: {bookingSuccess.date}</p>
                    <p>Time: {bookingSuccess.timeSlot}</p>
                  </div>

                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="w-full bg-purple-700 text-white py-3 rounded-2xl font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleBookRoom} className="space-y-4">
                  <div>
                    <span className="text-xs text-purple-700 font-bold uppercase">{selectedRoom.roomId}</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedRoom.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Capacity: {selectedRoom.capacity} People • {selectedRoom.floor}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Date</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Available Time Slots</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            selectedSlot === slot 
                              ? 'bg-purple-700 text-white border-purple-700 shadow-sm' 
                              : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Study Purpose / Notes</label>
                    <input 
                      type="text" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Competitive exam preparation"
                      className="w-full p-3 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                    />
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-200">
                    Complimentary quota applied (Included in your Scholar/Executive membership).
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-purple-glow transition-all"
                  >
                    Confirm Study Room Booking
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

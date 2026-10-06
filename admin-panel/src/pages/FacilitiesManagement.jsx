import React, { useState, useEffect } from 'react';
import { VolumeX, Grid, Lock, CheckCircle2, Clock, MapPin, Plus } from 'lucide-react';

export default function FacilitiesManagement() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);
  const [lockers, setLockers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/facilities/rooms').then(r => r.json()).then(d => d.success && setRooms(d.data));
    fetch('http://localhost:5000/api/facilities/seats').then(r => r.json()).then(d => d.success && setSeats(d.data));
    fetch('http://localhost:5000/api/facilities/lockers').then(r => r.json()).then(d => d.success && setLockers(d.data));
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Physical Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Facility & Space Allocation</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage study pods, silent reading seats, and smart RFID lockers.</p>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl text-xs font-semibold shadow-xs">
          <button 
            onClick={() => setActiveTab('rooms')} 
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'rooms' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Study Rooms ({rooms.length})
          </button>
          <button 
            onClick={() => setActiveTab('seats')} 
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'seats' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Silent Desks ({seats.length})
          </button>
          <button 
            onClick={() => setActiveTab('lockers')} 
            className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'lockers' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            RFID Lockers ({lockers.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Rooms */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.roomId} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-purple-700 font-bold">{room.roomId}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{room.name}</h3>
                  <p className="text-xs text-slate-500">{room.type} • {room.floor}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {room.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                {room.amenities.map(am => (
                  <span key={am} className="text-[11px] bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded font-medium border border-purple-200">
                    {am}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Seats */}
      {activeTab === 'seats' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Floor Desk Matrix</h3>
            <p className="text-xs text-slate-500">Live seat allocation across Silent Reading Commons</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {seats.map(seat => (
              <div 
                key={seat.seatNumber}
                className={`p-3.5 rounded-xl border text-center font-mono text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                  seat.status === 'Available' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' :
                  seat.status === 'Occupied' ? 'bg-rose-50/70 border-rose-200 text-rose-800' :
                  'bg-amber-50/70 border-amber-200 text-amber-800'
                }`}
              >
                <span>{seat.seatNumber}</span>
                <span className="text-[10px] font-sans font-medium">{seat.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Lockers */}
      {activeTab === 'lockers' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {lockers.map(lck => (
            <div key={lck.lockerNumber} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-purple-700">{lck.lockerNumber}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  lck.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                }`}>
                  {lck.status}
                </span>
              </div>
              <p className="text-xs text-slate-700">Size: <strong>{lck.size}</strong></p>
              <p className="text-xs text-slate-500">Assigned: {lck.assignedUserName || 'None (Open)'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

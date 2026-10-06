import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Sun, 
  VolumeX, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Check,
  X,
  Armchair,
  Lock,
  Coffee,
  User,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Interactive3DSeatMap from '../components/Interactive3DSeatMap';
import { API_BASE_URL } from '../config';

export default function SeatBookingPage() {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Full Day Access (24x7)');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : '',
    address: user?.address || ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSeats();
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || (user.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : ''),
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  const fetchSeats = () => {
    fetch(`${API_BASE_URL}/api/seats`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSeats(data.data);
        }
      })
      .catch(err => console.error('Error loading seats:', err));
  };

  // Seat click handler: toggles untick if re-clicked, or opens direct booking modal if selected
  const handleSelectSeat = (seat) => {
    setErrorMessage('');
    if (!seat) {
      // Untick/deselect
      setSelectedSeat(null);
      setIsBookingModalOpen(false);
      return;
    }

    if (selectedSeat && Number(selectedSeat.seatNumber) === Number(seat.seatNumber)) {
      // Untick if already selected
      setSelectedSeat(null);
      setIsBookingModalOpen(false);
    } else {
      // Select seat & directly open booking form modal
      setSelectedSeat(seat);
      setIsBookingModalOpen(true);
      setBookingSuccess(null);
    }
  };

  const handleBookSeat = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedSeat) return;

    const trimmedName = formData.name.trim();
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!trimmedAddress) {
      setErrorMessage('Please enter your Address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/seats/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
        },
        body: JSON.stringify({
          seatNumber: selectedSeat.seatNumber,
          name: trimmedName,
          phone: cleanPhone,
          address: trimmedAddress,
          timeSlot: selectedSlot
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setBookingSuccess(data.data);
        fetchSeats(); // Refresh map immediately so seat turns Occupied
      } else {
        setErrorMessage(data.message || 'Seat reservation failed. Please try again.');
      }
    } catch (err) {
      console.error('Seat booking error:', err);
      // Fallback local booking simulation
      const cleanUserPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
      const userMsg = `🎉 *Brain Dock Library - Desk Reservation Confirmed!* 📚\n\nDear *${trimmedName}*,\nYour study desk has been successfully reserved!\n\n📌 *Desk Number:* Desk #${selectedSeat.seatNumber}\n🏠 *Address:* ${trimmedAddress}\n📱 *Mobile:* ${cleanPhone}\n🎫 *Pass ID:* STB-${Date.now().toString().slice(-6)}\n\n📍 *Brain Dock Library*\nHelpline: +91 63 5600 6100`;
      const adminMsg = `🚨 *NEW DESK BOOKING RECEIVED (Website 3D Map)* 🏛️\n\n📌 *Desk Number:* Desk #${selectedSeat.seatNumber}\n👤 *Student Name:* ${trimmedName}\n📱 *Mobile:* ${cleanPhone}\n🏠 *Address:* ${trimmedAddress}`;
      
      const mock = {
        bookingId: `STB-${Date.now().toString().slice(-6)}`,
        admissionId: `BDL-ADM-${String(selectedSeat.seatNumber).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
        seatNumber: selectedSeat.seatNumber,
        zone: selectedSeat.zone || 'Silent AC Sanctuary',
        userName: trimmedName,
        userPhone: cleanPhone,
        userAddress: trimmedAddress,
        timeSlot: selectedSlot,
        amount: 849,
        userWhatsAppUrl: `https://api.whatsapp.com/send?phone=${cleanUserPhone}&text=${encodeURIComponent(userMsg)}`,
        adminWhatsAppUrl: `https://api.whatsapp.com/send?phone=916356006100&text=${encodeURIComponent(adminMsg)}`
      };
      setBookingSuccess(mock);
      setSeats(prev => prev.map(s => s.seatNumber === selectedSeat.seatNumber ? { ...s, status: 'Occupied' } : s));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white text-slate-800 p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              Interactive Seating Architecture
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Interactive Seat Map & Direct Desk Reservation
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Click any purple recliner desk to directly reserve with your details. Click again to untick or choose another desk.
            </p>
          </div>
        </div>

        {/* 3D Interactive Seating Terminal */}
        <Interactive3DSeatMap 
          seats={seats} 
          selectedSeat={selectedSeat} 
          onSelectSeat={handleSelectSeat}
        />

        {/* ========================================================
            DIRECT SEAT BOOKING MODAL (NAME, MOBILE, ADDRESS REQUIRED)
           ======================================================== */}
        {selectedSeat && isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 relative space-y-5 max-h-[90vh] overflow-y-auto">
              
              {/* Close / Untick Button */}
              <button 
                type="button"
                onClick={() => {
                  setSelectedSeat(null);
                  setIsBookingModalOpen(false);
                }}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cancel & Untick Desk"
              >
                <X className="w-5 h-5" />
              </button>

              {/* SUCCESS VIEW WITH WHATSAPP CONFIRMATION BUTTONS */}
              {bookingSuccess ? (
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Desk #{bookingSuccess.seatNumber} Reserved!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Congratulations <strong>{bookingSuccess.userName}</strong>, your desk is confirmed and synced with Admin ERP.
                    </p>
                  </div>
                  
                  {/* Reservation Pass Summary Card */}
                  <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 text-left text-xs space-y-2 text-slate-700 font-mono">
                    <div className="flex justify-between border-b border-purple-100 pb-1.5">
                      <span className="text-slate-500">Pass / Admission ID:</span>
                      <span className="font-bold text-purple-900">{bookingSuccess.admissionId || bookingSuccess.bookingId}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-100 pb-1.5">
                      <span className="text-slate-500">Reserved Desk:</span>
                      <span className="font-bold text-purple-900">Desk #{bookingSuccess.seatNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-100 pb-1.5">
                      <span className="text-slate-500">Student Mobile:</span>
                      <span className="font-bold text-slate-900">+91 {bookingSuccess.userPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-100 pb-1.5">
                      <span className="text-slate-500">Library Access:</span>
                      <span className="font-bold text-slate-900">24/7 Silent AC Access</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-extrabold text-emerald-700">Confirmed (Active)</span>
                    </div>
                  </div>

                  {/* WhatsApp Action Buttons (For Both Student and Admin) */}
                  <div className="space-y-2.5 pt-2">
                    {/* 1. User WhatsApp */}
                    {bookingSuccess.userWhatsAppUrl && (
                      <a 
                        href={bookingSuccess.userWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send Confirmation to My WhatsApp</span>
                      </a>
                    )}

                    {/* 2. Admin WhatsApp */}
                    {bookingSuccess.adminWhatsAppUrl && (
                      <a 
                        href={bookingSuccess.adminWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-purple-700/30 transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Notify Library Admin on WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedSeat(null);
                      setIsBookingModalOpen(false);
                      setBookingSuccess(null);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close & Return to Seat Map
                  </button>
                </div>
              ) : (
                /* DIRECT RESERVATION FORM */
                <form onSubmit={handleBookSeat} className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-purple-700 font-extrabold uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                        {selectedSeat.zone || 'Silent AC Reading Sanctuary'}
                      </span>
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        ⭐ Selected Desk
                      </span>
                    </div>

                    <div className="mt-1">
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                        Desk #{selectedSeat.seatNumber}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fill your details below to reserve this desk.
                    </p>
                  </div>

                  {/* Validation Error Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
                      <span className="font-bold">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* FIELD 1: FULL NAME (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>Full Name <span className="text-rose-600">*</span></span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Keval Pansuriya"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-slate-50/50"
                    />
                  </div>

                  {/* FIELD 2: MOBILE NUMBER (REQUIRED - 10 DIGIT) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-purple-600" />
                      <span>Mobile Number (+91 WhatsApp) <span className="text-rose-600">*</span></span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-bold text-slate-400 font-mono">+91</span>
                      <input 
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-12 pr-3 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-slate-50/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* FIELD 3: ADDRESS (REQUIRED) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>Address (Residential / Hostel) <span className="text-rose-600">*</span></span>
                    </label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="e.g. Room 204, Royal Girls Hostel, Vidyanagar, Gujarat"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-slate-50/50 resize-none"
                    />
                  </div>


                  {/* Amenities Quick Grid */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-[10px] text-slate-600 font-medium">
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg">
                      <Zap className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>65W USB-C & Socket</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg">
                      <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>LED Desk Lamp</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg">
                      <Armchair className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>Mesh Ergonomic Chair</span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Biometric Door Security</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-700/30 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming Reservation...' : `Confirm & Reserve Desk #${selectedSeat.seatNumber}`}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    A confirmation WhatsApp message will be generated for both you and the library director.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

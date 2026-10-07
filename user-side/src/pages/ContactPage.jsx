import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Membership Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject, message })
    })
      .then(res => res.json())
      .then(data => {
        setSubmitted(true);
      })
      .catch(() => {
        setSubmitted(true);
      });
  };

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Concierge & Location
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Connect with <span className="text-gradient-dark-purple">Brain Dock</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions regarding membership admissions, research suite bookings, or institutional tie-ups? Our concierge desk is here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Direct Inquiries</h3>
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Physical Campus</h4>
                    <p className="text-xs text-slate-500 mt-0.5">2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Telephone Concierge</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <a href="tel:+916356006100" className="hover:text-purple-700 transition-colors font-medium">+91 63 5600 6100</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Desk</h4>
                    <p className="text-xs text-slate-500 mt-0.5">concierge@braindocklibrary.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Operational Hours</h4>
                    <p className="text-xs text-purple-800 font-semibold mt-0.5">24 Hours / 7 Days for Scholars & Executives</p>
                    <p className="text-[11px] text-slate-400">Desk Staff: Mon - Sun 08:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Concierge Button */}
              <div className="pt-2">
                <a 
                  href="https://wa.me/916356006100?text=Hello%20Brain%20Dock%20Library"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with WhatsApp Concierge</span>
                </a>
              </div>
            </div>

            {/* Simulated Campus Directions Map */}
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-purple-card space-y-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Interactive Location</h4>
                <span className="text-[11px] text-purple-700 font-semibold">Get Directions</span>
              </div>
              
              <div className="h-44 rounded-2xl bg-purple-950 text-purple-200 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <MapPin className="w-8 h-8 text-purple-400 mb-2 animate-bounce" />
                <p className="font-bold text-sm text-white">Brain Dock Central Sanctuary</p>
                <p className="text-[11px] text-purple-300 mt-1">2 mins from Metro Station • Ample Underground Parking</p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-10 shadow-purple-card">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Message Received!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you, <strong>{name}</strong>. Our library concierge team will review your inquiry and reply via email or phone within 2 hours.
                  </p>
                  <button 
                    onClick={() => { setSubmitted(false); setMessage(''); }}
                    className="bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">Send an Inquiry</h3>
                    <p className="text-xs text-slate-500 mt-1">Fill out the form below and our academic concierge will connect with you.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Mehta"
                        className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@university.edu"
                        className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Topic</label>
                      <select 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                      >
                        <option value="Membership Inquiry">Membership Inquiry</option>
                        <option value="Study Pod Booking">Study Pod Booking</option>
                        <option value="Book Reservation / OPAC">Book Reservation / OPAC</option>
                        <option value="Corporate / Institution Tie-up">Corporate / Institution Tie-up</option>
                        <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Question</label>
                    <textarea 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      rows="4"
                      placeholder="Tell us what you are looking for..."
                      className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-purple-glow transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Dispatch Message to Concierge</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { 
  VolumeX, 
  Wifi, 
  Wind, 
  Zap, 
  ShieldCheck, 
  Coffee, 
  Car, 
  Lock, 
  Layers, 
  BookOpen, 
  Users, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacilitiesPage() {
  const facilities = [
    {
      icon: VolumeX,
      title: 'Silent Study Sanctuary',
      desc: 'Double-glazed acoustic panels, soundproof carpets, and zero-decibel discipline for pure concentration below 40dB.',
      highlight: 'Acoustic Soundproofing'
    },
    {
      icon: Wifi,
      title: 'Wi-Fi 7 Gigabit Mesh',
      desc: 'Dual-band symmetrical 1000 Mbps internet connection with individual desk Ethernet ports and low ping.',
      highlight: '1 Gbps Ultra Low Latency'
    },
    {
      icon: Wind,
      title: 'Hospital-Grade HEPA Climate Control',
      desc: 'Centralized HVAC with continuous carbon filtration and active air purification to prevent mental fatigue.',
      highlight: 'Clean O2 Circulation'
    },
    {
      icon: Zap,
      title: 'Universal Fast-Charging Desks',
      desc: 'Every desk features 65W USB-C PD, universal international AC sockets, and surge-protected circuits.',
      highlight: 'Fast PD Charging'
    },
    {
      icon: Layers,
      title: 'Ergonomic Steelcase Seating',
      desc: 'Medical-grade lumbar mesh chairs with adjustable armrests and seat depth engineered for 12+ hour study sessions.',
      highlight: 'Spine & Posture Care'
    },
    {
      icon: Users,
      title: 'Soundproof Discussion Pods',
      desc: 'Private rooms for collaborative group projects, interactive touchscreens, and whiteboard walls.',
      highlight: 'Zero Sound Leakage'
    },
    {
      icon: Lock,
      title: 'Smart RFID Lockers',
      desc: 'Heavy-gauge steel lockers with biometric and digital passcode locks to safely store laptops and heavy volumes.',
      highlight: 'Personal Storage Bay'
    },
    {
      icon: ShieldCheck,
      title: '24/7 CCTV & Biometric Turnstiles',
      desc: 'AI-monitored campus with 64 HD night-vision cameras and authorized RFID turnstile entry.',
      highlight: 'Total Safety'
    },
    {
      icon: Coffee,
      title: 'Purity Water & Coffee Lounge',
      desc: 'Alkaline RO drinking water dispensers, artisan roast espresso station, and quiet break terrace.',
      highlight: 'Refreshment Hub'
    },
    {
      icon: Car,
      title: 'Secure Dedicated Parking',
      desc: 'Safe on-campus basement parking for two-wheelers and four-wheelers with EV charging points.',
      highlight: 'EV Charging Available'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Campus Ecosystem
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            World-Class <span className="text-gradient-dark-purple">Library Facilities</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every square inch of Brain Dock is meticulously crafted for intellectual performance, ergonomic comfort, and absolute peace of mind.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-white border border-purple-100 shadow-purple-card hover:shadow-purple-glow hover:border-purple-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {fac.highlight}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{fac.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{fac.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-50 flex items-center text-xs font-semibold text-purple-700">
                  <span>Available on all floors</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-slate-800 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-slate-900">Experience the Sanctuary in Person</h3>
            <p className="text-xs text-slate-500">Schedule a 15-minute campus walkthrough and preview our soundproof pods.</p>
          </div>
          <Link 
            to="/contact" 
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-xs shrink-0"
          >
            Book Walkthrough
          </Link>
        </div>

      </div>
    </div>
  );
}

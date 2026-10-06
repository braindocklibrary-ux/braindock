import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Target, 
  Compass, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  Clock, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            About Our Sanctuary
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            The Philosophy of <span className="text-gradient-dark-purple">Brain Dock</span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Brain Dock Library was conceived with a single guiding mission: to remove friction from deep intellectual work. We engineered an environment where human curiosity meets technological speed.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-purple-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To be the gold standard in modern libraries — bridging the timeless wisdom of physical volumes with autonomous checkout docks, algorithmic research indexing, and acoustic architectural mastery.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-purple-100 shadow-purple-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              To empower students, researchers, competitive exam candidates, and lifelong learners with frictionless 24/7 facilities, soundproof study pods, and a community dedicated to intellectual excellence.
            </p>
          </div>
        </div>

        {/* Historical Milestones Timeline */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-purple-card space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900">Evolution of Brain Dock</h3>
            <p className="text-xs text-slate-500 mt-1">From a quiet university idea to an award-winning digital research dock.</p>
          </div>

          <div className="space-y-6 max-w-3xl mx-auto border-l-2 border-purple-200 pl-6 ml-4 sm:ml-auto">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-700 border-4 border-white shadow"></span>
              <span className="text-xs font-bold text-purple-700">2023 • Foundation</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">Brain Dock Architectural Inception</h4>
              <p className="text-xs text-slate-600 mt-1">Opening the first acoustic silent reading wing with 100 dedicated desks and 10,000 curated books.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-700 border-4 border-white shadow"></span>
              <span className="text-xs font-bold text-purple-700">2024 • Innovation</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">Automated RFID & Turnstile Gates</h4>
              <p className="text-xs text-slate-600 mt-1">Integration of contactless smart passes and self-checkout stations with sub-second processing.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-700 border-4 border-white shadow"></span>
              <span className="text-xs font-bold text-purple-700">2026 • Global Standard</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">24/7 Intelligent Terminal & Soundproof Pods</h4>
              <p className="text-xs text-slate-600 mt-1">Deployment of Turing Neural Pods, Wi-Fi 7 gigabit mesh, and digital repository indexing over 18,000 papers.</p>
            </div>
          </div>
        </div>

        {/* Founding Leadership */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Leadership & Advisory Board</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm text-center space-y-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Dr. Keval Patel" className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-purple-200" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Dr. Keval Patel</h4>
                <p className="text-xs text-purple-700 font-semibold">Founding Director & AI Scientist</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm text-center space-y-3">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200" alt="Ananya Sharma" className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-purple-200" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Ananya Sharma</h4>
                <p className="text-xs text-purple-700 font-semibold">Head of Research Curation</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-sm text-center space-y-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" alt="Vikramaditya Rawal" className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-purple-200" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Vikramaditya Rawal</h4>
                <p className="text-xs text-purple-700 font-semibold">Chief Academic Architect</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

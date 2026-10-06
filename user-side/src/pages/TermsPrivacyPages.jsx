import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-purple-card space-y-6">
        <Link to="/" className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: September 2026 • Brain Dock Library Operations</p>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-purple-950">1. Information We Collect</h3>
          <p>We collect essential membership data including your name, contact email, telephone number, academic affiliation, and circulation records for book checkouts, soundproof pod reservations, and turnstile entry logs.</p>

          <h3 className="text-base font-bold text-purple-950">2. Usage of Digital Smart Passes & CCTV</h3>
          <p>For the safety and quietude of our members, campus turnstiles record entry and exit timestamps. High-definition security cameras operate in public study halls and perimeter entrances to safeguard personal items and book assets.</p>

          <h3 className="text-base font-bold text-purple-950">3. Data Security</h3>
          <p>All transactions, payment metadata, and RFID identifiers are encrypted via 256-bit SSL protocols. We never sell or license member reading history or personal contact records to third-party advertisers.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FD] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-purple-card space-y-6">
        <Link to="/" className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last Revised: September 2026 • Brain Dock Library Community Code</p>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-purple-950">1. Membership & Access Rights</h3>
          <p>Access to Brain Dock Library facilities, study suites, and physical holdings is contingent upon maintaining an active membership plan and adhering strictly to the Noise & Acoustic Discipline Policy.</p>

          <h3 className="text-base font-bold text-purple-950">2. Book Circulation & Replacement</h3>
          <p>Borrowed materials must be returned or renewed by the due date. Any volume damaged or lost while checked out to a member will incur an equitable replacement fee equivalent to the retail publisher value plus cataloging overhead.</p>

          <h3 className="text-base font-bold text-purple-950">3. Workspace Etiquette</h3>
          <p>Desks in Silent Reading Zones must not be left unattended for longer than 45 minutes during peak hours. Brain Dock staff reserves the right to reallocate unoccupied reserved desks.</p>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-6">
      <img src="/logo.png" alt="Brain Dock" className="h-14 w-auto object-contain" />
      <span className="text-6xl font-extrabold text-purple-700">404</span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Catalogue Node Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md">
        The shelf coordinate or digital page you are looking for does not exist in the Brain Dock repository.
      </p>
      <Link to="/" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-xs transition-all">
        Return to Home Sanctuary
      </Link>
    </div>
  );
}

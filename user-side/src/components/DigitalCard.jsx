import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ShieldCheck, Sparkles, Wifi, CheckCircle2, Copy } from 'lucide-react';

export default function DigitalCard({ user, onPrint }) {
  const cardRef = useRef(null);

  const qrData = JSON.stringify({
    memberId: user?.memberId || 'BDL-MEM-8842',
    name: user?.name || 'Aarav Mehta',
    plan: user?.membershipPlan || 'Premium Scholar',
    validUntil: user?.membershipValidUntil || '2027-09-30',
    verificationUrl: `https://braindocklibrary.com/verify/${user?.memberId || 'BDL-MEM-8842'}`
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Digital Card pass downloaded! You can save this barcode image or add to mobile wallet.");
  };

  return (
    <div className="flex flex-col items-center">
      {/* The Digital Membership Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-md rounded-3xl p-6 relative overflow-hidden text-white shadow-xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2E1065 100%)',
          border: '1.5px solid rgba(192, 132, 252, 0.25)'
        }}
      >
        {/* Holographic Watermark Pattern */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header with Official Brand Logo */}
        <div className="flex items-center justify-between border-b border-purple-400/20 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Brain Dock Library" 
              className="h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
            />
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
              {user?.membershipStatus || 'ACTIVE'}
            </span>
            <p className="text-[10px] text-purple-200/70 uppercase tracking-widest mt-1">Smart RFID Enabled</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Member Photo */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="relative">
              <img 
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} 
                alt={user?.name} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-300/80 shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 bg-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white border border-purple-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-purple-200/80 text-center mt-2 font-mono">{user?.memberId || 'BDL-MEM-8842'}</p>
          </div>

          {/* Member Details */}
          <div className="col-span-2 space-y-2">
            <div>
              <p className="text-[11px] text-purple-300/80 uppercase font-medium">Member Name</p>
              <h3 className="text-lg font-bold text-white tracking-wide truncate">{user?.name || 'Aarav Mehta'}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-purple-300/80 uppercase">Plan Tier</p>
                <p className="font-semibold text-purple-100">{user?.membershipPlan || 'Premium Scholar'}</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-300/80 uppercase">Valid Thru</p>
                <p className="font-semibold text-purple-100">
                  {user?.membershipValidUntil 
                    ? new Date(user.membershipValidUntil).toLocaleDateString() 
                    : '30 Sep 2027'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-purple-200/70 pt-1">
              <Wifi className="w-3 h-3 text-purple-400 rotate-90" />
              <span>Contactless Turnstile Access</span>
            </div>
          </div>
        </div>

        {/* QR Code & Barcode Section */}
        <div className="mt-5 pt-4 border-t border-purple-400/20 flex items-center justify-between bg-purple-950/40 rounded-xl p-3">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg">
              <QRCodeSVG 
                value={qrData}
                size={56}
                level="M"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wider">TAP OR SCAN AT DOCK</p>
              <p className="text-[10px] text-purple-300/70">Terminal Verification ID</p>
              <p className="font-mono text-[11px] text-purple-200 tracking-widest mt-0.5">
                •||| |•|| |||• || •|•
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-purple-300/60 block">Authorized by</span>
            <span className="text-[11px] font-semibold text-purple-200">Brain Dock Systems</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 mt-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 hover:text-white px-4 py-2 rounded-xl text-xs font-medium border border-purple-500/30 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4 text-purple-400" />
          <span>Print Pass</span>
        </button>

        <button 
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Save Digital Pass</span>
        </button>
      </div>
    </div>
  );
}

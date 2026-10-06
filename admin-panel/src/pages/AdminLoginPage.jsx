import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  KeyRound,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, authLoading, authError, setAuthError } = useAdminAuth();

  const [email, setEmail] = useState('admin@braindock.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password) {
      setAuthError('Please enter both Super Admin email and master password.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/owner-portal');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@braindock.com');
    setPassword('admin123');
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-purple-950 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Card */}
        <div className="text-center space-y-3">
          <div className="inline-block p-3.5 rounded-2xl bg-white shadow-2xl shadow-purple-950/50 mb-1">
            <img 
              src="/logo.png" 
              alt="Brain Dock Library" 
              className="h-10 sm:h-12 mx-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wide">RESTRICTED ACCESS • SUPER ADMIN ONLY</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Director & Admin Gateway
          </h1>
          <p className="text-xs text-purple-200/70 max-w-sm mx-auto">
            Authorized management console for 102 seats, fee collections, books catalog, and library operations.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 text-slate-900 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-950/50 border border-white/20 space-y-5">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@braindock.com"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white text-slate-950 font-bold text-sm shadow-xs placeholder:text-slate-400 opacity-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Master Password
                </label>
                <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                  256-Bit Encrypted
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white text-slate-950 font-bold text-sm shadow-xs placeholder:text-slate-400 opacity-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-900/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{authLoading ? 'Verifying Super Admin Privileges...' : 'Unlock Super Admin Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Director Master Account:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center space-x-1 text-purple-700 hover:text-purple-900 font-bold text-[11px] underline cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>Fill Credentials (`admin123`)</span>
            </button>
          </div>

        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-purple-200/80 flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Multi-role guest dropdowns have been removed. Access is strictly locked to Super Admin credentials.
          </span>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-300/80 hover:text-white inline-flex items-center space-x-1 transition-colors"
          >
            <span>Visit Public Student Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}

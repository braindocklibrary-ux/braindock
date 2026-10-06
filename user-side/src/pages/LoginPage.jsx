import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).then(() => navigate('/dashboard'));
  };

  return (
    <div className="min-h-screen bg-[#FAF9FD] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-block">
          <img 
            src="/logo.png" 
            alt="Brain Dock Library Official Logo" 
            className="h-12 w-auto mx-auto object-contain"
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Member Sign In
        </h2>
        <p className="text-xs text-slate-500">
          Access your digital smart pass, book renewals, and study pods.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200/90 p-8 rounded-3xl shadow-sm space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@braindock.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-purple-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            <span>Don't have an active account? </span>
            <Link to="/register" className="text-purple-700 font-bold hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

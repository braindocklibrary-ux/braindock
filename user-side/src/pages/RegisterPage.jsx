import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('First 50 Admissions Offer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register({
      name,
      email,
      phone,
      password,
      membershipPlan: plan
    });
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed');
    }
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
          Create Member Account
        </h2>
        <p className="text-xs text-slate-500">
          Instant QR smart pass generation and catalogue privileges.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200/90 p-8 rounded-3xl shadow-sm space-y-5">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Mehta"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Membership Plan Offer</label>
              <select 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              >
                <option value="First 50 Admissions Offer">First 50 Admissions Offer (₹849/month)</option>
                <option value="Standard Student Membership">Standard Student Membership (₹999/month - 51+ Seats)</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              {loading ? 'Creating Member Pass...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            <span>Already registered? </span>
            <Link to="/login" className="text-purple-700 font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

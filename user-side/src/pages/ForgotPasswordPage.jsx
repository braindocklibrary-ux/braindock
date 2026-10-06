import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, KeyRound, Lock, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 30s Countdown timer (Climate Hero style)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (resendTimer > 0 && step === 2) return;
    setError('');
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStep(2);
        setResendTimer(30);
        setError('');
      } else {
        setError(data.message || 'Email not found.');
      }
    } catch (err) {
      setLoading(false);
      setError('Unable to connect to server. Please verify backend status.');
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          newPassword
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMsg(data.message || 'Password reset successfully!');
      } else {
        setError(data.message || 'Failed to reset password. Please check your OTP code.');
      }
    } catch (err) {
      setLoading(false);
      setError('Server error during password reset.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link to="/" className="inline-block">
          <img src="/logo.png" alt="Brain Dock Logo" className="h-12 w-auto mx-auto object-contain" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Account Recovery</h2>
        <p className="text-xs text-slate-500">
          {step === 1 ? 'Enter your registered email to receive a 6-digit verification code.' : 'Enter the code sent to your email and set a new password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-5">
          {successMsg ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Changed!</h3>
              <p className="text-xs text-slate-600">{successMsg}</p>
              <Link to="/login" className="mt-4 inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-sm transition-all">
                Proceed to Login
              </Link>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
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

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Sending Code...' : 'Get 6-Digit OTP Code'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center space-x-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                <p className="text-xs text-purple-950 font-bold">Verification code dispatched to</p>
                <p className="text-xs font-mono font-bold text-purple-800 mt-0.5">{email}</p>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="text-[11px] text-purple-700 font-semibold underline mt-1"
                >
                  Change Email
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    maxLength="6"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-base font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Resend OTP */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Didn't receive email?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleRequestOtp}
                  className="font-bold text-purple-700 hover:text-purple-900 disabled:text-slate-400 disabled:no-underline underline transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Reset Password & Save'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center space-x-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

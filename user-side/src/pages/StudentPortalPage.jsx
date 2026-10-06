import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Printer, 
  LogOut, 
  Sparkles, 
  Fingerprint, 
  Lock, 
  Unlock, 
  UserCheck, 
  BookOpen, 
  CreditCard, 
  RotateCcw,
  Zap,
  Phone,
  FileText,
  X,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mail
} from 'lucide-react';
import DualA4ReceiptModal from '../components/DualA4ReceiptModal';
import { API_BASE_URL } from '../config';

export default function StudentPortalPage() {
  // Authentication State
  const [identifierInput, setIdentifierInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [manualSyncLoading, setManualSyncLoading] = useState(false);
  
  // Student Profile & Data (Persisted 24 Hours in LocalStorage)
  const [studentData, setStudentData] = useState(() => {
    try {
      const saved = localStorage.getItem('bdl_student_session');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const sessionData = parsed.data || (parsed.student ? parsed : null);
      if (!sessionData) return null;
      const savedAt = parsed.savedAt || Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (Date.now() - savedAt > TWENTY_FOUR_HOURS) {
        localStorage.removeItem('bdl_student_session');
        return null;
      }
      return sessionData;
    } catch (e) {
      return null;
    }
  });
  const [receiptModal, setReceiptModal] = useState(null);
  const [testPunchResult, setTestPunchResult] = useState(null);
  const [testPunchLoading, setTestPunchLoading] = useState(false);

  const studentDataRef = useRef(studentData);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    document.title = "Brain Dock Student Portal — Official Student Login & Biometric Attendance | Amreli";
  }, []);

  useEffect(() => {
    studentDataRef.current = studentData;
  }, [studentData]);

  // Robust live punch sync without React closure staleness
  const refreshStudentData = async (explicitData) => {
    if (isRefreshingRef.current) return;
    const active = explicitData || studentDataRef.current || studentData;
    let query = active?.student?.studentEmail || active?.student?.studentPhone || active?.student?.seatNumber || active?.student?.admissionId;
    
    if (!query) {
      try {
        const stored = JSON.parse(localStorage.getItem('bdl_student_session') || '{}');
        const s = stored.data?.student || stored.student;
        query = s?.studentEmail || s?.studentPhone || s?.seatNumber || s?.admissionId;
      } catch (e) {}
    }
    if (!query) return;

    isRefreshingRef.current = true;
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/summary/${encodeURIComponent(query)}?_t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (data?.success && data?.data) {
        setStudentData(data.data);
        studentDataRef.current = data.data;
        localStorage.setItem('bdl_student_session', JSON.stringify({ data: data.data, savedAt: Date.now() }));
      }
    } catch (e) {
    } finally {
      isRefreshingRef.current = false;
      setManualSyncLoading(false);
    }
  };

  const handleManualSync = () => {
    setManualSyncLoading(true);
    refreshStudentData();
  };

  // Continuous auto-sync every 1500ms to immediately detect TimeWatch Bio-1SE punches
  useEffect(() => {
    if (!studentData?.student) return;
    refreshStudentData(studentData);
    const interval = setInterval(() => {
      refreshStudentData();
    }, 1500);
    return () => clearInterval(interval);
  }, [studentData?.student?.seatNumber, studentData?.student?.studentEmail, studentData?.student?.admissionId]);

  // Resend OTP Countdown Timer (like Climate Hero)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Send OTP to Registered Email (via Nodemailer)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (resendTimer > 0 && otpSent) return;
    setAuthError('');
    setAuthNotice('');
    const target = identifierInput.trim();
    if (!target) {
      setAuthError('Please enter your registered email address.');
      return;
    }
    if (!target.includes('@') || !target.includes('.')) {
      setAuthError('Please enter a valid email address (e.g. pansuriyakeval434@gmail.com). Mobile number login is disabled.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target, identifier: target })
      });
      const data = await res.json();
      setAuthLoading(false);

      if (data.success) {
        setOtpSent(true);
        setMaskedEmail(data.maskedEmail || data.studentEmail || target);
        setAuthNotice(data.message || 'OTP sent successfully to your registered email.');
        setResendTimer(30);
      } else {
        setAuthError(data.message || 'Account not found. Please verify your registered email address.');
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError('Unable to connect to library server. Please check backend.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    if (!otpInput || otpInput.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP code.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifierInput.trim(), otp: otpInput.trim() })
      });
      const data = await res.json();
      setAuthLoading(false);

      if (data.success) {
        setStudentData(data.data);
        localStorage.setItem('bdl_student_session', JSON.stringify({ data: data.data, savedAt: Date.now() }));
      } else {
        setAuthError(data.message || 'Invalid or expired OTP code entered.');
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError('Server error while verifying OTP.');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('bdl_student_session');
    setStudentData(null);
    setOtpSent(false);
    setIdentifierInput('');
    setOtpInput('');
    setMaskedEmail('');
    setTestPunchResult(null);
  };

  // Interactive Live Punch Test on the physical TIMEWATCH Machine
  const handleSimulatePunch = async (method = 'Fingerprint') => {
    if (!studentData?.student) return;
    const cleanMethod = method === 'Face' ? 'Face Recognition' : method;
    setTestPunchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/biometric/punch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatNumber: studentData.student.seatNumber,
          grId: studentData.student.grId || studentData.student.admissionId,
          studentPhone: studentData.student.studentPhone,
          method: cleanMethod
        })
      });
      const data = await res.json();
      setTestPunchResult(data);
      setTestPunchLoading(false);

      // Refresh student summary immediately
      refreshStudentData();
    } catch (err) {
      setTestPunchLoading(false);
    }
  };



  // ==========================================
  // RENDER: LOGIN FORM (IF NOT LOGGED IN)
  // ==========================================
  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-slate-50 py-8 sm:py-12 px-3 sm:px-6 flex flex-col justify-center items-center">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-white border border-purple-100/80 rounded-3xl p-5 sm:p-8 shadow-xl shadow-purple-900/5 relative overflow-hidden">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800"></div>

          {/* Brand Logo & Header */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            <img 
              src="/logo.png" 
              alt="Brain Dock Library" 
              className="h-10 sm:h-14 mx-auto object-contain"
            />
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <Fingerprint className="w-3.5 h-3.5 text-purple-700" />
              <span>STUDENT DESK & BIOMETRIC PORTAL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Member Login
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Check your assigned desk #, biometric door status, daily reading hours & fee validity.
            </p>
          </div>

          {/* Step 1: Registered Email Address Input Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registered Student Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    placeholder="e.g. pansuriyakeval434@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white text-slate-950 font-bold text-sm tracking-wide shadow-xs placeholder:text-slate-400 placeholder:font-normal opacity-100"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your registered student email. We will send an instant 6-digit OTP code directly to your email inbox.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{authLoading ? 'Sending Email OTP...' : 'Send OTP to Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: Email OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-purple-900 font-bold text-xs">
                  <Mail className="w-4 h-4 text-purple-700" />
                  <span>OTP Sent to Registered Email</span>
                </div>
                {maskedEmail ? (
                  <p className="text-xs font-mono font-extrabold text-purple-800">
                    {maskedEmail}
                  </p>
                ) : (
                  <p className="text-xs font-mono font-semibold text-purple-800">
                    {identifierInput}
                  </p>
                )}
                <p className="text-[11px] text-purple-600">
                  Please check your inbox or spam folder. Valid for 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setAuthError(''); setAuthNotice(''); }}
                  className="text-[11px] text-purple-800 font-semibold underline mt-1 inline-block cursor-pointer hover:text-purple-950"
                >
                  Change Email Address
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength="6"
                  autoFocus
                  className="w-full px-4 py-3 text-center rounded-xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white text-slate-950 font-black text-2xl font-mono tracking-[0.5em] shadow-xs placeholder:text-slate-300 placeholder:font-normal opacity-100"
                  required
                />
              </div>

              {/* Resend Timer & Action */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500">Didn't receive code in email?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0 || authLoading}
                  onClick={handleSendOtp}
                  className="font-bold text-purple-700 hover:text-purple-900 disabled:text-slate-400 disabled:no-underline underline transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend email in ${resendTimer}s` : 'Resend Email OTP'}
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || otpInput.length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md shadow-purple-900/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{authLoading ? 'Verifying OTP...' : 'Login & View My Desk'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <a 
              href="http://localhost:5174/owner-portal"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-purple-700 font-medium transition-colors"
            >
              Library Owner / Director Portal →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGGED-IN STUDENT DASHBOARD
  // ==========================================
  const student = studentData?.student || {};
  const desk = studentData?.assignedDesk || {
    seatNumber: student?.seatNumber || 51,
    seatLabel: student?.seatLabel || `Seat #${student?.seatNumber || 51}`,
    zone: student?.zone || 'Ground Floor',
    floor: student?.floor || 'Ground Floor'
  };
  const bio = studentData?.biometricProfile || {
    grId: student?.grId || `GR-${String(student?.seatNumber || 51).padStart(3, '0')}`,
    doorAccessGranted: true,
    lockStatus: 'ACTIVE_UNLOCKED'
  };
  const stats = studentData?.attendanceStats || {
    todayTotalTime: '0h 0m',
    monthlyHours: '0 Hours',
    statusToday: 'Active'
  };
  const isExpired = student?.status === 'Expired' || (student?.daysRemaining != null && student?.daysRemaining < 0);
  const hasPendingFee = (student?.pendingFee || 0) > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      
      {/* Top Banner / Student Greeting Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
            {student.studentPhoto ? (
              <img 
                src={student.studentPhoto} 
                alt={student.studentName} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-purple-300 shadow-xs shrink-0" 
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-extrabold text-xs sm:text-sm font-mono shrink-0">
                #{String(desk.seatNumber || 51).padStart(2, '0')}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">{student.studentName || 'Student Member'}</h1>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 shrink-0">
                  {bio.grId}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  Seat #{desk.seatNumber || 51}
                </span>
                {student.lockerNumber && (
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    Locker: {student.lockerNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                {student.targetExam || student.course || 'Member'} • {student.shift || 'Full Day'}
                {student.parentsName && <span> • C/O {student.parentsName}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={manualSyncLoading}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] sm:text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Instantly fetch latest punches from TimeWatch Bio-1SE machine"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-emerald-600 ${manualSyncLoading ? 'animate-spin' : ''}`} />
              <span className="hidden min-[400px]:inline">{manualSyncLoading ? 'Syncing...' : 'Live Machine Sync'}</span>
              <span className="inline min-[400px]:hidden">{manualSyncLoading ? '...' : 'Sync'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] sm:text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ================= SECTION 1: 4 CORE KPI METRIC CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Assigned Desk */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assigned Seat / Desk
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h2 className="text-3xl font-extrabold text-slate-900 font-mono">
                    Seat #{desk.seatNumber}
                  </h2>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
              <p className="text-xs font-bold text-slate-800">{desk.zone}</p>
              <p className="text-[11px] text-slate-500 font-medium">{desk.floor}</p>
            </div>
          </div>

          {/* Card 2: TIMEWATCH Biometric Door Lock Access */}
          <div className={`rounded-3xl p-6 shadow-xs border flex flex-col justify-between transition-all ${
            isExpired 
              ? 'bg-rose-50/70 border-rose-300 text-rose-950' 
              : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                  Biometric Smart Door Lock
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  {isExpired ? (
                    <Lock className="w-6 h-6 text-rose-600 shrink-0" />
                  ) : (
                    <Unlock className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {isExpired ? 'LOCK DISABLED' : 'ACCESS ACTIVE'}
                  </h3>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isExpired ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <Fingerprint className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 text-xs">
              {isExpired ? (
                <p className="text-rose-800 font-semibold leading-relaxed">
                  ⛔ Door will NOT open. Membership expired on {student.endDate}. Please renew at desk.
                </p>
              ) : (
                <p className="text-emerald-800 font-medium leading-relaxed">
                  🟢 Armed on TIMEWATCH Lock. Door unlocks automatically via Fingerprint & Face.
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Membership Validity Period */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Membership Validity
                </span>
                <div className="mt-1">
                  <span className={`text-xl font-extrabold font-mono ${
                    student.daysRemaining <= 5 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {student.daysRemaining >= 0 ? `${student.daysRemaining} Days Left` : `Expired ${Math.abs(student.daysRemaining)}d Ago`}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Start: {student.startDate}</span>
                <span className="font-bold text-slate-800">End: {student.endDate}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isExpired ? 'bg-rose-500' : student.daysRemaining <= 5 ? 'bg-amber-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min(100, Math.max(5, (student.daysRemaining / 30) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 4: Daily Reading Time */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Today's Reading Time
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-3xl font-extrabold text-purple-900 font-mono">
                    {stats.todayTotalTime}
                  </h3>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Monthly Total:</span>
              <span className="font-bold text-purple-800 font-mono">{stats.monthlyHours}</span>
            </div>
          </div>

        </div>

        {/* ================= SECTION 2: PHYSICAL HARDWARE TERMINAL & BIOMETRIC GATE STATUS ================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-lg font-bold text-slate-900">
                  TIMEWATCH Bio-1SE Entrance Gate & Attendance Controller
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LIVE HARDWARE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your biometric credentials ({bio.grId} • Desk #{desk.seatNumber}) are active. Touch sensor on physical machine to open door.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Machine SN: 140000103DFFFFFF (Online)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Visual Hardware Preview from user uploaded photo */}
            <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-800 space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-48 flex items-center justify-center bg-slate-900">
                <img 
                  src="/timewatch-device.jpg" 
                  alt="TIMEWATCH Biometric Door Controller" 
                  className="w-full h-auto object-cover opacity-90"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  TIMEWATCH
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Physical Door Lock Terminal • Silent Hall Entrance
              </div>
            </div>

            {/* Simulated LCD Screen & Punch Action */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* LCD Screen Display */}
              <div className={`p-5 rounded-2xl font-mono text-xs border transition-all ${
                testPunchResult 
                  ? testPunchResult.granted 
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                    : 'bg-rose-950 border-rose-700 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-purple-200'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-[10px] text-slate-400">
                  <span>TIMEWATCH BIO-TERMINAL LCD</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                
                {testPunchLoading ? (
                  <div className="py-4 text-center text-amber-300 animate-pulse">
                    Scanning biometric pattern... Contacting Brain Dock Access Controller...
                  </div>
                ) : testPunchResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-bold">
                      {testPunchResult.granted ? (
                        <span className="text-emerald-400">🟢 {testPunchResult.message}</span>
                      ) : (
                        <span className="text-rose-400">⛔ {testPunchResult.message}</span>
                      )}
                    </div>
                    <div className="text-[11px] opacity-80 pt-1">
                      Student: {student.studentName} | Desk: #{desk.seatNumber} | GR: {bio.grId} | Door: {testPunchResult.doorStatus}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <p className="text-purple-300">Ready for punch: Place finger or look at camera</p>
                    <p className="text-slate-400 text-[11px]">Enrolled ID: {bio.grId} | Member: {student.studentName}</p>
                  </div>
                )}
              </div>

              {/* Punch Simulation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  onClick={() => handleSimulatePunch('Fingerprint')}
                  disabled={testPunchLoading}
                  className="w-full py-3 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4 shrink-0" />
                  <span>Test Fingerprint</span>
                </button>

                <button
                  onClick={() => handleSimulatePunch('Face')}
                  disabled={testPunchLoading}
                  className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Test Face Recognition</span>
                </button>

                <button
                  onClick={() => handleSimulatePunch('RFID Card')}
                  disabled={testPunchLoading}
                  className="w-full py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Tap RFID Card</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ================= SECTION 3: DAILY STUDY ATTENDANCE LOGS ================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Daily Study Hours & Attendance History
                </h2>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE HARDWARE SYNC (1.5s)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact Punch IN, Punch OUT, and daily reading durations recorded by TIMEWATCH Bio-1SE lock.
              </p>
            </div>
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleManualSync}
                disabled={manualSyncLoading}
                className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${manualSyncLoading ? 'animate-spin' : ''}`} />
                <span>{manualSyncLoading ? 'Refreshing...' : 'Refresh Logs'}</span>
              </button>
              <div className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                Punches: {studentData?.recentLogs?.length || 0}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Desk #</th>
                  <th className="py-3 px-4">Punch Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Door Lock Action</th>
                  <th className="py-3 px-4">Study Session Time</th>
                  <th className="py-3 px-4">Status / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {studentData?.recentLogs && studentData.recentLogs.length > 0 ? (
                  studentData.recentLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        #{log.seatNumber || desk.seatNumber || 51}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          log.punchType === 'IN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {log.punchType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.method}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {log.accessResult === 'GRANTED' ? (
                          <span className="text-emerald-700 flex items-center space-x-1">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>UNLOCKED (5s)</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5" />
                            <span>LOCKED (BLOCKED)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {log.durationFormatted || (log.punchType === 'IN' ? 'Studying...' : 'Recorded')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No biometric punches recorded yet today. Use the simulator above to test punch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= SECTION 4: STUDENT ID CARD & ADMISSION PROFILE (SECTIONS 01 TO 05) ================= */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-md border border-purple-200">
                  OFFICIAL STUDENT PROFILE
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  Seat #{desk.seatNumber}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Student Admission Record & Digital ID
              </h2>
              <p className="text-xs text-slate-500">
                Verified admission data registered at Brain Dock Library Director Desk.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 self-start sm:self-auto">
              <span>Adm ID: {student.admissionId || bio.grId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left Photo & ID Badge */}
            <div className="md:col-span-1 flex flex-col items-center text-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              {student.studentPhoto ? (
                <img 
                  src={student.studentPhoto} 
                  alt={student.studentName} 
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-extrabold flex items-center justify-center text-3xl shadow-md border-4 border-white">
                  {student.studentName.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{student.studentName}</h3>
                <p className="text-[11px] text-purple-700 font-mono font-bold">{bio.grId}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Brain Dock Library Member</p>
              </div>

              <div className="w-full pt-2 border-t border-slate-200 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Desk:</span>
                  <span className="font-bold text-purple-900">Seat #{desk.seatNumber}</span>
                </div>
                {student.lockerNumber && (
                  <div className="flex justify-between text-slate-600">
                    <span>Locker:</span>
                    <span className="font-bold text-slate-900">{student.lockerNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Timing:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[110px]">{student.shift}</span>
                </div>
              </div>
            </div>

            {/* Right Admission Details (Sections 01 - 05) */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* 01 Personal Info */}
              <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-purple-900 block pb-1 border-b border-purple-100">
                  01 Personal Details
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Father / Mother:</span>
                    <span className="font-semibold text-slate-900">{student.parentsName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-semibold text-slate-900">{student.dob || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-semibold text-slate-900">{student.gender || 'Male'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="font-mono font-semibold text-slate-900">{student.studentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-semibold text-purple-800 truncate max-w-[150px]">{student.studentEmail || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-900 truncate max-w-[160px]">{student.address ? `${student.address}, ${student.city || ''}` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* 02 Education Details */}
              <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-2">
                <span className="text-[11px] font-bold text-indigo-900 block pb-1 border-b border-indigo-100">
                  02 Education & Aspirations
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Qualification:</span>
                    <span className="font-semibold text-slate-900">{student.qualification || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">College / Univ:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[150px]">{student.institution || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course / Stream:</span>
                    <span className="font-semibold text-slate-900">{student.course || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Year / Sem:</span>
                    <span className="font-semibold text-slate-900">{student.yearSemester || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Exam:</span>
                    <span className="font-bold text-indigo-900">{student.targetExam || 'General Study'}</span>
                  </div>
                </div>
              </div>

              {/* 03 Emergency Contact */}
              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block pb-1 border-b border-emerald-100">
                  03 Emergency Contact
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Name:</span>
                    <span className="font-semibold text-slate-900">{student.emergencyName || student.parentsName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="font-semibold text-slate-900">{student.emergencyRelation || 'Parent'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-mono font-semibold text-slate-900">{student.emergencyPhone || student.guardianPhone || '—'}</span>
                  </div>
                </div>
              </div>

              {/* 04 Identity Proof & Biometric Pin */}
              <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 block pb-1 border-b border-amber-100">
                  04 Identity & Access Credentials
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Type:</span>
                    <span className="font-semibold text-slate-900">{student.idProofType || 'Aadhaar Card'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID Proof No:</span>
                    <span className="font-mono font-semibold text-slate-900">{student.idProofNo || student.aadhaarNo || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biometric PIN:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      {bio.biometricEnrollmentId || desk.seatNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Photo Attached:</span>
                    <span className="font-bold text-emerald-700">
                      {student.studentPhoto ? '✅ Verified Photo' : 'No Photo'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= SECTION 5: FEE STATUS & DESK AMENITIES ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Desk Amenities */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Your Desk #{desk.seatNumber} Facilities</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {desk.amenities.map((am, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{am}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee & Receipt Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-purple-700" />
                <span>Admission Fee & Account Status</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Total Plan Fee:</span>
                  <span className="font-bold text-slate-800">₹{student.totalFee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">₹{student.paidAmount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Pending Dues:</span>
                  <span className={`font-bold font-mono ${hasPendingFee ? 'text-amber-700' : 'text-slate-500'}`}>
                    ₹{student.pendingFee}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fee Status:</span>
                  <span className={`font-bold ${hasPendingFee ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {student.feeStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL: OFFICIAL A4 DUAL PRINTABLE RECEIPT ================= */}
      <DualA4ReceiptModal 
        receipt={receiptModal} 
        isOpen={!!receiptModal} 
        onClose={() => setReceiptModal(null)} 
      />

    </div>
  );
}

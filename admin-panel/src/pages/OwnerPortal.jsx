import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  UserPlus, 
  Search, 
  Filter, 
  Printer, 
  BarChart3, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  CreditCard, 
  QrCode, 
  X, 
  Eye, 
  Check, 
  Share2, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Fingerprint,
  UserCheck,
  Zap,
  Trash2,
  DoorOpen,
  MessageCircle,
  Send,
  CalendarClock,
  Edit2,
  Camera,
  UploadCloud,
  User,
  MapPin,
  GraduationCap,
  Building,
  BookOpen,
  HeartHandshake,
  FileText,
  Image as ImageIcon,
  Plus,
  Cloud,
  ExternalLink,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  Smartphone,
  Bot,
  Wifi,
  WifiOff,
  Power
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import DualA4ReceiptModal from '../components/DualA4ReceiptModal';
import MasterMonthlyRegister from '../components/MasterMonthlyRegister';
import CameraCaptureCropModal from '../components/CameraCaptureCropModal';
import { compressImage } from '../utils/imageCompressor';
import { API_BASE_URL } from '../config';

export default function OwnerPortal() {
  const { currentStaff } = useAdminAuth();

  // Security Gate State
  const [isUnlocked, setIsUnlocked] = useState(true); // Default accessible for authorized director
  const [masterPin, setMasterPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Instant offline-first local cache getter (Provides instant 0ms appearance on page load)
  const getInitialOwnerCache = () => {
    try {
      const raw = localStorage.getItem('bdl_owner_full_backup');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.admissions) && parsed.admissions.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  };

  const initialCache = getInitialOwnerCache();

  // Core Data - Preloaded immediately from browser storage for instant 0ms appearance (Always sorted 1..102)
  const [seats, setSeats] = useState(() => (initialCache?.ownerSeats ? [...initialCache.ownerSeats].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)) : []));
  const [admissions, setAdmissions] = useState(() => initialCache?.admissions || []);
  const [stats, setStats] = useState(() => {
    if (initialCache?.homepageStats?.ownerStats) return initialCache.homepageStats.ownerStats;
    if (initialCache?.admissions && initialCache.admissions.length > 0) {
      const totalSeats = 102;
      const activeAdms = initialCache.admissions.filter(a => a.status !== 'Vacated');
      const occupiedSeats = activeAdms.length;
      const paidFee = activeAdms.reduce((sum, a) => sum + (Number(a.paidAmount) || 0), 0);
      const pendingFee = activeAdms.reduce((sum, a) => sum + (Number(a.pendingFee) || 0), 0);
      return {
        totalSeats,
        occupiedSeats,
        availableSeats: Math.max(0, totalSeats - occupiedSeats),
        maintenanceSeats: 0,
        occupancyRate: Math.round((occupiedSeats / totalSeats) * 100),
        totalFeeCollected: paidFee,
        totalFeePending: pendingFee,
        pendingCount: activeAdms.filter(a => a.pendingFee > 0).length,
        expiringSoonCount: activeAdms.filter(a => a.daysRemaining <= 3 && a.daysRemaining >= 0).length,
        expiredCount: activeAdms.filter(a => a.daysRemaining < 0).length
      };
    }
    return {
      totalSeats: 102,
      occupiedSeats: 0,
      availableSeats: 102,
      maintenanceSeats: 0,
      occupancyRate: 0,
      totalFeeCollected: 0,
      totalFeePending: 0,
      pendingCount: 0,
      expiringSoonCount: 0,
      expiredCount: 0
    };
  });

  const [loading, setLoading] = useState(() => !initialCache || (initialCache.admissions || []).length === 0);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'grid'); // 'grid' | 'register' | 'expiries' | 'monthly-register'

  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab && qTab !== activeTab) {
      setActiveTab(qTab);
    }
  }, [searchParams]);
  const [gridFilter, setGridFilter] = useState('all'); // 'all' | 'available' | 'occupied' | 'pending' | 'expiring'
  const [searchQuery, setSearchQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState('all'); // 'all' | 'pending' | 'paid' | 'expiring' | 'expired'

  // Biometric Attendance & Hardware State
  const [biometricLogs, setBiometricLogs] = useState(() => initialCache?.biometricLogs || []);
  const [biometricStats, setBiometricStats] = useState(null);
  const [bioFilter, setBioFilter] = useState('all'); // 'all' | 'granted' | 'denied' | 'in' | 'out'
  const [bioSearch, setBioSearch] = useState('');
  const [simulatedSeatNum, setSimulatedSeatNum] = useState(1);
  const [simulatedPunchResult, setSimulatedPunchResult] = useState(null);
  const [simulatingPunch, setSimulatingPunch] = useState(false);

  // 3-Day Expiry Reminders State & Configurable Renewal Fee
  const [expiryReminders, setExpiryReminders] = useState([]);
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [renewalFee, setRenewalFee] = useState(() => {
    try {
      const savedFee = localStorage.getItem('bdl_renewal_fee');
      if (savedFee) return Number(savedFee);
    } catch (e) {}
    return 999;
  });
  const [offerNote, setOfferNote] = useState(() => {
    try {
      return localStorage.getItem('bdl_renewal_note') || '';
    } catch (e) {}
    return '';
  });
  const [savingRenewalSettings, setSavingRenewalSettings] = useState(false);
  const [studentRenewalFees, setStudentRenewalFees] = useState({});

  // Modals
  const [selectedSeat, setSelectedSeat] = useState(null); // When seat is clicked
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [preselectedSeatNum, setPreselectedSeatNum] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAdmissionForPay, setSelectedAdmissionForPay] = useState(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedAdmissionForRenew, setSelectedAdmissionForRenew] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveStatus, setDriveStatus] = useState(null);
  const [pushingDrive, setPushingDrive] = useState(false);
  const [loadingDriveStatus, setLoadingDriveStatus] = useState(false);

  // Security Credentials Modal State (Change Password & PIN)
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState('password'); // 'password' | 'pin'
  const [secEmail, setSecEmail] = useState(currentStaff?.email || 'admin@braindock.com');
  const [secCurrentPassword, setSecCurrentPassword] = useState('');
  const [secNewPassword, setSecNewPassword] = useState('');
  const [secConfirmPassword, setSecConfirmPassword] = useState('');
  const [secPassLoading, setSecPassLoading] = useState(false);
  const [secPassMsg, setSecPassMsg] = useState(null);
  const [secPassErr, setSecPassErr] = useState(null);

  const [secCurrentPin, setSecCurrentPin] = useState('');
  const [secNewPin, setSecNewPin] = useState('');
  const [secConfirmPin, setSecConfirmPin] = useState('');
  const [secPinLoading, setSecPinLoading] = useState(false);
  const [secPinMsg, setSecPinMsg] = useState(null);
  const [secPinErr, setSecPinErr] = useState(null);

  // Calculate duration dates helper (auto-computes end date from start date and months)
  const calculateMembershipEndDate = (startDateStr, months = 1) => {
    if (!startDateStr) return '';
    try {
      const d = new Date(startDateStr);
      if (isNaN(d.getTime())) return '';
      d.setMonth(d.getMonth() + Number(months || 1));
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Helper: auto-format Aadhaar number as 4-4-4 digits (XXXX XXXX XXXX)
  const formatAadhaarNumber = (val) => {
    if (!val) return '';
    const digits = String(val).replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  // Comprehensive Admission Form Initial State (Sections 01 to 05)
  const todayStr = new Date().toISOString().split('T')[0];
  const initialAdmForm = {
    // 01 Personal Details
    studentName: '',
    parentsName: '',
    dob: '',
    gender: 'Male',
    studentPhone: '',
    whatsAppNumber: '',
    studentEmail: '',
    address: '',
    city: 'Amreli',
    pinCode: '365601',

    // 02 Education / Professional
    qualification: '',
    institution: '',
    course: '',
    yearSemester: '',
    occupation: '',
    targetExam: 'UPSC Civil Services',

    // 03 Library Membership
    membershipType: 'Monthly',
    shift: 'Full Day (24x7)',
    durationMonths: 1,
    startDate: todayStr,
    endDate: calculateMembershipEndDate(todayStr, 1),
    seatNumber: '',
    biometricEnrollmentId: '',
    lockerNumber: '',

    // 04 Emergency Contact
    emergencyName: '',
    emergencyRelation: 'Parent',
    emergencyPhone: '',
    guardianPhone: '',

    // 05 Identity / Document
    idProofType: 'Aadhaar Card',
    idProofNo: '',
    aadhaarNo: '',
    studentPhoto: '',
    aadhaarFront: '',
    aadhaarBack: '',

    // Fee & Payment (Itemized with dynamic + rows) - ₹850 Desk Fee + ₹500 Security Deposit = ₹1350
    feeItems: [
      { description: 'Dedicated Study Desk & Facility Pass (Monthly Fee)', amount: 850 },
      { description: 'Security Deposit (Refundable)', amount: 500 }
    ],
    totalFee: 1350,
    paidAmount: 1350,
    paymentMode: 'UPI (GPay / PhonePe)',
    transactionRef: '',
    feeDueDate: '',
    notes: ''
  };

  const [admForm, setAdmForm] = useState(initialAdmForm);
  const [editingAdmissionId, setEditingAdmissionId] = useState(null);
  const [imageCompressInfo, setImageCompressInfo] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  // Live Camera Capture & Interactive Cropping Modal State
  const [cropModalConfig, setCropModalConfig] = useState({
    isOpen: false,
    target: 'studentPhoto',
    title: 'Student Profile Photo',
    aspectRatio: 1
  });
  // Full-screen document preview lightbox
  const [documentLightbox, setDocumentLightbox] = useState(null);

  // Collect Payment Form State
  const [payForm, setPayForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    transactionRef: '',
    notes: ''
  });

  // Renewal Form State (Itemized with dynamic + rows)
  const [renewForm, setRenewForm] = useState({
    months: 1,
    feeItems: [
      { description: 'Desk Extension (1 Month)', amount: 1500 }
    ],
    totalFee: 1500,
    paidAmount: 1500,
    paymentMode: 'UPI'
  });

  // Fee Items Handlers for Admission Form
  const handleAddAdmFeeItem = () => {
    const updated = [...(admForm.feeItems || []), { description: '', amount: 0 }];
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setAdmForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  const handleRemoveAdmFeeItem = (index) => {
    const current = admForm.feeItems || [];
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index);
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setAdmForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  const handleAdmFeeItemChange = (index, field, value) => {
    const updated = (admForm.feeItems || []).map((it, i) => {
      if (i === index) {
        return { ...it, [field]: field === 'amount' ? (Number(value) || 0) : value };
      }
      return it;
    });
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setAdmForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  // Fee Items Handlers for Renewal Form
  const handleAddRenewItem = () => {
    const updated = [...(renewForm.feeItems || []), { description: '', amount: 0 }];
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setRenewForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  const handleRemoveRenewItem = (index) => {
    const current = renewForm.feeItems || [];
    if (current.length <= 1) return;
    const updated = current.filter((_, i) => i !== index);
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setRenewForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  const handleRenewItemChange = (index, field, value) => {
    const updated = (renewForm.feeItems || []).map((it, i) => {
      if (i === index) {
        return { ...it, [field]: field === 'amount' ? (Number(value) || 0) : value };
      }
      return it;
    });
    const sum = updated.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    setRenewForm(prev => ({ ...prev, feeItems: updated, totalFee: sum, paidAmount: sum }));
  };

  useEffect(() => {
    fetchOwnerData();
    // Live Auto-Refresh: Poll biometric punches from machine every 3 seconds
    const interval = setInterval(() => {
      fetchBiometricData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchOwnerData = async () => {
    // Only show full loading spinner if no cached data exists
    if (!admissions || admissions.length === 0) {
      setLoading(true);
    }

    try {
      // 1. High-Speed Single Roundtrip Consolidated Bootstrap
      const bootstrapRes = await fetch(`${API_BASE_URL}/api/owner/bootstrap`).then(r => r.json()).catch(() => null);
      if (bootstrapRes && bootstrapRes.success && bootstrapRes.data) {
        const { seats: bSeats, admissions: bAdmissions, stats: bStats, biometricLogs: bBioLogs, biometricStats: bBioStats, expiryReminders: bExp } = bootstrapRes.data;

        if (Array.isArray(bSeats)) {
          setSeats([...bSeats].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)));
        }
        if (Array.isArray(bAdmissions)) {
          setAdmissions(bAdmissions);
          // Keep local storage cache fresh
          const cached = localStorage.getItem('bdl_owner_full_backup');
          let existingCount = 0;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              existingCount = Array.isArray(parsed?.admissions) ? parsed.admissions.length : 0;
            } catch (e) {}
          }
          if (bAdmissions.length >= existingCount) {
            localStorage.setItem('bdl_owner_full_backup', JSON.stringify({
              admissions: bAdmissions,
              ownerSeats: bSeats,
              biometricLogs: bBioLogs,
              homepageStats: { ownerStats: bStats }
            }));
          }
        }
        if (bStats) setStats(bStats);
        if (Array.isArray(bBioLogs)) setBiometricLogs(bBioLogs);
        if (bBioStats) setBiometricStats(bBioStats);
        if (Array.isArray(bExp)) setExpiryReminders(bExp);
        if (bootstrapRes.data.renewalSettings) {
          const { defaultRenewalFee, offerNote: bNote } = bootstrapRes.data.renewalSettings;
          if (defaultRenewalFee) {
            setRenewalFee(Number(defaultRenewalFee));
            try { localStorage.setItem('bdl_renewal_fee', String(defaultRenewalFee)); } catch (e) {}
          }
          if (bNote !== undefined) {
            setOfferNote(bNote || '');
            try { localStorage.setItem('bdl_renewal_note', bNote || ''); } catch (e) {}
          }
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Bootstrap note, falling back to parallel fetch:', err.message);
    }

    // Fallback: Parallel requests
    Promise.all([
      fetch(`${API_BASE_URL}/api/owner/seats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/admissions`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/biometric/logs`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/biometric/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/expiry-reminders`).then(r => r.json())
    ])
      .then(async ([seatsRes, admRes, statsRes, bioLogsRes, bioStatsRes, expRes]) => {
        let currentAdmissions = (admRes && admRes.success && Array.isArray(admRes.data)) ? admRes.data : [];

        if (seatsRes && seatsRes.success && Array.isArray(seatsRes.data)) {
          setSeats([...seatsRes.data].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)));
        }
        if (currentAdmissions.length > 0) {
          setAdmissions(currentAdmissions);
        }
        if (statsRes && statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (bioLogsRes && bioLogsRes.success && Array.isArray(bioLogsRes.data)) {
          setBiometricLogs(bioLogsRes.data);
        }
        if (bioStatsRes && bioStatsRes.success && bioStatsRes.data) {
          setBiometricStats(bioStatsRes.data);
        }
        if (expRes && expRes.success && Array.isArray(expRes.data)) {
          setExpiryReminders(expRes.data);
        }
        setLoading(false);

        // Keep local storage backup fresh
        if (currentAdmissions.length > 0) {
          try {
            fetch(`${API_BASE_URL}/api/owner/backup`)
              .then(r => r.json())
              .then(d => {
                if (d.success && d.data && Array.isArray(d.data.admissions)) {
                  const cached = localStorage.getItem('bdl_owner_full_backup');
                  let existingCount = 0;
                  if (cached) {
                    try {
                      const parsed = JSON.parse(cached);
                      existingCount = Array.isArray(parsed?.admissions) ? parsed.admissions.length : 0;
                    } catch (e) {}
                  }
                  if (d.data.admissions.length >= existingCount) {
                    localStorage.setItem('bdl_owner_full_backup', JSON.stringify(d.data));
                  }
                }
              }).catch(() => {});
          } catch (e) {}
        }
      })
      .catch(err => {
        console.error('Failed to load owner data', err);
        setLoading(false);
      });
  };

  const fetchExpiryReminders = (customFee = renewalFee, customNote = offerNote) => {
    setExpiryLoading(true);
    const query = new URLSearchParams();
    if (customFee) query.append('fee', customFee);
    if (customNote) query.append('offerNote', customNote);

    fetch(`${API_BASE_URL}/api/owner/expiry-reminders?${query.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setExpiryReminders(d.data || []);
        setExpiryLoading(false);
      })
      .catch(e => {
        console.error('Failed to load expiry reminders', e);
        setExpiryLoading(false);
      });
  };

  const handleRenewalFeeChange = (newFee, note) => {
    const feeNum = Number(newFee);
    setRenewalFee(feeNum);
    if (note !== undefined) setOfferNote(note);
    try {
      localStorage.setItem('bdl_renewal_fee', String(feeNum));
      if (note !== undefined) localStorage.setItem('bdl_renewal_note', note);
    } catch (e) {}
    // Reset individual overrides to follow the new default
    setStudentRenewalFees({});
    fetchExpiryReminders(feeNum, note !== undefined ? note : offerNote);
  };

  const handleSaveRenewalSettings = async () => {
    setSavingRenewalSettings(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/renewal-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRenewalFee: Number(renewalFee), offerNote })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Default Renewal Fee of ₹${renewalFee}/mo saved permanently!`);
      } else {
        alert(data.message || 'Failed to save renewal settings');
      }
    } catch (e) {
      alert('Error saving renewal settings');
    } finally {
      setSavingRenewalSettings(false);
    }
  };

  // ================= WHATSAPP AUTOMATION BOT STATE & HANDLERS =================
  const [botStatus, setBotStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
  const [botInfo, setBotInfo] = useState({ connectedNumber: null, qrCodeDataUrl: null, lastConnectedAt: null });
  const [schedulerSettings, setSchedulerSettings] = useState({
    autoDispatchEnabled: true,
    dispatchTimeString: '09:30',
    delayBetweenMsgsSec: 4
  });
  const [botModalOpen, setBotModalOpen] = useState(false);
  const [connectingBot, setConnectingBot] = useState(false);
  const [dispatchingNow, setDispatchingNow] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('6356006100');
  const [testMessage, setTestMessage] = useState('🔔 *Brain Dock Library* - Automated WhatsApp Bot Test! 📚\nYour library WhatsApp automation session is 100% active and working smoothly.');
  const [sendingTest, setSendingTest] = useState(false);
  const [previewMessageItem, setPreviewMessageItem] = useState(null);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/status`);
      const data = await res.json();
      if (data.success) {
        if (data.bot) {
          setBotStatus(data.bot.status);
          setBotInfo(data.bot);
        }
        if (data.scheduler) {
          setSchedulerSettings(data.scheduler);
        }
      }
    } catch (e) {}
  };

  // Poll status when in 'expiries' tab or when QR modal is active
  useEffect(() => {
    if (activeTab === 'expiries') {
      fetchBotStatus();
      const interval = setInterval(fetchBotStatus, botStatus === 'qr_ready' ? 2500 : 8000);
      return () => clearInterval(interval);
    }
  }, [activeTab, botStatus]);

  const handleConnectBot = async () => {
    setConnectingBot(true);
    setBotModalOpen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/connect`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.bot) {
        setBotStatus(data.bot.status);
        setBotInfo(data.bot);
      }
    } catch (e) {
      alert('Error initializing WhatsApp bot connection.');
    } finally {
      setConnectingBot(false);
    }
  };

  const handleDisconnectBot = async () => {
    if (!window.confirm('Are you sure you want to unlink WhatsApp from the server?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/disconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('WhatsApp session unlinked.');
        fetchBotStatus();
      }
    } catch (e) {
      alert('Error unlinking WhatsApp.');
    }
  };

  const handleTriggerDispatchNow = async () => {
    const dueCount = expiryReminders.filter(e => !e.alreadySentToday).length;
    if (dueCount === 0) {
      alert('Sabhi expiring students ko aaj ka message already bhej diya gaya hai!');
      return;
    }
    if (!window.confirm(`Kya aap sabhi ${dueCount} due students ko abhi automatic WhatsApp message bhejna chahte hain?`)) return;

    setDispatchingNow(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/trigger-dispatch`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 ${data.message}`);
        fetchExpiryReminders();
        fetchBotStatus();
      } else {
        alert(data.message || data.error || 'Failed to trigger batch dispatch.');
      }
    } catch (e) {
      alert('Error triggering batch dispatch.');
    } finally {
      setDispatchingNow(false);
    }
  };

  const handleSaveSchedulerSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/scheduler-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSchedulerSettings(data.settings);
        showToast('✅ WhatsApp Auto-Dispatch settings saved!');
      }
    } catch (e) {
      alert('Error saving auto-dispatch settings.');
    }
  };

  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    setSendingTest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMessage })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Test message delivered to +91 ${testPhone}!`);
        setTestModalOpen(false);
      } else {
        alert(data.error || 'Test message failed to send.');
      }
    } catch (e) {
      alert('Network error sending test message.');
    } finally {
      setSendingTest(false);
    }
  };

  const buildClientWhatsAppUrl = (item, fee, note = offerNote) => {
    const cleanPhone = (item.studentPhone || '').replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    const diffDays = item.daysRemaining;
    const expiryLabel = diffDays < 0 
      ? `EXPIRED ${Math.abs(diffDays)} day(s) ago` 
      : diffDays === 0 
        ? 'EXPIRES TODAY' 
        : `expiring in ${diffDays} day(s)`;

    const feeText = `₹${fee || 999} / Month${note ? ` (${note})` : ''}`;

    const text = `🔔 *Brain Dock Library - Membership Renewal Alert* 📚\n\nDear *${item.studentName}*,\n\nYour library membership for *Seat #${item.seatNumber}* is ${expiryLabel} on *${item.endDate}*.\n\n⚠️ *Seat Protection Notice:*\nTo ensure your personal seat is retained and your 24/7 biometric attendance access continues without disruption, please renew your membership at the library desk today.\n\n📌 *Seat:* Seat #${item.seatNumber} (${item.shift || 'Full Day'})\n📅 *Valid Till:* ${item.endDate}\n💰 *Renewal Plan:* ${feeText}\n\n📍 *Brain Dock Library*\n2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601\nHelpline: +91 63 5600 6100\nThank you!`;

    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
  };

  // Close any active modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAdmissionModalOpen(false);
        setEditingAdmissionId(null);
        setSelectedSeat(null);
        setReceiptModalOpen(false);
        setPaymentModalOpen(false);
        setRenewModalOpen(false);
        setDeleteConfirmModal(null);
        setDriveModalOpen(false);
        setSecurityModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendSingleReminder = async (item) => {
    setSendingReminderId(item.admissionId);
    const customFee = studentRenewalFees[item.admissionId] !== undefined 
      ? Number(studentRenewalFees[item.admissionId]) 
      : (item.renewalFee || Number(renewalFee));

    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/expiry-reminders/${item.admissionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewalFee: customFee, offerNote })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Reminder recorded for ${item.studentName} (₹${customFee})! Opening WhatsApp...`);
        const targetUrl = data.whatsAppUrl || buildClientWhatsAppUrl(item, customFee, offerNote);
        window.open(targetUrl, '_blank');
        fetchExpiryReminders();
      } else {
        alert(data.message || 'Failed to dispatch reminder');
      }
    } catch (e) {
      alert('Error sending reminder');
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleSendAllDueReminders = async () => {
    const dueCount = expiryReminders.filter(e => !e.alreadySentToday).length;
    if (!window.confirm(`Send WhatsApp renewal reminder to all ${dueCount} student(s) expiring in the next 3 days?\n\nActive Renewal Fee: ₹${renewalFee} / month`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/expiry-reminders/send-all-due`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          renewalFee: Number(renewalFee), 
          offerNote, 
          feesByAdmission: studentRenewalFees 
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchExpiryReminders();
        if (data.items && data.items.length > 0) {
          window.open(data.items[0].whatsAppUrl, '_blank');
        }
      }
    } catch (e) {
      alert('Error sending batch reminders');
    }
  };

  const fetchBiometricData = () => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/biometric/logs`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/biometric/stats`).then(r => r.json())
    ]).then(([logsRes, statsRes]) => {
      if (logsRes.success) setBiometricLogs(logsRes.data);
      if (statsRes.success) setBiometricStats(logsRes.data);
    }).catch(e => console.error(e));
  };

  // Full Database Backup Download (Local Laptop Storage)
  const handleDownloadBackup = async () => {
    try {
      showToast('Preparing full library database backup...');
      const res = await fetch(`${API_BASE_URL}/api/owner/backup`);
      const data = await res.json();
      if (data.success) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `BrainDock_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('✅ Database backup successfully saved to your laptop!');
      }
    } catch (e) {
      showToast('Failed to download backup');
    }
  };

  // Restore Database from Laptop Backup JSON
  const handleRestoreBackupFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm(`Restore database from "${file.name}"? This will recover all students, receipts, and assigned seats.`)) {
      e.target.value = '';
      return;
    }
    try {
      const text = await file.text();
      const backupObj = JSON.parse(text);
      const res = await fetch(`${API_BASE_URL}/api/owner/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup: backupObj })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.message}`);
        fetchOwnerData();
      } else {
        showToast(data.message || 'Restore failed');
      }
    } catch (err) {
      showToast('Error parsing backup file. Please select a valid Brain Dock backup JSON.');
    }
    e.target.value = '';
  };

  // Google Drive Cloud Backup Status & Manual Trigger
  const fetchDriveStatus = async () => {
    setLoadingDriveStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/backup/google-drive/status`);
      const data = await res.json();
      if (data.success) {
        setDriveStatus(data.data);
      }
    } catch (e) {
      console.error('Failed to load Google Drive status', e);
    } finally {
      setLoadingDriveStatus(false);
    }
  };

  const handleOpenDriveModal = () => {
    setDriveModalOpen(true);
    fetchDriveStatus();
  };

  const handlePushToGoogleDrive = async () => {
    setPushingDrive(true);
    try {
      showToast('Uploading full backup to Google Drive...');
      const res = await fetch(`${API_BASE_URL}/api/owner/backup/google-drive`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Cloud backup successfully uploaded to Google Drive!');
        fetchDriveStatus();
      } else {
        alert(data.message || 'Google Drive backup failed. Check your Service Account credentials.');
      }
    } catch (e) {
      alert('Error uploading to Google Drive: ' + e.message);
    } finally {
      setPushingDrive(false);
    }
  };

  // Simulate Biometric Punch on TIMEWATCH Hardware
  const handleRunSimulatedPunch = async (targetSeatNum, method = 'Fingerprint') => {
    const seatToPunch = targetSeatNum != null ? targetSeatNum : simulatedSeatNum;
    setSimulatingPunch(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/biometric/punch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatNumber: seatToPunch,
          method
        })
      });
      const data = await res.json();
      setSimulatedPunchResult(data);
      setSimulatingPunch(false);
      fetchBiometricData();
      showToast(data.message || (data.granted ? '🟢 Punch Recorded & Unlocked' : '⛔ Access Denied'));
    } catch (err) {
      setSimulatingPunch(false);
      showToast('Error sending punch signal to TIMEWATCH terminal');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Security PIN Verification (Dynamic API verification + offline fallback)
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: masterPin })
      });
      const data = await res.json();
      if (data.success && data.authorized) {
        setIsUnlocked(true);
        setPinError('');
        showToast('Owner access verified! Welcome Director.');
        return;
      }
    } catch (err) {}

    // Fallback offline verification
    if (masterPin === '2026' || masterPin === '1234' || masterPin === 'braindock123') {
      setIsUnlocked(true);
      setPinError('');
      showToast('Owner access verified! Welcome Director.');
    } else {
      setPinError('Invalid Passkey PIN. Please enter the authorized owner PIN.');
    }
  };

  // Handle Security Modal: Change Login Password
  const handleSecurityPasswordSubmit = async (e) => {
    e.preventDefault();
    setSecPassErr(null);
    setSecPassMsg(null);
    if (!secCurrentPassword) {
      setSecPassErr('Please enter your current login password.');
      return;
    }
    if (!secNewPassword || secNewPassword.length < 6) {
      setSecPassErr('New password must be at least 6 characters long.');
      return;
    }
    if (secNewPassword !== secConfirmPassword) {
      setSecPassErr('New password and confirm password do not match.');
      return;
    }

    setSecPassLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: secEmail,
          currentPassword: secCurrentPassword,
          newPassword: secNewPassword
        })
      });
      const data = await res.json();
      setSecPassLoading(false);
      if (data.success) {
        setSecPassMsg('✅ Login password changed successfully! Please use your new password next time.');
        setSecCurrentPassword('');
        setSecNewPassword('');
        setSecConfirmPassword('');
        showToast('Login password updated successfully!');
      } else {
        setSecPassErr(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setSecPassLoading(false);
      setSecPassErr('Network error while changing password.');
    }
  };

  // Handle Security Modal: Change Director Passkey PIN
  const handleSecurityPinSubmit = async (e) => {
    e.preventDefault();
    setSecPinErr(null);
    setSecPinMsg(null);
    if (!secNewPin || secNewPin.length < 4) {
      setSecPinErr('New PIN must be at least 4 digits.');
      return;
    }
    if (secNewPin !== secConfirmPin) {
      setSecPinErr('New PIN and confirm PIN do not match.');
      return;
    }

    setSecPinLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin: secCurrentPin,
          newPin: secNewPin
        })
      });
      const data = await res.json();
      setSecPinLoading(false);
      if (data.success) {
        setSecPinMsg('✅ Director Passkey PIN updated successfully!');
        setSecCurrentPin('');
        setSecNewPin('');
        setSecConfirmPin('');
        showToast('Director Passkey PIN updated successfully!');
      } else {
        setSecPinErr(data.message || 'Failed to change PIN.');
      }
    } catch (err) {
      setSecPinLoading(false);
      setSecPinErr('Network error while changing PIN.');
    }
  };

  // Handle Opening Admission Modal for a Specific Seat (New Admission)
  const handleOpenAdmit = (seatNum) => {
    setEditingAdmissionId(null);
    setImageCompressInfo(null);
    setPreselectedSeatNum(seatNum);
    const chosen = seatNum || (availableSeatsList[0]?.seatNumber || 1);
    const sDate = new Date().toISOString().split('T')[0];
    const eDate = calculateMembershipEndDate(sDate, 1);
    setAdmForm({
      ...initialAdmForm,
      seatNumber: chosen,
      biometricEnrollmentId: chosen,
      startDate: sDate,
      endDate: eDate,
      feeItems: [
        { description: `Dedicated Study Desk #${chosen} & Facility Pass (Monthly Fee)`, amount: 850 },
        { description: 'Security Deposit (Refundable)', amount: 500 }
      ],
      totalFee: 1350,
      paidAmount: 1350,
      aadhaarFront: '',
      aadhaarBack: '',
      transactionRef: `UPI/${Date.now().toString().slice(-6)}`
    });
    setAdmissionModalOpen(true);
  };

  // Handle Opening Admission in Edit Mode
  const handleOpenEditAdmission = (admission) => {
    setEditingAdmissionId(admission.admissionId);
    setImageCompressInfo(null);
    setPreselectedSeatNum(admission.seatNumber);
    const sDate = admission.startDate || new Date().toISOString().split('T')[0];
    const eDate = admission.endDate || calculateMembershipEndDate(sDate, admission.durationMonths || 1);

    // Keep itemized fee breakdown separate (₹850 monthly fee + ₹500 security deposit)
    let items = (admission.feeItems && Array.isArray(admission.feeItems) && admission.feeItems.length > 0)
      ? admission.feeItems
      : null;

    if (!items) {
      const tot = Number(admission.totalFee) || 1350;
      const dep = Number(admission.deposit) || (tot === 1350 ? 500 : 0);
      const deskFee = tot - dep;
      items = [
        { description: `Dedicated Study Desk #${admission.seatNumber || ''} & Facility Pass (Monthly Fee)`, amount: deskFee > 0 ? deskFee : tot },
        ...(dep > 0 ? [{ description: 'Security Deposit (Refundable)', amount: dep }] : [])
      ];
    }

    setAdmForm({
      studentName: admission.studentName || '',
      parentsName: admission.parentsName || '',
      dob: admission.dob || '',
      gender: admission.gender || 'Male',
      studentPhone: admission.studentPhone || '',
      whatsAppNumber: admission.whatsAppNumber || admission.studentPhone || '',
      studentEmail: admission.studentEmail || '',
      address: admission.address || '',
      city: admission.city || 'Amreli',
      pinCode: admission.pinCode || '365601',
      qualification: admission.qualification || '',
      institution: admission.institution || '',
      course: admission.course || '',
      yearSemester: admission.yearSemester || '',
      occupation: admission.occupation || admission.targetExam || '',
      targetExam: admission.targetExam || '',
      membershipType: admission.membershipType || 'Monthly',
      shift: admission.shift || 'Full Day (24x7)',
      durationMonths: Number(admission.durationMonths) || 1,
      startDate: sDate,
      endDate: eDate,
      seatNumber: admission.seatNumber || '',
      biometricEnrollmentId: admission.biometricEnrollmentId || admission.seatNumber || '',
      lockerNumber: admission.lockerNumber || '',
      emergencyName: admission.emergencyName || admission.guardianName || '',
      emergencyRelation: admission.emergencyRelation || 'Parent',
      emergencyPhone: admission.emergencyPhone || admission.guardianPhone || '',
      guardianPhone: admission.guardianPhone || admission.emergencyPhone || '',
      idProofType: admission.idProofType || 'Aadhaar Card',
      idProofNo: formatAadhaarNumber(admission.idProofNo || admission.aadhaarNo || ''),
      aadhaarNo: formatAadhaarNumber(admission.aadhaarNo || admission.idProofNo || ''),
      studentPhoto: admission.studentPhoto || '',
      aadhaarFront: admission.aadhaarFront || admission.idProofFront || '',
      aadhaarBack: admission.aadhaarBack || admission.idProofBack || '',
      feeItems: items,
      totalFee: admission.totalFee || 1350,
      paidAmount: admission.paidAmount || 1350,
      paymentMode: admission.paymentMode || 'UPI (GPay / PhonePe)',
      transactionRef: admission.transactionRef || '',
      feeDueDate: admission.feeDueDate || '',
      notes: admission.notes || ''
    });
    setAdmissionModalOpen(true);
  };

  // Document Gallery File Picker Ref
  const docFilePickerRef = useRef(null);
  const [activeDocTarget, setActiveDocTarget] = useState({ field: 'studentPhoto', title: 'Student Profile Photo', aspectRatio: 1 });

  // Open Direct Camera & Crop Modal for any document
  const handleOpenDocCameraModal = (field, title, aspectRatio) => {
    setCropModalConfig({
      isOpen: true,
      target: field,
      title,
      aspectRatio,
      initialImage: null
    });
  };

  // Open Gallery File Picker for any document (transitions into cropper)
  const handleOpenDocGallery = (field, title, aspectRatio) => {
    setActiveDocTarget({ field, title, aspectRatio });
    if (docFilePickerRef.current) {
      docFilePickerRef.current.value = '';
      docFilePickerRef.current.click();
    }
  };

  // When a file is chosen from Gallery, load as Data URL and open cropper
  const handleDocGalleryFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropModalConfig({
        isOpen: true,
        target: activeDocTarget.field,
        title: activeDocTarget.title,
        aspectRatio: activeDocTarget.aspectRatio,
        initialImage: event.target.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove a document field
  const handleRemoveDocField = (field) => {
    setAdmForm(prev => ({ ...prev, [field]: '' }));
    if (field === 'studentPhoto') {
      setImageCompressInfo(null);
    }
  };

  // Save Cropped Image from CameraCaptureCropModal
  const handleDocCropSave = (dataUrl, meta) => {
    if (!cropModalConfig.target) return;
    setAdmForm(prev => ({
      ...prev,
      [cropModalConfig.target]: dataUrl
    }));
    if (cropModalConfig.target === 'studentPhoto') {
      setImageCompressInfo({
        compressedKB: meta.compressedKB,
        savings: 70
      });
    }
    showToast(`${cropModalConfig.title} cropped & attached successfully! (${meta.compressedKB} KB)`);
  };

  // Smart Client-Side Photo Compression Handler (Legacy Fallback)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const res = await compressImage(file, 800, 800, 0.78);
      setAdmForm(prev => ({
        ...prev,
        studentPhoto: res.dataUrl
      }));
      setImageCompressInfo({
        originalKB: res.originalSizeKB,
        compressedKB: res.compressedSizeKB,
        savings: res.savingsPercent
      });
      setCompressing(false);
      showToast(`Student photo compressed by ${res.savingsPercent}% (${res.originalSizeKB}KB ➔ ${res.compressedKB}KB)!`);
    } catch (err) {
      setCompressing(false);
      alert('Error compressing image: ' + err.message);
    }
  };

  // Remove uploaded photo
  const handleRemovePhoto = () => {
    setAdmForm(prev => ({ ...prev, studentPhoto: '' }));
    setImageCompressInfo(null);
  };

  // Handle Admission Submission (Create or Edit)
  const handleCreateAdmissionSubmit = (e) => {
    e.preventDefault();
    if (!admForm.studentName || !admForm.studentPhone || !admForm.seatNumber) {
      alert('Please fill student name, phone number, and select a seat number.');
      return;
    }

    const isEdit = !!editingAdmissionId;
    const url = isEdit 
      ? `${API_BASE_URL}/api/owner/admissions/${editingAdmissionId}` 
      : `${API_BASE_URL}/api/owner/admissions`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      ...admForm,
      admissionDate: admForm.startDate,
      date: admForm.startDate
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAdmissionModalOpen(false);
          setEditingAdmissionId(null);
          fetchOwnerData();
          showToast(isEdit 
            ? `Admission record for ${data.data.studentName} updated successfully!` 
            : `Admission for ${data.data.studentName} on Seat #${data.data.seatNumber} completed!`);
          if (data.receipt) {
            setActiveReceipt(data.receipt);
          }
          if (!isEdit && data.receipt) {
            setReceiptModalOpen(true);
          }
        } else {
          alert(data.message || 'Operation failed');
        }
      })
      .catch(err => alert('Network error while processing admission'));
  };

  // Handle Admission Deletion (Confirm Modal)
  const handleDeleteAdmission = (admission) => {
    setDeleteConfirmModal(admission);
  };

  const confirmDeleteAdmission = () => {
    if (!deleteConfirmModal) return;

    fetch(`${API_BASE_URL}/api/owner/admissions/${deleteConfirmModal.admissionId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          try {
            const cached = localStorage.getItem('bdl_owner_full_backup');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed && Array.isArray(parsed.admissions)) {
                parsed.admissions = parsed.admissions.filter(a => a.admissionId !== deleteConfirmModal.admissionId);
                localStorage.setItem('bdl_owner_full_backup', JSON.stringify(parsed));
              }
            }
          } catch (e) {}
          setDeleteConfirmModal(null);
          fetchOwnerData();
          showToast(data.message || 'Admission deleted and seat vacated.');
        } else {
          alert(data.message || 'Failed to delete admission');
        }
      })
      .catch(err => alert('Network error while deleting admission'));
  };

  // Open Collect Payment Modal
  const handleOpenPayment = (admission) => {
    setSelectedAdmissionForPay(admission);
    setPayForm({
      amount: admission.pendingFee || 0,
      paymentMode: 'Cash',
      transactionRef: `CASH-${Date.now().toString().slice(-4)}`,
      notes: 'Full balance settled'
    });
    setPaymentModalOpen(true);
  };

  // Submit Collect Payment
  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!selectedAdmissionForPay) return;

    fetch(`${API_BASE_URL}/api/owner/admissions/${selectedAdmissionForPay.admissionId}/pay`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentModalOpen(false);
          fetchOwnerData();
          showToast(`Payment of ₹${payForm.amount} received! Receipt generated.`);
          if (data.receipt) {
            setActiveReceipt(data.receipt);
            setReceiptModalOpen(true);
          }
        } else {
          alert(data.message || 'Payment recording failed');
        }
      });
  };

  // Open Renew Modal
  const handleOpenRenew = (admission) => {
    setSelectedAdmissionForRenew(admission);
    const activeFee = studentRenewalFees[admission.admissionId] !== undefined
      ? Number(studentRenewalFees[admission.admissionId])
      : (Number(renewalFee) || 999);

    setRenewForm({
      months: 1,
      feeItems: [
        { description: `Desk #${admission.seatNumber} Renewal Fee (1 Month)`, amount: activeFee }
      ],
      totalFee: activeFee,
      paidAmount: activeFee,
      paymentMode: 'UPI'
    });
    setRenewModalOpen(true);
  };

  // Submit Renewal
  const handleSubmitRenew = (e) => {
    e.preventDefault();
    if (!selectedAdmissionForRenew) return;

    fetch(`${API_BASE_URL}/api/owner/admissions/${selectedAdmissionForRenew.admissionId}/renew`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(renewForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRenewModalOpen(false);
          fetchOwnerData();
          showToast(`Seat #${selectedAdmissionForRenew.seatNumber} renewed for ${renewForm.months} month(s)!`);
          if (data.receipt) {
            setActiveReceipt(data.receipt);
            setReceiptModalOpen(true);
          }
        } else {
          alert(data.message || 'Renewal failed');
        }
      });
  };

  // Vacate Seat
  const handleVacateSeat = (seatNumber) => {
    if (!window.confirm(`Are you sure you want to VACATE Seat #${seatNumber}? This will mark the seat as Available for new students.`)) return;

    fetch(`${API_BASE_URL}/api/owner/seats/${seatNumber}/vacate`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Vacated by Library Owner' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSelectedSeat(null);
          fetchOwnerData();
          showToast(`Seat #${seatNumber} is now vacant and ready for new student.`);
        } else {
          alert(data.message || 'Failed to vacate seat');
        }
      });
  };

  // View Receipt
  const handleViewReceipt = (receiptNum) => {
    fetch(`${API_BASE_URL}/api/owner/receipts/${receiptNum}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveReceipt(data.data);
          setReceiptModalOpen(true);
        } else {
          alert('Receipt not found');
        }
      });
  };

  // Available seats list for dropdown (always sequentially sorted 1..102)
  const availableSeatsList = seats
    .filter(s => s.status === 'Available')
    .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

  // Filtered Seats for Grid View (always sequentially sorted 1..102)
  const filteredGridSeats = seats
    .filter(s => {
      if (gridFilter === 'available') return s.status === 'Available';
      if (gridFilter === 'occupied') return s.status === 'Occupied' || s.status === 'Expired';
      if (gridFilter === 'pending') return s.occupant && (s.occupant.feeStatus === 'Pending' || s.occupant.pendingFee > 0);
      if (gridFilter === 'expiring') return s.occupant && (s.occupant.daysRemaining >= 0 && s.occupant.daysRemaining <= 5);
      return true;
    })
    .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

  // Filtered Admissions for Register View (Always Kram-Wise sorted 1..102 by Seat Number)
  const filteredAdmissions = admissions.filter(adm => {
    const matchesSearch = 
      adm.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adm.studentPhone.includes(searchQuery) ||
      String(adm.seatNumber).includes(searchQuery) ||
      (adm.targetExam && adm.targetExam.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (registerFilter === 'pending') return adm.feeStatus === 'Pending' || adm.pendingFee > 0;
    if (registerFilter === 'paid') return adm.feeStatus === 'Paid' && adm.pendingFee === 0;
    if (registerFilter === 'expiring') return adm.daysRemaining >= 0 && adm.daysRemaining <= 5 && adm.status !== 'Vacated';
    if (registerFilter === 'expired') return adm.status === 'Expired' || adm.daysRemaining < 0;
    return true;
  }).sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

  // Calculate duration dates & separate fee breakdown helper
  const handleDurationChange = (months) => {
    const m = Number(months);
    const startStr = admForm.startDate || new Date().toISOString().split('T')[0];
    const endStr = calculateMembershipEndDate(startStr, m);
    
    // Monthly library pass is ₹850/mo. Deposit is ₹500 (kept separate, refundable)
    const deskMonthlyFee = 850 * m;
    const hasDeposit = (admForm.feeItems || []).some(it => (it.description || '').toLowerCase().includes('deposit'));
    const depositAmount = hasDeposit ? 500 : 0;
    const fee = deskMonthlyFee + depositAmount;

    const deskDesc = `Dedicated Study Desk #${admForm.seatNumber || ''} & Facility Pass (${m} Month${m > 1 ? 's' : ''})`;
    const updatedFeeItems = [
      { description: deskDesc, amount: deskMonthlyFee },
      ...(hasDeposit ? [{ description: 'Security Deposit (Refundable)', amount: depositAmount }] : [])
    ];

    setAdmForm(prev => ({
      ...prev,
      durationMonths: m,
      endDate: endStr,
      feeItems: updatedFeeItems,
      totalFee: fee,
      paidAmount: fee
    }));
  };

  // Total Security Deposits KPI metric (across all active students)
  const totalSecurityDeposits = useMemo(() => {
    let manualOverrides = {};
    try {
      const saved = localStorage.getItem('bdl_register_overrides');
      if (saved) manualOverrides = JSON.parse(saved);
    } catch (e) {}

    const activeAdms = admissions.filter(a => a.status !== 'Vacated');
    return activeAdms.reduce((sum, adm) => {
      const overrideKey = `${adm.seatNumber}_deposit`;
      if (manualOverrides[overrideKey] === false) return sum;
      if (manualOverrides[overrideKey] === true) return sum + (Number(adm.deposit) || 500);

      if (adm.deposit && Number(adm.deposit) > 0) return sum + Number(adm.deposit);
      if (adm.securityDeposit && Number(adm.securityDeposit) > 0) return sum + Number(adm.securityDeposit);
      if (Array.isArray(adm.feeItems)) {
        const depItem = adm.feeItems.find(it => (it.description || '').toLowerCase().includes('deposit'));
        if (depItem && Number(depItem.amount) > 0) return sum + Number(depItem.amount);
      }
      if (adm.depositPaid) return sum + 500;
      return sum;
    }, 0);
  }, [admissions]);

  // If Locked by Passkey Gate
  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border border-purple-200">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-purple-50 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
              OWNER EXCLUSIVE ACCESS
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">Library Management Desk</h2>
            <p className="text-xs text-slate-500 mt-1">
              This terminal controls all 102 seat allocations, student admissions, fee registers, and receipt prints.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Owner Passkey / PIN</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  value={masterPin}
                  onChange={(e) => setMasterPin(e.target.value)}
                  placeholder="Enter 4-digit Master PIN..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono tracking-widest text-center"
                  autoFocus
                />
              </div>
              {pinError && <p className="text-xs text-rose-600 font-medium mt-1.5">{pinError}</p>}
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer"
            >
              Unlock Owner Suite
            </button>

            <button 
              type="button"
              onClick={() => { setMasterPin('2026'); setIsUnlocked(true); }}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              1-Click Demo Director Unlock (PIN: 2026)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Owner VIP Console */}
      <div className="bg-white border border-slate-200/80 p-4 sm:p-8 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 text-[11px] text-purple-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Authorized Management Desk • Brain Dock Library</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            102-Seat Admission & Fee Collection Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time control of all 102 library seats, student admission records, pending fee alerts, validity expiration tracking, and official fee receipts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => handleOpenAdmit(null)}
            className="flex-1 md:flex-none bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission</span>
          </button>

          <button 
            onClick={fetchOwnerData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link 
            to="/content?tab=stats"
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-xl border border-purple-200 transition-colors flex items-center space-x-1.5 shadow-xs"
            title="Homepage Stats Banner (Show/Hide & Edit Numbers)"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Homepage Stats</span>
          </Link>

          {/* 1-Click Database Backup */}
          <button 
            onClick={handleDownloadBackup}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Download Full Database Backup to your laptop (JSON)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Backup Data</span>
          </button>

          {/* 1-Click Database Restore */}
          <label 
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200 transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Restore Database from a downloaded backup JSON file"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Restore Data</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleRestoreBackupFile} 
              className="hidden" 
            />
          </label>

          {/* Google Drive Automatic Cloud Backup */}
          <button 
            onClick={handleOpenDriveModal}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-xl border border-amber-300 transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Google Drive Cloud Backups (Auto-Sync & Manual Push)"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>

          {/* Change Login Password & Security PIN */}
          <button 
            onClick={() => setSecurityModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Change Login Password & Director Passkey PIN"
          >
            <Key className="w-3.5 h-3.5 text-indigo-700" />
            <span className="hidden sm:inline">Change Password / PIN</span>
          </button>

          <button 
            onClick={() => setIsUnlocked(false)}
            className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Lock Desk"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 High-Impact Operational KPI Metrics (Including Security Deposits) */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Seats</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">102 Seats</h3>
          <span className="text-[11px] font-medium text-purple-700">100% Capacity Map</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Occupied / Booked</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.occupiedSeats} Seats</h3>
          <span className="text-[11px] font-medium text-emerald-600">{stats.occupancyRate}% Occupancy</span>
        </div>

        <div className="bg-white border border-emerald-100 p-5 rounded-2xl shadow-xs bg-emerald-50/20">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Available Desks</span>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.availableSeats} Seats</h3>
          <button 
            onClick={() => { setActiveTab('grid'); setGridFilter('available'); }}
            className="text-[10px] text-emerald-600 font-semibold hover:underline"
          >
            Click to allocate →
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Fees Collected</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalFeeCollected?.toLocaleString()}</h3>
          <span className="text-[11px] font-medium text-emerald-600">Reconciled in bank</span>
        </div>

        <div className="bg-white border border-purple-200/90 p-5 rounded-2xl shadow-xs bg-purple-50/20">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">Total Deposits</span>
          <h3 className="text-2xl font-bold text-purple-950 mt-1">₹{totalSecurityDeposits?.toLocaleString()}</h3>
          <span className="text-[11px] font-medium text-purple-600">Refundable balance</span>
        </div>

        <div className={`p-5 rounded-2xl shadow-xs transition-all ${stats.totalFeePending > 0 ? 'bg-amber-50/40 border border-amber-200' : 'bg-white border border-slate-200/80'}`}>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Pending Dues</span>
          <h3 className="text-2xl font-bold text-amber-700 mt-1">₹{stats.totalFeePending?.toLocaleString()}</h3>
          <button 
            onClick={() => { setActiveTab('register'); setRegisterFilter('pending'); }}
            className="text-[10px] text-amber-700 font-semibold hover:underline"
          >
            {stats.pendingCount} Students Pending →
          </button>
        </div>

        <div className={`p-5 rounded-2xl shadow-xs transition-all ${stats.expiringSoonCount > 0 ? 'bg-rose-50/40 border border-rose-200' : 'bg-white border border-slate-200/80'}`}>
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Expiring Soon (≤5 Days)</span>
          <h3 className="text-2xl font-bold text-rose-700 mt-1">{stats.expiringSoonCount} Expiring</h3>
          <button 
            onClick={() => { setActiveTab('register'); setRegisterFilter('expiring'); }}
            className="text-[10px] text-rose-600 font-semibold hover:underline"
          >
            Review for renewal →
          </button>
        </div>

      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl text-xs font-semibold shadow-xs w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'grid' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🪑 102-Seat Floor Matrix
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'register' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Admissions ({admissions.length})
          </button>
          <button 
            onClick={() => setActiveTab('monthly-register')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'monthly-register' ? 'bg-[#5B1484] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📊 Master Monthly Register</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'monthly-register' ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800'
            }`}>
              1-102
            </span>
          </button>
          <button 
            onClick={() => { setActiveTab('expiries'); fetchExpiryReminders(); }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'expiries' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>⏰ 3-Day Expiry Watch</span>
            {expiryReminders.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'expiries' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {expiryReminders.length}
              </span>
            )}
          </button>
        </div>

        {/* Legend for Visual Comfort */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
            <span>Available</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-800"></span>
            <span>Occupied (Paid)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500"></span>
            <span>Fee Pending</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500"></span>
            <span>Expiring / Expired</span>
          </span>
        </div>
      </div>

      {/* ================= TAB 1: 102-SEAT FLOOR MATRIX ================= */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          
          {/* Grid Quick Filter Toolbar */}
          <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600">Filter Seats:</span>
              {[
                { id: 'all', label: `All 102 Seats` },
                { id: 'available', label: `Available (${stats.availableSeats})` },
                { id: 'occupied', label: `Occupied (${stats.occupiedSeats})` },
                { id: 'pending', label: `Fee Pending (${stats.pendingCount})` },
                { id: 'expiring', label: `Expiring Soon (${stats.expiringSoonCount})` }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setGridFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    gridFilter === f.id ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Showing {filteredGridSeats.length} of 102 Seats
            </div>
          </div>

          {/* All 102 Premium Desks Grid */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700"></span>
                <h3 className="font-bold text-slate-900 text-sm">All 102 Premium Study Desks</h3>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-md border border-purple-200">
                  ALL 102 SEATS PREMIUM
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Seats 01 - 102 • Click Open Seat to Admit Student
              </span>
            </div>

            {/* 102-Seat Visual Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2.5">
              {filteredGridSeats.map(seat => {
                    const isAvail = seat.status === 'Available';
                    const isMaint = seat.status === 'Maintenance';
                    const occ = seat.occupant;
                    const hasPendingFee = occ && (occ.feeStatus === 'Pending' || occ.pendingFee > 0);
                    const isExpiring = occ && occ.daysRemaining >= 0 && occ.daysRemaining <= 5;
                    const isExpired = occ && occ.daysRemaining < 0;

                    let cardBg = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-purple-300';
                    let statusPill = 'bg-slate-100 text-slate-600';

                    if (isAvail) {
                      cardBg = 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-50 hover:border-emerald-400';
                      statusPill = 'bg-emerald-100 text-emerald-800';
                    } else if (isMaint) {
                      cardBg = 'bg-slate-100/70 border-dashed border-slate-300 text-slate-500 cursor-not-allowed';
                      statusPill = 'bg-slate-200 text-slate-600';
                    } else if (hasPendingFee) {
                      cardBg = 'bg-amber-50/60 border-amber-300 text-amber-900 hover:border-amber-400';
                      statusPill = 'bg-amber-100 text-amber-900';
                    } else if (isExpiring || isExpired) {
                      cardBg = 'bg-rose-50/60 border-rose-300 text-rose-900 hover:border-rose-400';
                      statusPill = 'bg-rose-100 text-rose-900';
                    } else {
                      cardBg = 'bg-slate-900 border-slate-800 text-white hover:border-purple-400';
                      statusPill = 'bg-slate-800 text-purple-300';
                    }

                    return (
                      <div
                        key={seat.seatNumber}
                        onClick={() => {
                          if (isAvail) {
                            handleOpenAdmit(seat.seatNumber);
                          } else if (occ) {
                            setSelectedSeat(seat);
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-xs min-h-[92px] ${cardBg}`}
                      >
                        {/* Seat Number Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold tracking-wider">
                            #{String(seat.seatNumber).padStart(2, '0')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusPill}`}>
                            {isAvail ? 'OPEN' : isMaint ? 'MAINT' : hasPendingFee ? `DUE` : isExpiring ? `${occ?.daysRemaining}d` : isExpired ? 'EXP' : 'PAID'}
                          </span>
                        </div>

                        {/* Occupant Info */}
                        {isAvail ? (
                          <div className="my-auto text-center py-1">
                            <span className="text-[10px] font-semibold text-emerald-700 block">+ Click to Admit</span>
                          </div>
                        ) : isMaint || !occ ? (
                          <div className="my-auto text-center py-1">
                            <span className="text-[10px] font-medium text-slate-500 block">Maintenance</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5 mt-1">
                            <p className="text-[11px] font-bold truncate leading-tight">
                              {occ?.studentName || 'Student'}
                            </p>
                            <p className={`text-[9px] font-mono truncate ${seat.status === 'Occupied' && !hasPendingFee && !isExpiring ? 'text-slate-400' : 'text-slate-500'}`}>
                              {occ?.targetExam || occ?.shift || 'Member'}
                            </p>
                            <div className="flex items-center justify-between text-[9px] font-mono pt-1">
                              <span>Till: {occ?.endDate ? occ.endDate.slice(5) : '-'}</span>
                              {hasPendingFee && <span className="font-bold text-amber-700">₹{occ?.pendingFee}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

      {/* ================= TAB 2: ADMISSIONS & FEES REGISTER (TABLE) ================= */}
      {activeTab === 'register' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden space-y-4">
          
          {/* Table Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, phone, seat #, exam..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto text-xs font-semibold">
              <span className="text-slate-500 shrink-0">Filter:</span>
              {[
                { id: 'all', label: `All (${admissions.length})` },
                { id: 'pending', label: `Pending Fee (${admissions.filter(a => a.pendingFee > 0).length})` },
                { id: 'expiring', label: `Expiring Soon (${stats.expiringSoonCount})` },
                { id: 'paid', label: `Fully Paid (${admissions.filter(a => a.pendingFee === 0).length})` },
                { id: 'expired', label: `Expired (${stats.expiredCount})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRegisterFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    registerFilter === f.id ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Seat #</th>
                  <th className="p-4">Student & Contact</th>
                  <th className="p-4">Exam / Course</th>
                  <th className="p-4">Shift & Timing</th>
                  <th className="p-4">Validity Range</th>
                  <th className="p-4">Days Left</th>
                  <th className="p-4">Fees (Paid / Total)</th>
                  <th className="p-4">Fee Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-400">
                      No student records found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map(adm => {
                    const isPending = adm.pendingFee > 0;
                    const isExpiring = adm.daysRemaining >= 0 && adm.daysRemaining <= 5;
                    const isExpired = adm.daysRemaining < 0;

                    return (
                      <tr key={adm.admissionId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-extrabold border border-purple-200">
                            Seat #{adm.seatNumber}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {adm.studentPhoto ? (
                              <img 
                                src={adm.studentPhoto} 
                                alt={adm.studentName} 
                                className="w-10 h-10 rounded-xl object-cover border-2 border-purple-200 shadow-2xs shrink-0" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                                {adm.studentName ? adm.studentName.slice(0, 2).toUpperCase() : 'BD'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{adm.studentName}</p>
                              {adm.parentsName && (
                                <p className="text-[10px] text-slate-500">C/O {adm.parentsName}</p>
                              )}
                              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <a href={`https://wa.me/${(adm.studentPhone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-purple-700">
                                  {adm.studentPhone}
                                </a>
                              </div>
                              {adm.aadhaarNo && (
                                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                                  UID: <span className="font-semibold text-slate-700">{formatAadhaarNumber(adm.aadhaarNo)}</span>
                                </p>
                              )}
                              <div className="flex items-center space-x-1.5 mt-1">
                                {adm.aadhaarFront && (
                                  <button
                                    type="button"
                                    onClick={() => setDocumentLightbox({ title: `${adm.studentName} - Aadhaar Front`, url: adm.aadhaarFront })}
                                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[9px] font-bold border border-blue-200 flex items-center space-x-0.5 cursor-pointer"
                                    title="View Aadhaar Front"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>Front</span>
                                  </button>
                                )}
                                {adm.aadhaarBack && (
                                  <button
                                    type="button"
                                    onClick={() => setDocumentLightbox({ title: `${adm.studentName} - Aadhaar Back`, url: adm.aadhaarBack })}
                                    className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[9px] font-bold border border-emerald-200 flex items-center space-x-0.5 cursor-pointer"
                                    title="View Aadhaar Back"
                                  >
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>Back</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-medium text-slate-700">
                          <p>{adm.targetExam || adm.course || 'General Reading'}</p>
                          {adm.qualification && (
                            <span className="text-[10px] text-slate-400">{adm.qualification}</span>
                          )}
                        </td>

                        <td className="p-4 text-[11px] text-slate-600 font-medium">
                          <span className="block font-semibold text-slate-800">{adm.shift}</span>
                          {adm.lockerNumber && (
                            <span className="text-[10px] text-purple-700 font-mono font-bold">Locker: {adm.lockerNumber}</span>
                          )}
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          <span className="text-slate-500 block">From: {adm.startDate}</span>
                          <span className="font-bold text-slate-900">Till: {adm.endDate}</span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isExpired 
                              ? 'bg-rose-100 text-rose-800' 
                              : isExpiring 
                              ? 'bg-amber-100 text-amber-900' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isExpired ? 'Expired' : `${adm.daysRemaining} Days`}
                          </span>
                        </td>

                        <td className="p-4 font-mono">
                          <span className="font-bold text-slate-900">₹{adm.paidAmount}</span>
                          <span className="text-slate-400"> / ₹{adm.totalFee}</span>
                          {(() => {
                            const dep = (adm.deposit && Number(adm.deposit) > 0)
                              ? Number(adm.deposit)
                              : (adm.feeItems?.find(it => (it.description || '').toLowerCase().includes('deposit'))?.amount || (Number(adm.totalFee) === 1350 ? 500 : 0));
                            const desk = (Number(adm.totalFee) || 0) - dep;
                            if (dep > 0) {
                              return (
                                <span className="block text-[9.5px] text-purple-700 font-sans font-semibold mt-0.5 leading-tight">
                                  Fee: ₹{desk > 0 ? desk : adm.totalFee} + Dep: ₹{dep}
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {isPending && (
                            <span className="block text-[10px] font-bold text-amber-700">
                              Due: ₹{adm.pendingFee}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPending 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isPending ? 'PENDING' : 'PAID'}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Edit Form Button */}
                          <button
                            onClick={() => handleOpenEditAdmission(adm)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors inline-flex items-center space-x-1"
                            title="Edit Admission Details"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleOpenPayment(adm)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition-colors"
                              title="Collect Pending Fee"
                            >
                              Collect Due
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenRenew(adm)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 transition-colors"
                            title="Renew Membership"
                          >
                            Renew
                          </button>

                          <button
                            onClick={() => handleViewReceipt(adm.receiptNumber)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors inline-flex items-center space-x-1"
                            title="View / Print Receipt"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            <span>Receipt</span>
                          </button>

                          {/* Delete Form Button */}
                          <button
                            onClick={() => handleDeleteAdmission(adm)}
                            className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition-colors inline-flex items-center space-x-1"
                            title="Delete Admission Record"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 3-DAY MEMBERSHIP EXPIRY WATCH & DAILY WHATSAPP NOTIFICATIONS ================= */}
      {activeTab === 'expiries' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header & Automated Notification Policy Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
                    <CalendarClock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      3-Day Membership Expiry Watch (Automated Protocol)
                    </h3>
                    <p className="text-xs text-amber-900 font-semibold">
                      Automated Protocol: 1 reminder per day during final 3 days • Automatically stops upon renewal
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  💡 <strong>Rule Engine:</strong> Students whose membership expires within 3 days (or has already expired) are automatically tracked here. You can dispatch a personalized WhatsApp renewal notice each morning. As soon as the student renews their desk, they are automatically cleared from this list.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSendAllDueReminders}
                  disabled={expiryReminders.filter(e => !e.alreadySentToday).length === 0}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send All Due Reminders Today ({expiryReminders.filter(e => !e.alreadySentToday).length})</span>
                </button>

                <button
                  onClick={fetchExpiryReminders}
                  className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${expiryLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Expiries</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Renewal Notice Offer & Price Setting Bar */}
            <div className="mt-5 bg-white/95 backdrop-blur-sm border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>WhatsApp Notice Renewal Amount (Offer / Price Control)</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        Live in Message
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Jab bhi offer me fees ghatti ya badhti hai, yahan amount set karein. WhatsApp reminder message me yahi renewal amount jayega.
                    </p>
                  </div>
                </div>

                {/* Live Message Preview Chip */}
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notice will say:</span>
                  <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    💰 Renewal Plan: ₹{renewalFee} / Month{offerNote ? ` (${offerNote})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
                {/* Active Fee Input */}
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 text-slate-700 font-bold px-3 py-2 rounded-l-xl text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={renewalFee}
                    onChange={(e) => handleRenewalFeeChange(Number(e.target.value), offerNote)}
                    placeholder="999"
                    className="w-28 p-2 rounded-r-xl bg-white border border-slate-300 text-slate-900 font-black text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    title="Active renewal fee for WhatsApp notice"
                  />
                </div>

                {/* Quick Preset Offer Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Offers:</span>
                  {[
                    { label: '₹849 (Offer)', fee: 849, note: 'Special Offer' },
                    { label: '₹999 (Regular)', fee: 999, note: '' },
                    { label: '₹1,200', fee: 1200, note: '' },
                    { label: '₹1,500', fee: 1500, note: '' }
                  ].map((preset) => (
                    <button
                      key={preset.fee}
                      type="button"
                      onClick={() => handleRenewalFeeChange(preset.fee, preset.note)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        Number(renewalFee) === preset.fee
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Optional Offer Tag / Note Input */}
                <div className="flex items-center">
                  <input
                    type="text"
                    value={offerNote}
                    onChange={(e) => {
                      const note = e.target.value;
                      setOfferNote(note);
                      try { localStorage.setItem('bdl_renewal_note', note); } catch (err) {}
                    }}
                    placeholder="Offer note (e.g. Special Offer)"
                    className="p-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-medium w-48 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    title="Optional note added next to renewal plan, e.g. Special Offer"
                  />
                </div>

                {/* Save as Default Button */}
                <button
                  type="button"
                  onClick={handleSaveRenewalSettings}
                  disabled={savingRenewalSettings}
                  className="ml-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Save current fee & offer note permanently to database"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{savingRenewalSettings ? 'Saving...' : 'Save Default'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-amber-200/80">
              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Expiring in ≤3 Days</span>
                <span className="text-2xl font-black text-amber-700 mt-0.5 block">{expiryReminders.length} Students</span>
                <span className="text-[10px] text-slate-500">Seat retention priority list</span>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Due For Reminder Today</span>
                <span className="text-2xl font-black text-rose-700 mt-0.5 block">
                  {expiryReminders.filter(e => !e.alreadySentToday).length} Students
                </span>
                <span className="text-[10px] text-rose-600 font-semibold">Today's message pending</span>
              </div>
              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Already Sent Today</span>
                <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
                  {expiryReminders.filter(e => e.alreadySentToday).length} Students
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Protected from duplicate spam</span>
              </div>
            </div>
          </div>

          {/* ================= TAREEEQA 3: WHATSAPP WEB QR AUTOMATION BOT ENGINE ================= */}
          <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            
            {/* Background glowing accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Bot Identity & Status */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-3">
                  <span className={`p-2.5 rounded-2xl ${botStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-purple-600 text-white'} shadow-md`}>
                    <Bot className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-lg font-black tracking-tight text-white">
                        WhatsApp Web Auto-Bot (100% Free Self-Hosted)
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        botStatus === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : botStatus === 'qr_ready'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {botStatus === 'connected' ? '🟢 Online & Linked' : botStatus === 'qr_ready' ? '🟡 Scan QR Code' : '⚪ Standby / Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/80 font-medium">
                      Bina kisi manual click ke, library ke phone se roz subah automatic reminder bhejne wala engine.
                    </p>
                  </div>
                </div>

                <div className="pt-1 text-xs text-slate-300 space-y-1">
                  {botStatus === 'connected' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center space-x-1.5 text-emerald-300 font-semibold bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/80">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Linked Device: {botInfo.connectedNumber || 'Library WhatsApp Phone'}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1.5 text-purple-300 font-semibold bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-800/80">
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Daily Auto-Dispatch: {schedulerSettings.autoDispatchEnabled ? `ON at ${schedulerSettings.dispatchTimeString}` : 'OFF'}</span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-400 leading-relaxed">
                      💡 <strong>Setup Step:</strong> Neeche diye gaye <strong>"Link Library WhatsApp (Scan QR)"</strong> button par click karein aur library ke phone se QR code scan karein. Ek baar scan hote hi bot roz subah expiry messages automatic bhej dega.
                    </p>
                  )}
                </div>
              </div>

              {/* Bot Control Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {botStatus === 'connected' ? (
                  <>
                    <button
                      onClick={handleTriggerDispatchNow}
                      disabled={dispatchingNow}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                      title="Send WhatsApp renewal notice to all due students right now via Bot"
                    >
                      <Zap className={`w-3.5 h-3.5 ${dispatchingNow ? 'animate-bounce' : ''}`} />
                      <span>{dispatchingNow ? 'Sending Batch...' : '⚡ Run Auto-Dispatch Now'}</span>
                    </button>

                    <button
                      onClick={() => setTestModalOpen(true)}
                      className="py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Send a sample WhatsApp message to verify connection"
                    >
                      <Send className="w-3.5 h-3.5 text-purple-300" />
                      <span>Test Message</span>
                    </button>

                    <button
                      onClick={handleDisconnectBot}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Unlink library WhatsApp phone"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Unlink</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectBot}
                    disabled={connectingBot}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
                  >
                    <QrCode className={`w-4 h-4 ${connectingBot ? 'animate-spin' : ''}`} />
                    <span>{connectingBot ? 'Generating QR Code...' : '📲 Link Library WhatsApp (Scan QR)'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Bottom Row: Scheduler Settings Inline Bar */}
            <div className="mt-5 pt-4 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Auto Dispatch Toggle */}
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={schedulerSettings.autoDispatchEnabled}
                    onChange={(e) => handleSaveSchedulerSettings({ ...schedulerSettings, autoDispatchEnabled: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                  <span className="font-bold text-white">Daily Automatic Dispatch Active</span>
                </label>

                {/* Dispatch Time Selector */}
                <div className="flex items-center space-x-2 bg-slate-950/60 border border-purple-500/30 px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-300 text-[11px] font-semibold">Scheduled Time:</span>
                  <input
                    type="time"
                    value={schedulerSettings.dispatchTimeString || '09:30'}
                    onChange={(e) => handleSaveSchedulerSettings({ ...schedulerSettings, dispatchTimeString: e.target.value })}
                    className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                  />
                </div>

                {/* Anti-spam delay indicator */}
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  🛡️ Smart Throttle: 4-sec gap between messages to prevent spam detection
                </span>
              </div>

              {botStatus === 'connected' && (
                <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Engine Running 24/7 on Server</span>
                </div>
              )}
            </div>

          </div>

          {/* Students List Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Upcoming Expiry Cohort</h4>
                <p className="text-xs text-slate-500">Students whose validity ends within 72 hours</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {expiryReminders.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Seat / Desk #</th>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Mobile (+91)</th>
                    <th className="py-3.5 px-4">Valid Till (Expiry)</th>
                    <th className="py-3.5 px-4">Days Left</th>
                    <th className="py-3.5 px-4">Today's Status</th>
                    <th className="py-3.5 px-4 text-center">Renewal Fee (₹)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {expiryReminders.length > 0 ? (
                    expiryReminders.map((item) => (
                      <tr key={item.admissionId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Seat Number */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-black text-sm text-purple-900 bg-purple-100/70 px-2.5 py-1 rounded-lg border border-purple-200">
                            SEAT #{item.seatNumber}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                              {item.studentName ? item.studentName[0] : 'S'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.studentName}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{item.admissionId} • {item.shift}</span>
                            </div>
                          </div>
                        </td>

                        {/* Mobile Phone */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          <a 
                            href={`https://wa.me/${item.fullPhone}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.studentPhone}</span>
                          </a>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {item.endDate}
                        </td>

                        {/* Days Remaining Badge */}
                        <td className="py-3.5 px-4">
                          {item.daysRemaining < 0 ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                              Expired ({Math.abs(item.daysRemaining)}d ago)
                            </span>
                          ) : item.daysRemaining === 0 ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                              Expires Today!
                            </span>
                          ) : item.daysRemaining === 1 ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300">
                              1 Day Left
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                              {item.daysRemaining} Days Left
                            </span>
                          )}
                        </td>

                        {/* Today's Notification Status */}
                        <td className="py-3.5 px-4">
                          {item.alreadySentToday ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sent Today (1 msg limit)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                              <span>Due Today</span>
                            </span>
                          )}
                        </td>

                        {/* Customizable Renewal Fee per Student */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center shadow-2xs">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-300 px-2 py-1.5 rounded-l-xl">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={
                                studentRenewalFees[item.admissionId] !== undefined
                                  ? studentRenewalFees[item.admissionId]
                                  : (item.renewalFee || renewalFee)
                              }
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setStudentRenewalFees(prev => ({
                                  ...prev,
                                  [item.admissionId]: val
                                }));
                              }}
                              className="w-20 p-1.5 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              title="Customize renewal fee for this student in WhatsApp reminder"
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Preview Message Button */}
                            <button
                              onClick={() => setPreviewMessageItem(item)}
                              className="py-1.5 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Preview exact WhatsApp message text that goes to this student"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>

                            {/* WhatsApp Button */}
                            <button
                              onClick={() => handleSendSingleReminder(item)}
                              disabled={sendingReminderId === item.admissionId}
                              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs ${
                                item.alreadySentToday
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                              }`}
                              title="Send WhatsApp renewal reminder to student"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{item.alreadySentToday ? 'Re-send' : 'WhatsApp'}</span>
                            </button>

                            {/* Renew Button (Upon renewal, disappears instantly) */}
                            <button
                              onClick={() => {
                                const adm = admissions.find(a => a.admissionId === item.admissionId);
                                if (adm) handleOpenRenew(adm);
                              }}
                              className="py-1.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-2xs"
                              title="Renew seat membership (will clear from expiry list immediately)"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Renew</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">All Memberships Active & Healthy!</p>
                          <p className="text-xs text-slate-500">
                            Koi bhi student ki membership agle 3 din me expire nahi ho rahi hai. Jaise hi kisi student ke 3 din bachenge, wo yahan automatic reflect ho jayega.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 5: 102-DESK MASTER MONTHLY REGISTER & PRINT ENGINE ================= */}
      {activeTab === 'monthly-register' && (
        <MasterMonthlyRegister 
          seats={seats}
          admissions={admissions}
          onOpenAddStudent={(seatNum) => handleOpenAdmit(seatNum)}
          onOpenEditStudent={(adm) => handleOpenEditAdmission(adm)}
          onRefreshData={fetchOwnerData}
          onOpenRenew={(adm) => handleOpenRenew(adm)}
        />
      )}

      {/* ================= MODAL 1: OCCUPIED SEAT INSPECTOR ================= */}
      {selectedSeat && selectedSeat.occupant && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSeat(null); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-slate-800 space-y-6 shadow-2xl relative my-3 sm:my-8">
            <button 
              onClick={() => setSelectedSeat(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Seat & Student Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-lg font-mono font-extrabold text-sm border border-purple-200">
                  SEAT #{selectedSeat.seatNumber} ({selectedSeat.zone})
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedSeat.occupant.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Admission ID: {selectedSeat.occupant.admissionId}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedSeat.occupant.feeStatus === 'Pending' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {selectedSeat.occupant.feeStatus === 'Pending' ? 'FEE PENDING' : 'FEES PAID'}
              </span>
            </div>

            {/* Student Full Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Contact Phone:</span>
                <a href={`https://wa.me/${selectedSeat.occupant.studentPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-bold text-purple-700 hover:underline">
                  {selectedSeat.occupant.studentPhone} (WhatsApp)
                </a>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Exam / Course:</span>
                <span className="font-bold text-slate-800">{selectedSeat.occupant.targetExam}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Shift / Timing:</span>
                <span className="font-bold text-slate-800">{selectedSeat.occupant.shift}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Validity Period:</span>
                <span className="font-bold text-slate-900">{selectedSeat.occupant.startDate} to {selectedSeat.occupant.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Days Remaining:</span>
                <span className={`font-bold font-mono ${selectedSeat.occupant.daysRemaining <= 5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {selectedSeat.occupant.daysRemaining} Days Left
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Pending Dues:</span>
                <span className={`font-bold font-mono ${selectedSeat.occupant.pendingFee > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  ₹{selectedSeat.occupant.pendingFee || 0}
                </span>
              </div>
              <div className="col-span-2 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-900 block">Biometric Machine Enrollment PIN</span>
                  <span className="text-[10px] text-emerald-700">Enter this PIN in machine Add User menu to enroll fingerprint:</span>
                </div>
                <span className="font-mono font-extrabold text-xs text-white bg-emerald-600 px-2.5 py-1 rounded-lg">
                  PIN #{selectedSeat.occupant.biometricEnrollmentId || selectedSeat.seatNumber}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const adm = admissions.find(a => a.admissionId === selectedSeat.occupant.admissionId);
                  if (adm) handleViewReceipt(adm.receiptNumber);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/owner/sync-student-to-device`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        pin: selectedSeat.seatNumber,
                        name: selectedSeat.occupant.studentName
                      })
                    });
                    const d = await res.json();
                    showToast(d.message);
                  } catch (e) {
                    showToast('Failed to sync student to machine');
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                title="Send Student ID and Name directly to TimeWatch Bio-1SE machine"
              >
                <Fingerprint className="w-4 h-4 text-purple-700" />
                <span>Sync to Biometric Machine</span>
              </button>

              <button
                onClick={() => handleRunSimulatedPunch(selectedSeat.seatNumber, 'Fingerprint')}
                disabled={simulatingPunch}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                title="Trigger attendance punch for this student"
              >
                <Fingerprint className="w-4 h-4 text-emerald-700" />
                <span>{simulatingPunch ? 'Punching...' : 'Punch Attendance (IN / OUT)'}</span>
              </button>

              {selectedSeat.occupant.pendingFee > 0 ? (
                <button
                  onClick={() => {
                    const adm = admissions.find(a => a.admissionId === selectedSeat.occupant.admissionId);
                    if (adm) {
                      setSelectedSeat(null);
                      handleOpenPayment(adm);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Collect ₹{selectedSeat.occupant.pendingFee} Due</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const adm = admissions.find(a => a.admissionId === selectedSeat.occupant.admissionId);
                    if (adm) {
                      setSelectedSeat(null);
                      handleOpenRenew(adm);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Renew Membership</span>
                </button>
              )}

              <button
                onClick={() => handleVacateSeat(selectedSeat.seatNumber)}
                className="col-span-2 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors"
              >
                Vacate Seat #{selectedSeat.seatNumber}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: COMPREHENSIVE ADMISSION FORM (SECTIONS 01 TO 05) ================= */}
      {admissionModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) { setAdmissionModalOpen(false); setEditingAdmissionId(null); } }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-slate-800 space-y-6 shadow-2xl relative my-2 sm:my-6">
            
            {/* Header Banner - Sticky at Top */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md pb-4 pt-1 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-100 text-purple-900 px-3 py-1 rounded-md border border-purple-200">
                    {editingAdmissionId ? 'EDIT ADMISSION RECORD' : 'OFFICIAL LIBRARY ADMISSION FORM'}
                  </span>
                  {admForm.seatNumber && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                      Seat #{admForm.seatNumber}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  {editingAdmissionId ? 'Edit Student Admission Form' : 'Library Admission Form'}
                </h2>
                <p className="text-xs text-purple-700 font-medium italic mt-0.5">
                  "Smart Dock for Smarter Minds" • Brain Dock Library
                </p>
              </div>

              <button 
                type="button"
                onClick={() => { setAdmissionModalOpen(false); setEditingAdmissionId(null); }}
                className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-300 transition-colors cursor-pointer shrink-0 ml-3 flex items-center space-x-1 font-bold text-xs"
                title="Close Form (ESC)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAdmissionSubmit} className="space-y-6 text-xs">
              
              {/* ================= 01 PERSONAL DETAILS ================= */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 pb-1 border-b border-purple-100">
                  <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    01
                  </span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Personal Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={admForm.studentName}
                      onChange={(e) => setAdmForm({ ...admForm, studentName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Father's / Mother's Name</label>
                    <input 
                      type="text" 
                      value={admForm.parentsName}
                      onChange={(e) => setAdmForm({ ...admForm, parentsName: e.target.value })}
                      placeholder="Parent / Guardian Name"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                    <input 
                      type="date" 
                      value={admForm.dob}
                      onChange={(e) => setAdmForm({ ...admForm, dob: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                    <div className="flex items-center space-x-4 pt-2">
                      {['Male', 'Female', 'Other'].map(g => (
                        <label key={g} className="inline-flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700">
                          <input 
                            type="radio" 
                            name="gender" 
                            value={g} 
                            checked={admForm.gender === g} 
                            onChange={(e) => setAdmForm({ ...admForm, gender: e.target.value })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      value={admForm.studentPhone}
                      onChange={(e) => setAdmForm({ ...admForm, studentPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={admForm.whatsAppNumber}
                      onChange={(e) => setAdmForm({ ...admForm, whatsAppNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={admForm.studentEmail}
                      onChange={(e) => setAdmForm({ ...admForm, studentEmail: e.target.value })}
                      placeholder="student@gmail.com"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Residential Address</label>
                    <input 
                      type="text" 
                      value={admForm.address}
                      onChange={(e) => setAdmForm({ ...admForm, address: e.target.value })}
                      placeholder="House No., Street, Area"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">City</label>
                      <input 
                        type="text" 
                        value={admForm.city}
                        onChange={(e) => setAdmForm({ ...admForm, city: e.target.value })}
                        placeholder="Amreli"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        value={admForm.pinCode}
                        onChange={(e) => setAdmForm({ ...admForm, pinCode: e.target.value })}
                        placeholder="365601"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= 02 EDUCATION / PROFESSIONAL DETAILS ================= */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 pb-1 border-b border-purple-100">
                  <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    02
                  </span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Education / Professional Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Qualification</label>
                    <input 
                      type="text" 
                      value={admForm.qualification}
                      onChange={(e) => setAdmForm({ ...admForm, qualification: e.target.value })}
                      placeholder="e.g. 12th Pass, B.Tech, B.Com, MBBS, Graduate"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">College / School / University</label>
                    <input 
                      type="text" 
                      value={admForm.institution}
                      onChange={(e) => setAdmForm({ ...admForm, institution: e.target.value })}
                      placeholder="e.g. College / University / School"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Course / Stream</label>
                    <input 
                      type="text" 
                      value={admForm.course}
                      onChange={(e) => setAdmForm({ ...admForm, course: e.target.value })}
                      placeholder="e.g. Engineering, Commerce, Arts"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Year / Semester</label>
                    <input 
                      type="text" 
                      value={admForm.yearSemester}
                      onChange={(e) => setAdmForm({ ...admForm, yearSemester: e.target.value })}
                      placeholder="e.g. Final Year / Sem 6"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Occupation / Target Exam</label>
                    <input 
                      type="text" 
                      value={admForm.targetExam}
                      onChange={(e) => setAdmForm({ ...admForm, targetExam: e.target.value, occupation: e.target.value })}
                      placeholder="e.g. UPSC, GPSC, NEET, CA, Job"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ================= 03 LIBRARY MEMBERSHIP DETAILS ================= */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 pb-1 border-b border-purple-100">
                  <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    03
                  </span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Library Membership Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Membership Type</label>
                    <select 
                      value={admForm.membershipType}
                      onChange={(e) => setAdmForm({ ...admForm, membershipType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Annual">Annual</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Preferred Timing / Shift *</label>
                    <select 
                      value={admForm.shift}
                      onChange={(e) => setAdmForm({ ...admForm, shift: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="Full Day (24x7)">Full Day (24x7 Unrestricted Access)</option>
                      <option value="Morning Slot (06:00 AM - 02:00 PM)">Morning Slot (06:00 AM - 02:00 PM)</option>
                      <option value="Evening Slot (02:00 PM - 10:00 PM)">Evening Slot (02:00 PM - 10:00 PM)</option>
                      <option value="Night Owl (10:00 PM - 06:00 AM)">Night Owl (10:00 PM - 06:00 AM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Locker Number</label>
                    <input 
                      type="text" 
                      value={admForm.lockerNumber}
                      onChange={(e) => setAdmForm({ ...admForm, lockerNumber: e.target.value })}
                      placeholder="e.g. L-12 / None"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Allocate Seat (1 to 102) *</label>
                    <select 
                      value={admForm.seatNumber}
                      onChange={(e) => {
                        const sn = e.target.value;
                        setAdmForm({ ...admForm, seatNumber: sn, biometricEnrollmentId: sn });
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs"
                      required
                    >
                      <option value="">Select Seat...</option>
                      {editingAdmissionId && admForm.seatNumber && (
                        <option value={admForm.seatNumber}>Seat #{admForm.seatNumber} (Current)</option>
                      )}
                      {availableSeatsList.map(s => (
                        <option key={s.seatNumber} value={s.seatNumber}>
                          Seat #{String(s.seatNumber).padStart(2, '0')} — {s.zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Membership Start Date</label>
                    <input 
                      type="date" 
                      value={admForm.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const newEnd = calculateMembershipEndDate(newStart, admForm.durationMonths || 1);
                        setAdmForm({ ...admForm, startDate: newStart, endDate: newEnd });
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Valid Until (End Date)</label>
                    <input 
                      type="date" 
                      value={admForm.endDate}
                      onChange={(e) => setAdmForm({ ...admForm, endDate: e.target.value })}
                      placeholder="Auto-calculated"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Live Computed Membership Validity Preview Banner */}
                <div className="bg-purple-50/90 border border-purple-200/90 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-purple-950 block">Active Membership Validity Window</span>
                      <span className="text-[10px] text-purple-700">Duration: {admForm.durationMonths || 1} Month(s)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono font-black text-purple-950 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-2xs">
                    <span>{admForm.startDate || 'YYYY-MM-DD'}</span>
                    <span className="text-purple-400 font-sans">➔</span>
                    <span className="text-purple-700">{admForm.endDate || calculateMembershipEndDate(admForm.startDate, admForm.durationMonths || 1) || 'YYYY-MM-DD'}</span>
                  </div>
                </div>

                {/* Biometric Machine Mapping */}
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      PIN
                    </span>
                    <p className="text-[11px] text-emerald-900 leading-tight">
                      TimeWatch Biometric Device User ID: <b>{admForm.biometricEnrollmentId || admForm.seatNumber || '-'}</b>
                    </p>
                  </div>
                  <input 
                    type="number"
                    value={admForm.biometricEnrollmentId || admForm.seatNumber || ''}
                    onChange={(e) => setAdmForm({ ...admForm, biometricEnrollmentId: e.target.value })}
                    className="w-20 p-1.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-center text-xs"
                  />
                </div>
              </div>

              {/* ================= 04 EMERGENCY CONTACT DETAILS ================= */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 pb-1 border-b border-purple-100">
                  <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    04
                  </span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Emergency Contact Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      value={admForm.emergencyName}
                      onChange={(e) => setAdmForm({ ...admForm, emergencyName: e.target.value })}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Relationship</label>
                    <select 
                      value={admForm.emergencyRelation}
                      onChange={(e) => setAdmForm({ ...admForm, emergencyRelation: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Husband">Husband</option>
                      <option value="Wife">Wife</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Friend / Relative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Emergency Mobile Number</label>
                    <input 
                      type="tel" 
                      value={admForm.emergencyPhone}
                      onChange={(e) => setAdmForm({ ...admForm, emergencyPhone: e.target.value, guardianPhone: e.target.value })}
                      placeholder="+91 98980 11223"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* ================= 05 IDENTITY & DOCUMENT DETAILS (DUAL-SIDED AADHAAR + LIVE CAMERA & CROPPING) ================= */}
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-1 border-b border-purple-100">
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                      05
                    </span>
                    <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                      Identity Details & Document Attachments
                    </h3>
                  </div>
                  <span className="text-[10px] text-purple-700 font-medium hidden sm:inline">
                    Live camera capture & gallery crop support
                  </span>
                </div>

                {/* ID Proof Type & Formatted ID Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">ID Proof Type</label>
                    <select 
                      value={admForm.idProofType}
                      onChange={(e) => setAdmForm({ ...admForm, idProofType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (12 Digits)</option>
                      <option value="Driving Licence">Driving Licence</option>
                      <option value="Voter ID Card">Voter ID Card</option>
                      <option value="Passport">Passport</option>
                      <option value="College / University ID">College / University ID</option>
                      <option value="Other">Other Government ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>ID Proof Number</span>
                      {admForm.idProofType === 'Aadhaar Card' && (
                        <span className="text-[10px] text-purple-700 font-mono font-bold">Auto-spaced: 4-4-4</span>
                      )}
                    </label>
                    <input 
                      type="text" 
                      value={admForm.idProofType === 'Aadhaar Card' ? formatAadhaarNumber(admForm.idProofNo || admForm.aadhaarNo) : (admForm.idProofNo || admForm.aadhaarNo)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const formatted = admForm.idProofType === 'Aadhaar Card' ? formatAadhaarNumber(raw) : raw;
                        setAdmForm({ ...admForm, idProofNo: formatted, aadhaarNo: formatted });
                      }}
                      placeholder={admForm.idProofType === 'Aadhaar Card' ? "XXXX XXXX XXXX (e.g. 4821 9912 3014)" : "Enter ID Number"}
                      maxLength={admForm.idProofType === 'Aadhaar Card' ? 14 : 30}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold text-xs tracking-wider"
                    />
                  </div>
                </div>

                {/* 3 Upload Cards: Student Photo, Aadhaar Front, Aadhaar Back */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
                  
                  {/* Card 1: Student Profile Photo (1:1 Ratio) */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span>Student Photo</span>
                      </span>
                      <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">1:1 Square</span>
                    </div>

                    {admForm.studentPhoto ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-purple-200 aspect-square max-h-36 mx-auto bg-slate-50 flex items-center justify-center">
                          <img 
                            src={admForm.studentPhoto} 
                            alt="Student" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => setDocumentLightbox({ title: `${admForm.studentName || 'Student'} - Photo`, url: admForm.studentPhoto })}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-lg cursor-pointer"
                            title="View Full Size"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('studentPhoto', 'Student Profile Photo', 1)}
                            className="text-purple-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('studentPhoto', 'Student Profile Photo', 1)}
                            className="text-purple-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocField('studentPhoto')}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-xl p-3 bg-purple-50/20 text-center flex flex-col items-center justify-center space-y-2 min-h-[140px]">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                          <Camera className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-800">Passport Photo</p>
                        <div className="flex items-center space-x-1.5 pt-1 w-full">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('studentPhoto', 'Student Profile Photo', 1)}
                            className="flex-1 py-1.5 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('studentPhoto', 'Student Profile Photo', 1)}
                            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors border border-slate-300"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Aadhaar Card Front Side (1.58:1 Ratio) */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Aadhaar Front</span>
                      </span>
                      <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">Front Side</span>
                    </div>

                    {admForm.aadhaarFront ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-blue-200 aspect-16/10 max-h-36 mx-auto bg-slate-50 flex items-center justify-center">
                          <img 
                            src={admForm.aadhaarFront} 
                            alt="Aadhaar Front" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => setDocumentLightbox({ title: `${admForm.studentName || 'Student'} - Aadhaar Front`, url: admForm.aadhaarFront })}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-lg cursor-pointer"
                            title="View Full Size"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('aadhaarFront', 'Aadhaar Card - Front Side', 1.58)}
                            className="text-blue-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('aadhaarFront', 'Aadhaar Card - Front Side', 1.58)}
                            className="text-blue-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocField('aadhaarFront')}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-3 bg-blue-50/20 text-center flex flex-col items-center justify-center space-y-2 min-h-[140px]">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-800">Aadhaar Card (Front)</p>
                        <div className="flex items-center space-x-1.5 pt-1 w-full">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('aadhaarFront', 'Aadhaar Card - Front Side', 1.58)}
                            className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('aadhaarFront', 'Aadhaar Card - Front Side', 1.58)}
                            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors border border-slate-300"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Aadhaar Card Back Side (1.58:1 Ratio) */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aadhaar Back</span>
                      </span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Back Side</span>
                    </div>

                    {admForm.aadhaarBack ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-emerald-200 aspect-16/10 max-h-36 mx-auto bg-slate-50 flex items-center justify-center">
                          <img 
                            src={admForm.aadhaarBack} 
                            alt="Aadhaar Back" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => setDocumentLightbox({ title: `${admForm.studentName || 'Student'} - Aadhaar Back`, url: admForm.aadhaarBack })}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white rounded-lg cursor-pointer"
                            title="View Full Size"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('aadhaarBack', 'Aadhaar Card - Back Side', 1.58)}
                            className="text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('aadhaarBack', 'Aadhaar Card - Back Side', 1.58)}
                            className="text-emerald-700 hover:underline flex items-center space-x-0.5 cursor-pointer"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocField('aadhaarBack')}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl p-3 bg-emerald-50/20 text-center flex flex-col items-center justify-center space-y-2 min-h-[140px]">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-800">Aadhaar Card (Back)</p>
                        <div className="flex items-center space-x-1.5 pt-1 w-full">
                          <button
                            type="button"
                            onClick={() => handleOpenDocCameraModal('aadhaarBack', 'Aadhaar Card - Back Side', 1.58)}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocGallery('aadhaarBack', 'Aadhaar Card - Back Side', 1.58)}
                            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors border border-slate-300"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Gallery</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* ================= 06 FEE & PAYMENT DETAILS (DYNAMIC ITEMIZED ROWS) ================= */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 block text-xs">
                      Fee Structure & Itemized Charges
                    </span>
                    <span className="text-[10px] text-purple-700">
                      Click + Add Item to add custom fee components (Locker, Desk, Registration, ID)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAdmFeeItem}
                    className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Item</span>
                  </button>
                </div>

                {/* Dynamic Itemized Rows */}
                <div className="space-y-2">
                  {(admForm.feeItems || []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-purple-200 shadow-2xs">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleAdmFeeItemChange(index, 'description', e.target.value)}
                          placeholder="Item Description (e.g. Dedicated Desk #12, Locker Deposit, ID Card)"
                          className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-slate-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleAdmFeeItemChange(index, 'amount', e.target.value)}
                            placeholder="Price"
                            className="w-full pl-6 pr-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                            required
                          />
                        </div>
                      </div>
                      {(admForm.feeItems || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmFeeItem(index)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Total / Paid / Due Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-purple-200/80">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Total Agreed Fee (₹)</label>
                    <input 
                      type="number" 
                      value={admForm.totalFee}
                      onChange={(e) => setAdmForm({ ...admForm, totalFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Amount Paid Now (₹)</label>
                    <input 
                      type="number" 
                      value={admForm.paidAmount}
                      onChange={(e) => setAdmForm({ ...admForm, paidAmount: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Balance Due (₹)</label>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs text-amber-700">
                      ₹{Math.max(0, admForm.totalFee - admForm.paidAmount)}
                    </div>
                  </div>
                </div>

                {admForm.totalFee > admForm.paidAmount && (
                  <div>
                    <label className="block text-amber-900 font-semibold mb-1">Balance Fee Promise Due Date *</label>
                    <input 
                      type="date" 
                      value={admForm.feeDueDate}
                      onChange={(e) => setAdmForm({ ...admForm, feeDueDate: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white border border-amber-300 text-slate-800 text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Payment Mode</label>
                    <select 
                      value={admForm.paymentMode}
                      onChange={(e) => setAdmForm({ ...admForm, paymentMode: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    >
                      <option value="UPI (GPay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash (Hand-to-Hand)</option>
                      <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT / IMPS)</option>
                      <option value="Debit / Credit Card">Debit / Credit Card POS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Transaction Ref / UTR No</label>
                    <input 
                      type="text" 
                      value={admForm.transactionRef}
                      onChange={(e) => setAdmForm({ ...admForm, transactionRef: e.target.value })}
                      placeholder="e.g. UPI/492109281 or Cash"
                      className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setAdmissionModalOpen(false); setEditingAdmissionId(null); }}
                  className="w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={compressing}
                  className="w-1/2 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {editingAdmissionId ? 'Save & Update Admission Form' : 'Confirm Admission & Print Receipt'}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmModal(null); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 space-y-4 shadow-2xl relative my-auto sm:my-16">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Delete Admission Record?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete the admission form for <span className="font-bold text-slate-900">{deleteConfirmModal.studentName}</span> (Seat #{deleteConfirmModal.seatNumber})?
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-2">
                ⚠️ This action will immediately vacate <b>Seat #{deleteConfirmModal.seatNumber}</b> and permanently remove their admission form.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setDeleteConfirmModal(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteAdmission}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: COLLECT PENDING FEE MODAL ================= */}
      {paymentModalOpen && selectedAdmissionForPay && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setPaymentModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-5 shadow-2xl relative my-3 sm:my-8">
            <button 
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded border border-amber-200 uppercase">
                Fee Collection Desk
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Collect Outstanding Balance
              </h3>
              <p className="text-xs text-slate-500">
                Student: <strong>{selectedAdmissionForPay.studentName}</strong> • Seat #{selectedAdmissionForPay.seatNumber}
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Agreed Fee:</span>
                <span className="font-bold text-slate-900">₹{selectedAdmissionForPay.totalFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Already Paid:</span>
                <span className="font-bold text-emerald-700">₹{selectedAdmissionForPay.paidAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-amber-200/60 pt-1.5 text-amber-900">
                <span>Remaining Due:</span>
                <span>₹{selectedAdmissionForPay.pendingFee}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount Receiving Now (₹) *</label>
                <input 
                  type="number" 
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                  max={selectedAdmissionForPay.pendingFee}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                <select 
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI (GPay / PhonePe)">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reference / UTR / Note</label>
                <input 
                  type="text" 
                  value={payForm.transactionRef}
                  onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
                  placeholder="e.g. CASH / UPI-49210"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-mono"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setPaymentModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: RENEW MEMBERSHIP MODAL ================= */}
      {renewModalOpen && selectedAdmissionForRenew && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setRenewModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-5 shadow-2xl relative my-3 sm:my-8">
            <button 
              onClick={() => setRenewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded border border-purple-200 uppercase">
                Membership Extension
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Renew Seat #{selectedAdmissionForRenew.seatNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Student: <strong>{selectedAdmissionForRenew.studentName}</strong> • Current End Date: {selectedAdmissionForRenew.endDate}
              </p>
            </div>

            <form onSubmit={handleSubmitRenew} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Extension Period</label>
                <select 
                  value={renewForm.months}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const fee = m === 3 ? 4200 : (m === 6 ? 8000 : 1500 * m);
                    const deskDesc = `Desk #${selectedAdmissionForRenew.seatNumber} Renewal (${m} Month${m > 1 ? 's' : ''})`;
                    const currentItems = [...(renewForm.feeItems || [])];
                    if (currentItems.length > 0) {
                      currentItems[0] = { ...currentItems[0], description: deskDesc, amount: fee };
                    } else {
                      currentItems.push({ description: deskDesc, amount: fee });
                    }
                    const sum = currentItems.reduce((s, it) => s + (Number(it.amount) || 0), 0);
                    setRenewForm({ ...renewForm, months: m, feeItems: currentItems, totalFee: sum, paidAmount: sum });
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold"
                >
                  <option value={1}>Extend by 1 Month (₹1,500)</option>
                  <option value={2}>Extend by 2 Months (₹3,000)</option>
                  <option value={3}>Extend by 3 Months (₹4,200)</option>
                  <option value={6}>Extend by 6 Months (₹8,000)</option>
                </select>
              </div>

              {/* Dynamic Itemized Renewal Rows */}
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 block text-xs">
                      Itemized Charges
                    </span>
                    <span className="text-[10px] text-purple-700">
                      Click + Add Item to add custom renewal charges
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRenewItem}
                    className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(renewForm.feeItems || []).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-purple-200 shadow-2xs">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleRenewItemChange(index, 'description', e.target.value)}
                          placeholder="Item Description (e.g. Desk Renewal, Locker Fee)"
                          className="w-full p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div className="w-28">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleRenewItemChange(index, 'amount', e.target.value)}
                            placeholder="Price"
                            className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                            required
                          />
                        </div>
                      </div>
                      {(renewForm.feeItems || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRenewItem(index)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Agreed Fee (₹)</label>
                  <input 
                    type="number" 
                    value={renewForm.totalFee}
                    onChange={(e) => setRenewForm({ ...renewForm, totalFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount Paid (₹)</label>
                  <input 
                    type="number" 
                    value={renewForm.paidAmount}
                    onChange={(e) => setRenewForm({ ...renewForm, paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-mono font-bold text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                <select 
                  value={renewForm.paymentMode}
                  onChange={(e) => setRenewForm({ ...renewForm, paymentMode: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setRenewModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GOOGLE DRIVE CLOUD BACKUP & AUTO-SYNC ================= */}
      {driveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Drive Cloud Backups</h3>
                  <p className="text-xs text-slate-500">Automated 3-Portal Sync via Official Google Drive API</p>
                </div>
              </div>
              <button 
                onClick={() => setDriveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Section */}
            {loadingDriveStatus ? (
              <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                <span>Checking Google Drive connection status...</span>
              </div>
            ) : driveStatus?.configured ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">Google Cloud Service Account Connected</p>
                    <p className="text-emerald-700 font-mono text-[11px] truncate">
                      {driveStatus.serviceAccountEmail}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Backup Destination</span>
                    <span className="font-semibold text-slate-800">Google Drive Folder</span>
                    <p className="text-[11px] text-slate-500 truncate">{driveStatus.folderName || 'Brain Dock Library Backups'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Auto-Sync Cadence</span>
                    <span className="font-semibold text-emerald-700">⚡ Real-Time Instant Sync (Active)</span>
                    <p className="text-[11px] text-slate-500">Syncs automatically on every form save & edit</p>
                  </div>
                </div>

                {driveStatus.lastBackup && (
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Latest Cloud Snapshot</span>
                      <span className="font-semibold text-purple-900">{driveStatus.lastBackup.fileName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{new Date(driveStatus.lastBackup.timestamp).toLocaleString()}</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button 
                    type="button"
                    disabled={pushingDrive}
                    onClick={handlePushToGoogleDrive}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${pushingDrive ? 'animate-spin' : ''}`} />
                    <span>{pushingDrive ? 'Uploading Snapshot to Drive...' : '⚡ Push Backup to Google Drive Now'}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                    <span className="flex items-center space-x-1">
                      <FileCode className="w-3.5 h-3.5 text-purple-600" />
                      <span>Full JSON Restore File</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Excel / Sheets Student Master CSV</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Google Cloud Credentials Setup Required</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    To enable 100% automated backups to your personal or organization Google Drive, provide your Google Cloud Service Account key.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                  <h4 className="font-bold text-slate-800">Quick 3-Step Setup:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                    <li>Create a <strong>Service Account</strong> in Google Cloud Console and enable the <strong>Google Drive API</strong>.</li>
                    <li>Create and download a <strong>JSON key</strong> for the Service Account.</li>
                    <li>
                      Set environment variable <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[11px]">GOOGLE_SERVICE_ACCOUNT_JSON</code> with the JSON content in your server (or save as <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[11px]">backend/google-service-account.json</code>).
                    </li>
                  </ol>
                </div>

                <button 
                  type="button"
                  onClick={fetchDriveStatus}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-check Connection Status</span>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Secure Server-to-Server Encryption</span>
              <button 
                type="button"
                onClick={() => setDriveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 6: SECURITY CREDENTIALS (CHANGE PASSWORD & PIN) ================= */}
      {securityModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Security & Access Keys</h3>
                  <p className="text-[11px] text-slate-500">Change Admin Sign-in Password or Director PIN</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 pt-3 bg-white">
              <button
                type="button"
                onClick={() => setSecurityTab('password')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  securityTab === 'password'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Change Login Password</span>
              </button>
              <button
                type="button"
                onClick={() => setSecurityTab('pin')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  securityTab === 'pin'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Change Passkey PIN</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {securityTab === 'password' ? (
                /* Tab 1: Change Login Password */
                <form onSubmit={handleSecurityPasswordSubmit} className="space-y-4 text-xs">
                  {secPassMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{secPassMsg}</span>
                    </div>
                  )}

                  {secPassErr && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{secPassErr}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Account Email</label>
                    <input 
                      type="email" 
                      value={secEmail} 
                      onChange={(e) => setSecEmail(e.target.value)}
                      required
                      placeholder="admin@braindock.com"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
                    <input 
                      type="password" 
                      value={secCurrentPassword} 
                      onChange={(e) => setSecCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">New Password (Min 6 Characters)</label>
                    <input 
                      type="password" 
                      value={secNewPassword} 
                      onChange={(e) => setSecNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={secConfirmPassword} 
                      onChange={(e) => setSecConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat new password..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setSecurityModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={secPassLoading}
                      className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{secPassLoading ? 'Updating...' : 'Update Login Password'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Tab 2: Change Director Passkey PIN */
                <form onSubmit={handleSecurityPinSubmit} className="space-y-4 text-xs">
                  {secPinMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{secPinMsg}</span>
                    </div>
                  )}

                  {secPinErr && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{secPinErr}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Current Passkey PIN</label>
                    <input 
                      type="password" 
                      value={secCurrentPin} 
                      onChange={(e) => setSecCurrentPin(e.target.value)}
                      placeholder="Enter current PIN (e.g. 2026)..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">New 4-Digit Passkey PIN</label>
                    <input 
                      type="password" 
                      value={secNewPin} 
                      onChange={(e) => setSecNewPin(e.target.value)}
                      required
                      maxLength={8}
                      placeholder="e.g. 8842"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Confirm New PIN</label>
                    <input 
                      type="password" 
                      value={secConfirmPin} 
                      onChange={(e) => setSecConfirmPin(e.target.value)}
                      required
                      maxLength={8}
                      placeholder="Repeat new PIN..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setSecurityModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={secPinLoading}
                      className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{secPinLoading ? 'Updating...' : 'Update Passkey PIN'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: WHATSAPP BOT QR CODE SCANNER MODAL ================= */}
      {botModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setBotModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 text-slate-800 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setBotModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Tareeqa 3 • WhatsApp Multi-Device Engine
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Link Library WhatsApp Phone
              </h3>
              <p className="text-xs text-slate-500">
                Apne library ke mobile WhatsApp se yeh QR Code scan karein.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-50 border-2 border-purple-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3">
              {botStatus === 'connected' ? (
                <div className="space-y-3 py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">WhatsApp Successfully Linked!</h4>
                  <p className="text-xs text-emerald-700 font-medium">
                    Connected Number: <strong>{botInfo.connectedNumber || 'Library Official'}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Ab roz subah expiring students ko automatic WhatsApp reminder messages chale jayenge.
                  </p>
                  <button
                    onClick={() => setBotModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Done (Close)
                  </button>
                </div>
              ) : botInfo.qrCodeDataUrl ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="p-2.5 bg-white rounded-2xl shadow-md border border-purple-300">
                    <img 
                      src={botInfo.qrCodeDataUrl} 
                      alt="WhatsApp Web QR Code" 
                      className="w-52 h-52 block rounded-xl"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-purple-700 font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                    <span>Waiting for camera scan...</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-8">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-700">Generating Secure QR Code...</p>
                  <p className="text-[11px] text-slate-400">Connecting to WhatsApp Multi-Device Server</p>
                </div>
              )}
            </div>

            {/* 3 Simple Instructions */}
            {botStatus !== 'connected' && (
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
                <p className="font-bold text-purple-950 flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-700" />
                  <span>Phone se scan karne ke steps:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 font-medium">
                  <li>Library ke phone me <strong>WhatsApp</strong> kholein.</li>
                  <li>Upar 3 dots ya Settings par tap karein ➔ <strong>Linked Devices</strong>.</li>
                  <li><strong>"Link a Device"</strong> par click karein aur is QR code ko scan karein.</li>
                </ol>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: SEND TEST WHATSAPP MESSAGE ================= */}
      {testModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setTestModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setTestModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Delivery Test
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Send Test WhatsApp Message
              </h3>
              <p className="text-xs text-slate-500">
                Verify karein ki linked WhatsApp session sahi tarah se message bhej raha hai.
              </p>
            </div>

            <form onSubmit={handleSendTestMessage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Recipient Mobile Number (+91)</label>
                <input 
                  type="text" 
                  value={testPhone} 
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. 6356006100"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Body</label>
                <textarea 
                  rows="4"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingTest ? 'animate-bounce' : ''}`} />
                  <span>{sendingTest ? 'Delivering...' : 'Send Test WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WHATSAPP MESSAGE LIVE PREVIEW ================= */}
      {previewMessageItem && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewMessageItem(null); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-800 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setPreviewMessageItem(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5">
              <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Exact WhatsApp Message Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Yeh exact message is student ke mobile (+91 {previewMessageItem.studentPhone}) par jayega:
                </p>
              </div>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-slate-300 shadow-inner space-y-2">
              <div className="bg-[#DCF8C6] p-4 rounded-2xl rounded-tr-none shadow-sm text-xs font-sans text-slate-900 leading-relaxed whitespace-pre-line border border-[#C5E9AC] max-w-md ml-auto">
                <div className="font-bold text-emerald-950 mb-1 flex items-center justify-between border-b border-emerald-300/50 pb-1">
                  <span>🔔 Brain Dock Library - Renewal Alert</span>
                  <span className="text-[10px] text-slate-500 font-mono font-normal">Official Notice</span>
                </div>
                {`Dear *${previewMessageItem.studentName}*,

Your library membership for *Seat #${previewMessageItem.seatNumber}* is ${previewMessageItem.daysRemaining < 0 ? `EXPIRED ${Math.abs(previewMessageItem.daysRemaining)} day(s) ago` : previewMessageItem.daysRemaining === 0 ? 'EXPIRES TODAY' : `expiring in ${previewMessageItem.daysRemaining} day(s)`} on *${previewMessageItem.endDate}*.

⚠️ *Seat Protection Notice:*
To ensure your personal seat is retained and your 24/7 biometric attendance access continues without disruption, please renew your membership at the library desk today.

📌 *Seat:* Seat #${previewMessageItem.seatNumber} (${previewMessageItem.shift || 'Full Day'})
📅 *Valid Till:* ${previewMessageItem.endDate}
💰 *Renewal Plan:* ₹${studentRenewalFees[previewMessageItem.admissionId] !== undefined ? studentRenewalFees[previewMessageItem.admissionId] : (previewMessageItem.renewalFee || renewalFee)} / Month${offerNote ? ` (${offerNote})` : ''}

📍 *Brain Dock Library*
2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601
Helpline: +91 63 5600 6100
Thank you!`}
                <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                  09:30 AM ✓✓
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                Recipient: <strong>{previewMessageItem.studentName}</strong> (Seat #{previewMessageItem.seatNumber})
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`🔔 *Brain Dock Library - Membership Renewal Alert* 📚\n\nDear *${previewMessageItem.studentName}*,\n\nYour library membership for *Seat #${previewMessageItem.seatNumber}* is ${previewMessageItem.daysRemaining < 0 ? `EXPIRED ${Math.abs(previewMessageItem.daysRemaining)} day(s) ago` : previewMessageItem.daysRemaining === 0 ? 'EXPIRES TODAY' : `expiring in ${previewMessageItem.daysRemaining} day(s)`} on *${previewMessageItem.endDate}*.\n\n⚠️ *Seat Protection Notice:*\nTo ensure your personal seat is retained and your 24/7 biometric attendance access continues without disruption, please renew your membership at the library desk today.\n\n📌 *Seat:* Seat #${previewMessageItem.seatNumber} (${previewMessageItem.shift || 'Full Day'})\n📅 *Valid Till:* ${previewMessageItem.endDate}\n💰 *Renewal Plan:* ₹${studentRenewalFees[previewMessageItem.admissionId] !== undefined ? studentRenewalFees[previewMessageItem.admissionId] : (previewMessageItem.renewalFee || renewalFee)} / Month${offerNote ? ` (${offerNote})` : ''}\n\n📍 *Brain Dock Library*\n2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601\nHelpline: +91 63 5600 6100\nThank you!`);
                  showToast('Message text copied to clipboard!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Copy Text
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 5: OFFICIAL A4 DUAL PRINTABLE FEE RECEIPT (2 COPIES ON 1 A4) ================= */}
      <DualA4ReceiptModal 
        receipt={activeReceipt} 
        isOpen={receiptModalOpen} 
        onClose={() => setReceiptModalOpen(false)} 
      />

      {/* Hidden Gallery Input for Documents */}
      <input 
        ref={docFilePickerRef}
        type="file" 
        accept="image/*" 
        onChange={handleDocGalleryFileSelected} 
        className="hidden" 
      />

      {/* Live Camera Capture & Interactive Cropping Modal */}
      <CameraCaptureCropModal
        isOpen={cropModalConfig.isOpen}
        title={cropModalConfig.title}
        aspectRatio={cropModalConfig.aspectRatio}
        initialImage={cropModalConfig.initialImage}
        onClose={() => setCropModalConfig(prev => ({ ...prev, isOpen: false, initialImage: null }))}
        onSave={handleDocCropSave}
      />

      {/* Full-Screen Document Lightbox Modal */}
      {documentLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col items-center justify-center animate-in fade-in"
          onClick={() => setDocumentLightbox(null)}
        >
          <div 
            className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 text-white shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>{documentLightbox.title}</span>
              </h4>
              <button 
                type="button"
                onClick={() => setDocumentLightbox(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-xl bg-black flex items-center justify-center p-2">
              <img 
                src={documentLightbox.url} 
                alt={documentLightbox.title} 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setDocumentLightbox(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import DualA4ReceiptModal from '../components/DualA4ReceiptModal';
import { compressImage } from '../utils/imageCompressor';
import { API_BASE_URL } from '../config';

export default function OwnerPortal() {
  const { currentStaff } = useAdminAuth();

  // Security Gate State
  const [isUnlocked, setIsUnlocked] = useState(true); // Default accessible for authorized director
  const [masterPin, setMasterPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Core Data
  const [seats, setSeats] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [stats, setStats] = useState({
    totalSeats: 102,
    occupiedSeats: 0,
    availableSeats: 0,
    maintenanceSeats: 0,
    occupancyRate: 0,
    totalFeeCollected: 0,
    totalFeePending: 0,
    pendingCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'register' | 'biometric'
  const [gridFilter, setGridFilter] = useState('all'); // 'all' | 'available' | 'occupied' | 'pending' | 'expiring'
  const [searchQuery, setSearchQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState('all'); // 'all' | 'pending' | 'paid' | 'expiring' | 'expired'

  // Biometric Attendance & Hardware State
  const [biometricLogs, setBiometricLogs] = useState([]);
  const [biometricStats, setBiometricStats] = useState(null);
  const [bioFilter, setBioFilter] = useState('all'); // 'all' | 'granted' | 'denied' | 'in' | 'out'
  const [bioSearch, setBioSearch] = useState('');
  const [simulatedSeatNum, setSimulatedSeatNum] = useState(1);
  const [simulatedPunchResult, setSimulatedPunchResult] = useState(null);
  const [simulatingPunch, setSimulatingPunch] = useState(false);

  // 3-Day Expiry Reminders State
  const [expiryReminders, setExpiryReminders] = useState([]);
  const [expiryLoading, setExpiryLoading] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);

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

  // Comprehensive Admission Form Initial State (Sections 01 to 05)
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
    city: 'Surat',
    pinCode: '',

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
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
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

    // Fee & Payment (Itemized with dynamic + rows)
    feeItems: [
      { description: 'Dedicated Study Desk & Facility Pass', amount: 1500 }
    ],
    totalFee: 1500,
    paidAmount: 1500,
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

  const fetchOwnerData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/owner/seats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/admissions`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/biometric/logs`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/biometric/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/owner/expiry-reminders`).then(r => r.json())
    ])
      .then(([seatsRes, admRes, statsRes, bioLogsRes, bioStatsRes, expRes]) => {
        if (seatsRes.success) setSeats(seatsRes.data);
        if (admRes.success) setAdmissions(admRes.data);
        if (statsRes.success) setStats(statsRes.data);
        if (bioLogsRes.success) setBiometricLogs(bioLogsRes.data);
        if (bioStatsRes.success) setBiometricStats(bioStatsRes.data);
        if (expRes.success) setExpiryReminders(expRes.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load owner data', err);
        setLoading(false);
      });
  };

  const fetchExpiryReminders = () => {
    setExpiryLoading(true);
    fetch(`${API_BASE_URL}/api/owner/expiry-reminders`)
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendSingleReminder = async (item) => {
    setSendingReminderId(item.admissionId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/expiry-reminders/${item.admissionId}/send`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Reminder recorded for ${item.studentName}! Opening WhatsApp...`);
        window.open(data.whatsAppUrl || item.whatsAppUrl, '_blank');
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
    if (!window.confirm('Send WhatsApp renewal reminder to all students expiring in the next 3 days?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/expiry-reminders/send-all-due`, {
        method: 'POST'
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

  const handleClearAllDummyData = async () => {
    if (!window.confirm('Clear all dummy records? All 102 seats will be reset to Available and only real biometric punches will be kept.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/clear-all-data`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchOwnerData();
      }
    } catch (e) {
      showToast('Failed to clear dummy data');
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

  // Security PIN Verification
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (masterPin === '2026' || masterPin === '1234' || masterPin === 'braindock123') {
      setIsUnlocked(true);
      setPinError('');
      showToast('Owner access verified! Welcome Director.');
    } else {
      setPinError('Invalid Passkey PIN. Please enter the authorized owner PIN.');
    }
  };

  // Handle Opening Admission Modal for a Specific Seat (New Admission)
  const handleOpenAdmit = (seatNum) => {
    setEditingAdmissionId(null);
    setImageCompressInfo(null);
    setPreselectedSeatNum(seatNum);
    const chosen = seatNum || (availableSeatsList[0]?.seatNumber || 1);
    setAdmForm({
      ...initialAdmForm,
      seatNumber: chosen,
      biometricEnrollmentId: chosen,
      startDate: new Date().toISOString().split('T')[0],
      feeItems: [
        { description: `Dedicated Study Desk #${chosen} & Facility Pass`, amount: 1500 }
      ],
      totalFee: 1500,
      paidAmount: 1500,
      transactionRef: `UPI/${Date.now().toString().slice(-6)}`
    });
    setAdmissionModalOpen(true);
  };

  // Handle Opening Admission in Edit Mode
  const handleOpenEditAdmission = (admission) => {
    setEditingAdmissionId(admission.admissionId);
    setImageCompressInfo(null);
    setPreselectedSeatNum(admission.seatNumber);
    setAdmForm({
      studentName: admission.studentName || '',
      parentsName: admission.parentsName || '',
      dob: admission.dob || '',
      gender: admission.gender || 'Male',
      studentPhone: admission.studentPhone || '',
      whatsAppNumber: admission.whatsAppNumber || admission.studentPhone || '',
      studentEmail: admission.studentEmail || '',
      address: admission.address || '',
      city: admission.city || 'Surat',
      pinCode: admission.pinCode || '',
      qualification: admission.qualification || '',
      institution: admission.institution || '',
      course: admission.course || '',
      yearSemester: admission.yearSemester || '',
      occupation: admission.occupation || admission.targetExam || '',
      targetExam: admission.targetExam || '',
      membershipType: admission.membershipType || 'Monthly',
      shift: admission.shift || 'Full Day (24x7)',
      durationMonths: 1,
      startDate: admission.startDate || new Date().toISOString().split('T')[0],
      endDate: admission.endDate || '',
      seatNumber: admission.seatNumber || '',
      biometricEnrollmentId: admission.biometricEnrollmentId || admission.seatNumber || '',
      lockerNumber: admission.lockerNumber || '',
      emergencyName: admission.emergencyName || admission.guardianName || '',
      emergencyRelation: admission.emergencyRelation || 'Parent',
      emergencyPhone: admission.emergencyPhone || admission.guardianPhone || '',
      guardianPhone: admission.guardianPhone || admission.emergencyPhone || '',
      idProofType: admission.idProofType || 'Aadhaar Card',
      idProofNo: admission.idProofNo || admission.aadhaarNo || '',
      aadhaarNo: admission.aadhaarNo || admission.idProofNo || '',
      studentPhoto: admission.studentPhoto || '',
      feeItems: (admission.feeItems && Array.isArray(admission.feeItems) && admission.feeItems.length > 0)
        ? admission.feeItems
        : [{ description: `Dedicated Study Desk #${admission.seatNumber || ''} & Facility Pass`, amount: admission.totalFee || 1500 }],
      totalFee: admission.totalFee || 1500,
      paidAmount: admission.paidAmount || 1500,
      paymentMode: admission.paymentMode || 'UPI (GPay / PhonePe)',
      transactionRef: admission.transactionRef || '',
      feeDueDate: admission.feeDueDate || '',
      notes: admission.notes || ''
    });
    setAdmissionModalOpen(true);
  };

  // Smart Client-Side Photo Compression Handler
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

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admForm)
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
          if (!isEdit && data.receipt) {
            setActiveReceipt(data.receipt);
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
    setRenewForm({
      months: 1,
      feeItems: [
        { description: `Desk #${admission.seatNumber} Renewal Fee (1 Month)`, amount: 1500 }
      ],
      totalFee: 1500,
      paidAmount: 1500,
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

  // Available seats list for dropdown
  const availableSeatsList = seats.filter(s => s.status === 'Available');

  // Filtered Seats for Grid View
  const filteredGridSeats = seats.filter(s => {
    if (gridFilter === 'available') return s.status === 'Available';
    if (gridFilter === 'occupied') return s.status === 'Occupied' || s.status === 'Expired';
    if (gridFilter === 'pending') return s.occupant && (s.occupant.feeStatus === 'Pending' || s.occupant.pendingFee > 0);
    if (gridFilter === 'expiring') return s.occupant && (s.occupant.daysRemaining >= 0 && s.occupant.daysRemaining <= 5);
    return true;
  });

  // Filtered Admissions for Register View
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
  });

  // Calculate duration dates helper
  const handleDurationChange = (months) => {
    const m = Number(months);
    const start = new Date(admForm.startDate || new Date());
    const end = new Date(start);
    end.setMonth(end.getMonth() + m);
    
    // Fee tier calculation: 1mo = 1500, 3mo = 4200, 6mo = 8000, 12mo = 15000
    let fee = 1500 * m;
    if (m === 3) fee = 4200;
    if (m === 6) fee = 8000;
    if (m === 12) fee = 15000;

    setAdmForm(prev => ({
      ...prev,
      durationMonths: m,
      totalFee: fee,
      paidAmount: fee
    }));
  };

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
            <span>New Admission (नया एडमिशन)</span>
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

          <button 
            onClick={handleClearAllDummyData}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors flex items-center space-x-1.5"
            title="Clear all dummy data (102 seats clean, machine data only)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Dummy Data</span>
          </button>

          <button 
            onClick={() => setIsUnlocked(false)}
            className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors"
            title="Lock Desk"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 High-Impact Operational KPI Metrics */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
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
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Available (खाली)</span>
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

        <div className={`p-5 rounded-2xl shadow-xs transition-all ${stats.totalFeePending > 0 ? 'bg-amber-50/40 border border-amber-200' : 'bg-white border border-slate-200/80'}`}>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Pending Dues (बाकी)</span>
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
            🪑 102-Seat Floor Matrix (सीट ग्रिड)
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all ${
              activeTab === 'register' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Admissions & Fees Register ({admissions.length})
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
            <span>Available (खाली)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-800"></span>
            <span>Occupied (Paid)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500"></span>
            <span>Fee Pending (बाकी)</span>
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
                <h3 className="font-bold text-slate-900 text-sm">All 102 Premium Study Desks (102 प्रीमियम सीट्स)</h3>
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
                      3-Day Membership Expiry Watch (लास्ट 3 दिन का ऑटो रिमाइंडर)
                    </h3>
                    <p className="text-xs text-amber-900 font-semibold">
                      Automated Protocol: Last 3 days me harroj sirf 1 reminder • Renew karne par turant stop
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  💡 <strong>Rule Engine:</strong> Jis bhi student ki membership expire hone me 3 din (ya usse kam) bache ho, system unhe is priority list me add karta hai. Daily subah 1 personalized WhatsApp alert bhej sakte hain. Jaise hi student desk par renewal karwa leta hai, wo automatically is list se bahar ho jata hai aur aage notifications band ho jate hain.
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

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
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
                      <td colSpan="7" className="py-12 text-center">
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
                  <span className="text-[10px] text-emerald-700">Machine par Add User me yehi ID daal kar finger scan karein:</span>
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
                <span>Print Receipt (रसीद)</span>
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
                Vacate Seat #{selectedSeat.seatNumber} (सीट खाली करें)
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
                        placeholder="Surat"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        value={admForm.pinCode}
                        onChange={(e) => setAdmForm({ ...admForm, pinCode: e.target.value })}
                        placeholder="395006"
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
                      placeholder="e.g. VNSGU / SVNIT / Surat Public School"
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
                      onChange={(e) => setAdmForm({ ...admForm, startDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Valid Until (End Date)</label>
                    <input 
                      type="date" 
                      value={admForm.endDate}
                      onChange={(e) => setAdmForm({ ...admForm, endDate: e.target.value })}
                      placeholder="Auto-calculated if blank"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                    />
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

              {/* ================= 05 IDENTITY / DOCUMENT DETAILS & SMART COMPRESSOR ================= */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 pb-1 border-b border-purple-100">
                  <span className="bg-purple-700 text-white font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                    05
                  </span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                    Identity / Document & Student Photo (With Auto-Compressor)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Column: ID Proof details */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ID Proof Type</label>
                      <select 
                        value={admForm.idProofType}
                        onChange={(e) => setAdmForm({ ...admForm, idProofType: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Driving Licence">Driving Licence</option>
                        <option value="Voter ID Card">Voter ID Card</option>
                        <option value="Passport">Passport</option>
                        <option value="College / University ID">College / University ID</option>
                        <option value="Other">Other Government ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">ID Proof Number</label>
                      <input 
                        type="text" 
                        value={admForm.idProofNo || admForm.aadhaarNo}
                        onChange={(e) => setAdmForm({ ...admForm, idProofNo: e.target.value, aadhaarNo: e.target.value })}
                        placeholder="e.g. 4821 9912 3014"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Right Column: Student Photo Upload with Smart Compressor */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>Student Photo</span>
                      <span className="text-[10px] text-purple-700 font-normal">Auto-compressed for instant loading</span>
                    </label>

                    {admForm.studentPhoto ? (
                      <div className="flex items-center space-x-3 p-3 bg-white border-2 border-purple-200 rounded-2xl shadow-2xs">
                        <img 
                          src={admForm.studentPhoto} 
                          alt="Student Preview" 
                          className="w-16 h-16 rounded-xl object-cover border border-purple-200 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {admForm.studentName || 'Student Photo'}
                          </p>
                          {imageCompressInfo && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              ⚡ Compressed: {imageCompressInfo.compressedKB} KB ({imageCompressInfo.savings}% saved)
                            </span>
                          )}
                          <div className="mt-1.5 flex items-center space-x-2">
                            <label className="text-[11px] text-purple-700 font-bold hover:underline cursor-pointer">
                              Change
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                              />
                            </label>
                            <span className="text-slate-300">•</span>
                            <button 
                              type="button" 
                              onClick={handleRemovePhoto}
                              className="text-[11px] text-rose-600 hover:underline font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-4 bg-purple-50/40 hover:bg-purple-50/70 transition-all flex flex-col items-center justify-center cursor-pointer text-center group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900 text-xs">
                          {compressing ? 'Compressing Image...' : 'Click to Upload Student Photo'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          JPG, PNG, WebP • Auto-compressed to lightweight profile format
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= 06 FEE & PAYMENT DETAILS (DYNAMIC ITEMIZED ROWS) ================= */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 block text-xs">
                      Fee Structure & Itemized Charges (शुल्क विवरण)
                    </span>
                    <span className="text-[10px] text-purple-700">
                      नीचे + दबाकर जितने चाहें शुल्क (Locker, Desk, Registration, ID) जोड़ें
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
                      Itemized Charges (शुल्क विवरण)
                    </span>
                    <span className="text-[10px] text-purple-700">
                      नीचे + दबाकर जितने चाहें शुल्क जोड़ें
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

      {/* ================= MODAL 5: OFFICIAL A4 DUAL PRINTABLE FEE RECEIPT (2 COPIES ON 1 A4) ================= */}
      <DualA4ReceiptModal 
        receipt={activeReceipt} 
        isOpen={receiptModalOpen} 
        onClose={() => setReceiptModalOpen(false)} 
      />

    </div>
  );
}



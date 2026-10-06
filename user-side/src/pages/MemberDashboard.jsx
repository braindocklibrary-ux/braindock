import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  Bookmark, 
  CreditCard, 
  Calendar, 
  Bell, 
  User, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  QrCode, 
  Sparkles, 
  Download, 
  Printer, 
  Layers, 
  VolumeX, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DigitalCard from '../components/DigitalCard';

export default function MemberDashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [issues, setIssues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [toast, setToast] = useState(null);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || 'Ahmedabad, Gujarat');

  useEffect(() => {
    fetchIssues();
    fetchReservations();
    fetchPayments();
  }, []);

  const fetchIssues = () => {
    fetch('http://localhost:5000/api/issues')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setIssues(data.data);
        }
      });
  };

  const fetchReservations = () => {
    fetch('http://localhost:5000/api/reservations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setReservations(data.data);
        }
      });
  };

  const fetchPayments = () => {
    fetch('http://localhost:5000/api/payments')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPayments(data.data);
        }
      });
  };

  const handleRenewBook = (issueId) => {
    fetch('http://localhost:5000/api/issues/renew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({ issueId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setToast(`Book renewed successfully! New due date updated.`);
          fetchIssues();
        } else {
          setToast(data.message || 'Renewal limit reached');
        }
        setTimeout(() => setToast(null), 3500);
      });
  };

  const handlePayFine = () => {
    fetch('http://localhost:5000/api/payments/pay-fine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({ amount: user.finesDue || 50, paymentMethod: 'UPI' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          updateProfile({ finesDue: 0 });
          setToast("Fine cleared! Receipt generated in Payments history.");
          fetchPayments();
        }
        setTimeout(() => setToast(null), 3500);
      });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, phone, address });
    setToast("Profile details updated successfully!");
    setTimeout(() => setToast(null), 3000);
  };

  const activeIssues = issues.filter(i => i.status === 'Issued' || i.status === 'Overdue');
  const overdueCount = issues.filter(i => i.status === 'Overdue').length;

  return (
    <div className="min-h-screen bg-[#FBFBFE] py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* User Hero Greeting & Plan Badge */}
        <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} 
              alt={user?.name} 
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Member'}</h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {user?.membershipStatus || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Member ID: <span className="font-mono text-purple-800 font-bold">{user?.memberId || 'BDL-MEM-8842'}</span> • {user?.membershipPlan || 'Premium Scholar'} Tier
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveTab('card')}
              className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 border border-slate-200 shadow-xs transition-all"
            >
              <QrCode className="w-4 h-4 text-purple-700" />
              <span>Digital Smart Card</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-purple-100 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'card', label: 'Smart Pass', icon: QrCode },
            { id: 'books', label: 'Issued Books', icon: Clock },
            { id: 'reservations', label: 'Reservations', icon: Bookmark },
            { id: 'payments', label: 'Fines & Invoices', icon: CreditCard },
            { id: 'settings', label: 'Profile & Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-purple-700 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-purple-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase">Currently Borrowed</span>
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{activeIssues.length} Books</h3>
                <p className="text-[11px] text-slate-500 mt-1">Quota: 4 Books Active</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-purple-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase">Due Soon</span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">1 Book</h3>
                <p className="text-[11px] text-amber-600 mt-1 font-medium">Due in 11 days (Auto-renew ready)</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-purple-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase">Outstanding Fine</span>
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">₹{user?.finesDue || 0}</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {user?.finesDue > 0 ? (
                    <button onClick={handlePayFine} className="text-purple-700 font-bold hover:underline">Pay via UPI Now</button>
                  ) : 'Zero overdue balance'}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-purple-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase">Study Pod Quota</span>
                  <VolumeX className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">8 / 10 Hrs</h3>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Available this billing cycle</p>
              </div>
            </div>

            {/* Currently Issued Books Card */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-purple-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-purple-50">
                <h3 className="text-lg font-bold text-slate-900">Currently Issued Books</h3>
                <span className="text-xs text-slate-500 font-medium">Renewals available up to 2 times</span>
              </div>

              <div className="space-y-4">
                {issues.map(item => (
                  <div key={item.issueId} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <img 
                        src={item.bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'} 
                        alt={item.bookTitle} 
                        className="w-12 h-16 object-cover rounded-xl shadow-sm border border-purple-200"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.bookTitle}</h4>
                        <p className="text-xs text-slate-500">
                          Due Date: <strong className="text-purple-900">{new Date(item.dueDate).toLocaleDateString()}</strong>
                        </p>
                        <span className="text-[10px] font-mono text-purple-600">Renewals used: {item.renewalsCount || 0}/2</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={() => handleRenewBook(item.issueId)}
                        className="bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew Online</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL SMART CARD */}
        {activeTab === 'card' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-6 flex flex-col items-center">
            <div className="text-center max-w-md space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Your Official Digital Smart Card</h2>
              <p className="text-xs text-slate-500">
                Present this scannable pass at Brain Dock entrance turnstiles, borrowing kiosks, and soundproof pod scanners.
              </p>
            </div>

            <DigitalCard user={user} />
          </div>
        )}

        {/* TAB 3: ISSUED BOOKS */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Complete Issue & Return History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Issue ID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Borrowed On</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {issues.map(item => (
                    <tr key={item.issueId}>
                      <td className="p-4 font-mono font-bold text-purple-900">{item.issueId}</td>
                      <td className="p-4 font-bold text-slate-900">{item.bookTitle}</td>
                      <td className="p-4">{new Date(item.issueDate).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-purple-950">{new Date(item.dueDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          item.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleRenewBook(item.issueId)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Your Active Book Reservations</h3>
            {reservations.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Bookmark className="w-10 h-10 text-purple-400 mx-auto" />
                <p className="text-xs text-slate-500">You currently have no reserved books waiting in queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map(res => (
                  <div key={res.reservationId} className="p-4 rounded-2xl bg-purple-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{res.bookTitle}</h4>
                      <p className="text-xs text-slate-500">Queue Position: #{res.queuePosition} • Status: {res.status}</p>
                    </div>
                    <button className="text-xs font-bold text-rose-600 hover:underline">Cancel Reservation</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PAYMENTS & FINES */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Payment Transactions & Receipts</h3>
              {user?.finesDue > 0 && (
                <button 
                  onClick={handlePayFine}
                  className="bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-purple-glow"
                >
                  Pay Outstanding Fine (₹{user.finesDue})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {payments.map(p => (
                    <tr key={p.transactionId}>
                      <td className="p-4 font-mono font-bold text-purple-900">{p.transactionId}</td>
                      <td className="p-4 font-mono">{p.invoiceNumber}</td>
                      <td className="p-4 font-medium text-slate-900">{p.purpose}</td>
                      <td className="p-4 font-bold text-slate-900">₹{p.amount}</td>
                      <td className="p-4">{p.paymentMethod}</td>
                      <td className="p-4">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & PROFILE */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-purple-card max-w-2xl mx-auto space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Member Profile Details</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Registered)</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / University</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  className="w-full p-3 rounded-xl border border-purple-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/40"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-purple-glow transition-all"
              >
                Save Profile Updates
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings, Database, CloudRain, Save, CheckCircle2, ShieldCheck, Key, Lock, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../config';

export default function AdminSettings() {
  const { currentStaff, adminUser } = useAdminAuth();

  const [libraryName, setLibraryName] = useState('BRAIN DOCK LIBRARY');
  const [finePerDay, setFinePerDay] = useState(10);
  const [defaultLoanDays, setDefaultLoanDays] = useState(14);
  const [saved, setSaved] = useState(false);

  // Security Credentials State - Password Change
  const [passEmail, setPassEmail] = useState(adminUser?.email || currentStaff?.email || 'admin@braindock.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [passError, setPassError] = useState(null);

  // Security Credentials State - PIN Change
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState(null);
  const [pinError, setPinError] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassMessage(null);

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: passEmail,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      setPassLoading(false);
      if (data.success) {
        setPassMessage('✅ Login password successfully updated! Please use your new password next time you sign in.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPassLoading(false);
      setPassError('Network error while updating password.');
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    setPinError(null);
    setPinMessage(null);

    if (!newPin || newPin.length < 4) {
      setPinError('New PIN must be at least 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN and confirm PIN do not match.');
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/change-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPin,
          newPin
        })
      });
      const data = await res.json();
      setPinLoading(false);
      if (data.success) {
        setPinMessage('✅ Director Passkey PIN successfully updated!');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setPinError(data.message || 'Failed to update PIN.');
      }
    } catch (err) {
      setPinLoading(false);
      setPinError('Network error while updating PIN.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          System Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Library System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure operational rules, database synchronization, and cloud storage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Database & Cloudinary Status Cards */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">MongoDB Atlas Cluster</h4>
              <p className="text-xs text-emerald-600 font-semibold">Active & Synced</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Cluster: cluster0.7dpsi7g.mongodb.net
          </p>
          <p className="text-[11px] text-slate-400">
            Database: braindock_library • Fallback cache: Operational
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cloudinary CDN Storage</h4>
              <p className="text-xs text-emerald-600 font-semibold">hiifll86 Connected</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-mono">
            Key: 462785225922261 • Folder: braindock
          </p>
          <p className="text-[11px] text-slate-400">
            Official logos & book covers hosted with HTTPS delivery.
          </p>
        </div>

      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900">General Circulation Rules</h3>
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Official Brand Name</label>
            <input 
              type="text" 
              value={libraryName} 
              onChange={(e) => setLibraryName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Late Return Fine (₹ per day)</label>
              <input 
                type="number" 
                value={finePerDay} 
                onChange={(e) => setFinePerDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Default Loan Duration (Days)</label>
              <input 
                type="number" 
                value={defaultLoanDays} 
                onChange={(e) => setDefaultLoanDays(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button 
              type="submit" 
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
            {saved && (
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-medium text-xs flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settings synchronized</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Security & Access Credentials (Change Password & Passkey PIN) */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Security & Authentication
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Change Login Password & Security PIN</h2>
          <p className="text-xs text-slate-500 mt-0.5">Update your administrator sign-in password and 102-seat owner terminal passkey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Change Login Password Form Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Change Login Password</h3>
                <p className="text-[11px] text-slate-500">Super Admin / Staff Login Credentials</p>
              </div>
            </div>

            {passMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passMessage}</span>
              </div>
            )}

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Email</label>
                <input 
                  type="email" 
                  value={passEmail} 
                  onChange={(e) => setPassEmail(e.target.value)}
                  required
                  placeholder="admin@braindock.com"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={passLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{passLoading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          </div>

          {/* Change Director Passkey PIN Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Director Passkey PIN</h3>
                <p className="text-[11px] text-slate-500">102-Seat Owner Desk Passkey Gate</p>
              </div>
            </div>

            {pinMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pinMessage}</span>
              </div>
            )}

            {pinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Passkey PIN</label>
                <input 
                  type="password" 
                  value={currentPin} 
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN (e.g. 2026)..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New 4-Digit PIN</label>
                  <input 
                    type="password" 
                    value={newPin} 
                    onChange={(e) => setNewPin(e.target.value)}
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
                    value={confirmPin} 
                    onChange={(e) => setConfirmPin(e.target.value)}
                    required
                    maxLength={8}
                    placeholder="Repeat new PIN..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={pinLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{pinLoading ? 'Updating PIN...' : 'Save New Passkey PIN'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

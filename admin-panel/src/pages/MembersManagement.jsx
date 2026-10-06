import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  QrCode, 
  ShieldCheck, 
  Download, 
  UserPlus, 
  Check, 
  X, 
  Eye, 
  Mail, 
  Phone,
  Sparkles
} from 'lucide-react';

export default function MembersManagement() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [cardModal, setCardModal] = useState(false);
  const [addModal, setAddModal] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState('First 50 Admissions Offer');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    fetch('http://localhost:5000/api/admin/members', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setMembers(data.data.filter(u => u.role === 'Member'));
        }
      });
  };

  const handleToggleStatus = (memberId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    fetch(`http://localhost:5000/api/admin/members/${memberId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => fetchMembers());
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        phone: newPhone,
        password: 'password123',
        membershipPlan: newPlan
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAddModal(false);
          fetchMembers();
          alert("New member enrolled successfully!");
        }
      });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase()) || 
    m.memberId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Personnel & Patrons
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Member Directory & Smart Passes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage member identities, subscription lifecycles, and access credentials.</p>
        </div>

        <button 
          onClick={() => setAddModal(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Member</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between text-xs shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or Member ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        <span className="text-slate-500 font-mono text-xs hidden sm:inline font-medium">
          {filteredMembers.length} Members Enrolled
        </span>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Member ID</th>
                <th className="p-4">Name & Contact</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Outstanding Fine</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(m => (
                <tr key={m.memberId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700">{m.memberId}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <span className="text-slate-500 text-[11px]">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded text-[11px] font-medium">
                      {m.membershipPlan}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-600">
                    {m.membershipValidUntil ? new Date(m.membershipValidUntil).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="p-4 font-mono font-bold">
                    {m.finesDue > 0 ? <span className="text-amber-600 font-bold">₹{m.finesDue}</span> : <span className="text-slate-400">₹0</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      m.membershipStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {m.membershipStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedMember(m); setCardModal(true); }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[11px] font-semibold transition-colors"
                      title="View Digital Pass"
                    >
                      <QrCode className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                      Pass
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(m.memberId, m.membershipStatus)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                        m.membershipStatus === 'Active' 
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {m.membershipStatus === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Smart Pass Modal for Admin */}
      {cardModal && selectedMember && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setCardModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-6 shadow-2xl relative my-4 sm:my-10 text-center">
            <button 
              onClick={() => setCardModal(false)} 
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900">Member Pass Inspection</h3>
            
            {/* Visual Card representation */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-300 text-left space-y-4 shadow-lg text-white">
              <div className="flex items-center justify-between">
                <img src="/logo.png" alt="Brain Dock" className="h-8 w-auto filter brightness-110" />
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {selectedMember.membershipStatus}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <img src={selectedMember.avatar} alt={selectedMember.name} className="w-14 h-14 rounded-xl object-cover border border-white/20" />
                <div>
                  <h4 className="font-bold text-white text-base">{selectedMember.name}</h4>
                  <p className="text-xs font-mono text-purple-200">{selectedMember.memberId}</p>
                  <p className="text-[11px] text-purple-300">{selectedMember.membershipPlan}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 text-center font-mono text-xs tracking-widest text-purple-200">
                •||| |•|| |||• || •|• RFID VERIFIED
              </div>
            </div>

            <button 
              onClick={() => setCardModal(false)} 
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-all"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* Enroll Member Modal */}
      {addModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setAddModal(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-5 shadow-2xl relative my-4 sm:my-10">
            <button 
              onClick={() => setAddModal(false)} 
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900">Enroll New Member</h3>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Contact Phone</label>
                <input 
                  type="tel" 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Membership Plan</label>
                <select 
                  value={newPlan} 
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="First 50 Admissions Offer">First 50 Admissions Offer (₹849/mo)</option>
                  <option value="Standard Student Membership">Standard Student Membership (₹999/mo)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs transition-all"
                >
                  Enroll Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

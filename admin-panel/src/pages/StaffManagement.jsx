import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Plus, Mail, Phone, X, Check } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function StaffManagement() {
  const { currentStaff } = useAdminAuth();
  const [staffList, setStaffList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Librarian');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    fetch('http://localhost:5000/api/admin/members', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStaffList(data.data.filter(u => u.role !== 'Member'));
        }
      });
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password: 'password123',
        role
      })
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        fetchStaff();
        alert(`Staff member ${name} assigned as ${role}!`);
      });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Personnel & Roles
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Staff Management & RBAC Roles</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage administrative credentials, librarians, accountants, and curators.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map(st => (
          <div key={st.memberId || st.email} className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs hover:border-purple-300 transition-all">
            <div className="flex items-center space-x-4">
              <img src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={st.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">{st.name}</h3>
                <span className="inline-block mt-1 bg-purple-50 text-purple-800 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
                  {st.role}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{st.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span className="font-mono">{st.memberId || 'BDL-STF-001'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 space-y-5 shadow-2xl relative my-4 sm:my-10">
            <button 
              onClick={() => setModalOpen(false)} 
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900">Add Staff Member</h3>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Assigned Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Assistant Librarian">Assistant Librarian</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Content Manager">Content Manager</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

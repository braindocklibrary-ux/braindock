import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Layers, 
  User, 
  BookOpen, 
  Plus,
  X 
} from 'lucide-react';

export default function CirculationManagement() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // Issue modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loanDays, setLoanDays] = useState(14);

  useEffect(() => {
    fetchIssues();
    fetchBooksAndMembers();
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

  const fetchBooksAndMembers = () => {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBooks(data.data);
          if (data.data.length > 0) setSelectedBookId(data.data[0].bookId);
        }
      });

    fetch('http://localhost:5000/api/admin/members', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.data);
          if (data.data.length > 0) setSelectedMemberId(data.data[0].memberId);
        }
      });
  };

  const handleIssueBook = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/issues/issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}`
      },
      body: JSON.stringify({
        bookId: selectedBookId,
        memberId: selectedMemberId,
        days: Number(loanDays)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setModalOpen(false);
          fetchIssues();
          setToast(`Book issued to ${selectedMemberId}!`);
          setTimeout(() => setToast(null), 3000);
        } else {
          alert(data.message || 'Issue failed');
        }
      });
  };

  const handleReturnBook = (issueId) => {
    fetch('http://localhost:5000/api/issues/return', {
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
          fetchIssues();
          setToast("Book returned and restored to shelf stock!");
          setTimeout(() => setToast(null), 3000);
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
          fetchIssues();
          setToast("Loan period extended by 14 days!");
          setTimeout(() => setToast(null), 3000);
        } else {
          alert(data.message || 'Renewal limit reached');
        }
      });
  };

  const filteredIssues = statusFilter === 'All' 
    ? issues 
    : issues.filter(i => i.status === statusFilter);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Circulation Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Book Issue & Return Terminal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage loan lifecycles, returns, renewals, and overdue records.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Book Issue</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200/80 p-1.5 rounded-2xl text-xs font-semibold shadow-xs">
        {['All', 'Issued', 'Overdue', 'Returned'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl transition-all ${
              statusFilter === s ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {s} ({s === 'All' ? issues.length : issues.filter(i => i.status === s).length})
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Issue ID</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Member Name & ID</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Renewals</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map(item => (
                <tr key={item.issueId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700">{item.issueId}</td>
                  <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{item.bookTitle}</td>
                  <td className="p-4">
                    <span className="text-slate-800 font-semibold block">{item.userName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{item.memberId}</span>
                  </td>
                  <td className="p-4 text-slate-600">{new Date(item.issueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-bold text-purple-900">{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-slate-600">{item.renewalsCount || 0} / 2</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'Overdue' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : item.status === 'Returned'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {item.status !== 'Returned' && (
                      <>
                        <button 
                          onClick={() => handleRenewBook(item.issueId)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[11px] font-semibold transition-colors"
                          title="Renew loan"
                        >
                          Renew
                        </button>
                        <button 
                          onClick={() => handleReturnBook(item.issueId)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 transition-colors"
                          title="Return book"
                        >
                          Mark Return
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Issue Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-slate-800 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Circulation Terminal
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Issue Physical Book</h3>
            </div>

            <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Book from Collection</label>
                <select 
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {books.map(b => (
                    <option key={b.bookId} value={b.bookId}>
                      {b.title} ({b.availableCopies} available - {b.shelf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Member ID</label>
                <select 
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  {members.map(m => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.name} ({m.memberId} - {m.membershipPlan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Loan Period (Days)</label>
                <select 
                  value={loanDays}
                  onChange={(e) => setLoanDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value={14}>14 Days (Standard Student Loan)</option>
                  <option value={21}>21 Days (Scholar Tier Loan)</option>
                  <option value={30}>30 Days (Executive Privilege Loan)</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-all"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

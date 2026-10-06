import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function FinancialManagement() {
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/payments')
      .then(res => res.json())
      .then(data => { if (data.success) setPayments(data.data); });

    fetch('http://localhost:5000/api/memberships/plans')
      .then(res => res.json())
      .then(data => { if (data.success) setPlans(data.data); });
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          Treasury & Accounting
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Financial Ledger & Membership Plans</h1>
        <p className="text-xs text-slate-500 mt-0.5">Audit transaction invoices, fine settlements, and subscription revenues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs hover:border-purple-300 transition-all">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Collections</span>
          <h3 className="text-3xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] font-medium text-emerald-600">+18% growth over last month</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs hover:border-purple-300 transition-all">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Invoices</span>
          <h3 className="text-3xl font-extrabold text-slate-900">{payments.length}</h3>
          <p className="text-[11px] font-medium text-purple-700">100% Reconciled</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-2 shadow-xs hover:border-purple-300 transition-all">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Configured Plans</span>
          <h3 className="text-3xl font-extrabold text-slate-900">{plans.length} Tiers</h3>
          <p className="text-[11px] font-medium text-slate-500">Student to Corporate VIP</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Transactions & Invoices</h3>
          <span className="text-xs text-purple-800 bg-purple-50 font-mono font-bold px-2 py-0.5 rounded border border-purple-200">
            PAYMENT GATEWAY
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Member Name</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.transactionId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-700">{p.transactionId}</td>
                  <td className="p-4 font-mono text-slate-500">{p.invoiceNumber}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.userName}</td>
                  <td className="p-4 text-slate-600">{p.purpose}</td>
                  <td className="p-4 font-bold text-slate-900 font-mono">₹{p.amount}</td>
                  <td className="p-4 text-slate-600">{p.paymentMethod}</td>
                  <td className="p-4 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

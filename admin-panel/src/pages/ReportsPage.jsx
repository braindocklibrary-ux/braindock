import React, { useState } from 'react';
import { FileBarChart, Download, Printer, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState('Current Quarter');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'inventory') {
      csvContent += "Category,Total Titles,Total Copies,On Loan,Available Stock\n";
      csvContent += "Computer Science & AI,4280,12400,1200,11200\n";
      csvContent += "Software Engineering,5120,15000,1850,13150\n";
      csvContent += "Artificial Intelligence,3150,9200,1400,7800\n";
      csvContent += "Business & Economics,4890,14200,900,13300\n";
    } else {
      csvContent += "TransactionID,MemberID,Amount,Purpose,Status,Date\n";
      csvContent += "TXN-BDL-99881,BDL-MEM-8842,1299,Membership Fee,Success,2026-09-01\n";
      csvContent += "TXN-BDL-99882,BDL-MEM-9921,499,Membership Fee,Success,2026-09-10\n";
      csvContent += "TXN-BDL-99883,BDL-MEM-7731,350,Locker Rental,Success,2026-09-15\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BrainDock_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Executive Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Institutional Audit & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate compliance reports, inventory audits, and financial statements.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs no-print shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-600 font-semibold">Report Type:</span>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
          >
            <option value="inventory">Comprehensive Inventory Audit</option>
            <option value="circulation">Book Issue & Return Lifecycle</option>
            <option value="overdue">Overdue & Late Fine Recovery</option>
            <option value="financial">Revenue & Subscription Ledger</option>
            <option value="visitors">Turnstile Footfall & Peak Hours</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-600 font-semibold">Period:</span>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
          >
            <option value="Current Month">Current Month (September 2026)</option>
            <option value="Current Quarter">Current Quarter (Q3 2026)</option>
            <option value="Annual">Annual Audit (2025 - 2026)</option>
          </select>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-xs text-slate-700">
        
        {/* Document Official Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Brain Dock" className="h-10 w-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Brain Dock Central Library</h2>
              <p className="text-xs text-purple-700 font-medium">Official Institutional Report • {reportType.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>Audit Ref: BDL-RPT-2026-09</p>
          </div>
        </div>

        {/* Dynamic Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Classification / Metric</th>
                <th className="p-3">Physical Volumes</th>
                <th className="p-3">Active Circulation</th>
                <th className="p-3">Available Shelf Stock</th>
                <th className="p-3">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">Computer Science & AI</td>
                <td className="p-3 font-mono">12,400</td>
                <td className="p-3 font-mono text-purple-700 font-semibold">1,200</td>
                <td className="p-3 font-mono text-emerald-600 font-semibold">11,200</td>
                <td className="p-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Optimal</span></td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">Software Engineering & Architecture</td>
                <td className="p-3 font-mono">15,000</td>
                <td className="p-3 font-mono text-purple-700 font-semibold">1,850</td>
                <td className="p-3 font-mono text-emerald-600 font-semibold">13,150</td>
                <td className="p-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Optimal</span></td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">Artificial Intelligence & Deep Learning</td>
                <td className="p-3 font-mono">9,200</td>
                <td className="p-3 font-mono text-purple-700 font-semibold">1,400</td>
                <td className="p-3 font-mono text-emerald-600 font-semibold">7,800</td>
                <td className="p-3"><span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">High Demand</span></td>
              </tr>
              <tr className="hover:bg-slate-50/70">
                <td className="p-3 font-bold text-slate-900">Business, Strategy & Economics</td>
                <td className="p-3 font-mono">14,200</td>
                <td className="p-3 font-mono text-purple-700 font-semibold">900</td>
                <td className="p-3 font-mono text-emerald-600 font-semibold">13,300</td>
                <td className="p-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">Optimal</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Signed: Director of Academic Curation</span>
          <span className="font-mono text-slate-400">VERIFIED BY BRAIN DOCK SMART SYSTEM</span>
        </div>
      </div>
    </div>
  );
}

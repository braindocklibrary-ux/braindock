import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Calendar, 
  UserCheck, 
  UserPlus, 
  Phone, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  Edit3, 
  X,
  SlidersHorizontal,
  Check,
  FileSpreadsheet
} from 'lucide-react';

// The 12 months in Indian Academic / Financial Year order (April to March)
export const MONTH_COLUMNS = [
  { key: '04', label: '04', name: 'April', quarter: 'Q1' },
  { key: '05', label: '05', name: 'May', quarter: 'Q1' },
  { key: '06', label: '06', name: 'June', quarter: 'Q1' },
  { key: '07', label: '07', name: 'July', quarter: 'Q2' },
  { key: '08', label: '08', name: 'August', quarter: 'Q2' },
  { key: '09', label: '09', name: 'September', quarter: 'Q2' },
  { key: '10', label: '10', name: 'October', quarter: 'Q3' },
  { key: '11', label: '11', name: 'November', quarter: 'Q3' },
  { key: '12', label: '12', name: 'December', quarter: 'Q3' },
  { key: '01', label: '01', name: 'January', quarter: 'Q4' },
  { key: '02', label: '02', name: 'February', quarter: 'Q4' },
  { key: '03', label: '03', name: 'March', quarter: 'Q4' }
];

// Compulsory First 6 Columns
export const COMPULSORY_COLUMNS = [
  { key: 'no', label: 'No.' },
  { key: 'startingDate', label: 'Starting Date' },
  { key: 'seatNo', label: 'Seat No.' },
  { key: 'name', label: 'Name' },
  { key: 'mobileNo', label: 'Mobile No.' },
  { key: 'deposit', label: 'Deposit' }
];

export default function MasterMonthlyRegister({ 
  seats = [], 
  admissions = [], 
  onOpenAddStudent, 
  onOpenEditStudent, 
  onRefreshData,
  onOpenRenew
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'occupied' | 'vacant'
  
  // Selected month columns for display and printing (by default all 12 months are visible)
  const [selectedMonths, setSelectedMonths] = useState(
    MONTH_COLUMNS.map(m => m.key)
  );

  // Print Dialog state
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printScope, setPrintScope] = useState('all'); // 'all' (1-102) | 'occupied' | 'first-half' (1-50) | 'second-half' (51-102)
  const [printOrientation, setPrintOrientation] = useState('landscape'); // 'landscape' | 'portrait'

  // Persistent user manual checkmarks overrides (saved in localStorage)
  const [manualChecks, setManualChecks] = useState(() => {
    try {
      const saved = localStorage.getItem('bdl_master_register_checks');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const saveManualCheck = (key, value) => {
    setManualChecks(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('bdl_master_register_checks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Helper: check if a student was active / paid during a specific month key ('04'..'03')
  const isMonthPaidForAdmission = (admission, monthKey) => {
    if (!admission || !admission.startDate) return false;

    // Check manual override first
    const overrideKey = `${admission.seatNumber}_${monthKey}`;
    if (manualChecks[overrideKey] !== undefined) {
      return manualChecks[overrideKey];
    }

    try {
      const start = new Date(admission.startDate);
      const end = admission.endDate ? new Date(admission.endDate) : new Date(start.getTime() + (admission.durationMonths || 1) * 30 * 86400000);
      
      const targetMonthInt = parseInt(monthKey, 10); // 1 to 12
      
      // Determine academic year for the target month
      // Months 04-12 are in current year (e.g. 2026), months 01-03 are in next year (e.g. 2027)
      const currentYear = start.getFullYear();
      let targetYear = currentYear;
      if (targetMonthInt >= 1 && targetMonthInt <= 3 && start.getMonth() + 1 >= 4) {
        targetYear = currentYear + 1;
      }

      // Check if target month overlaps [start, end]
      const targetMonthStart = new Date(targetYear, targetMonthInt - 1, 1);
      const targetMonthEnd = new Date(targetYear, targetMonthInt, 0);

      const isActiveInMonth = (start <= targetMonthEnd && end >= targetMonthStart);
      return isActiveInMonth;
    } catch (e) {
      return false;
    }
  };

  // Helper: check if deposit is marked
  const isDepositPaid = (admission) => {
    if (!admission) return false;
    const overrideKey = `${admission.seatNumber}_deposit`;
    if (manualChecks[overrideKey] !== undefined) {
      return manualChecks[overrideKey];
    }
    if (admission.securityDeposit && Number(admission.securityDeposit) > 0) return true;
    if (Array.isArray(admission.feeItems)) {
      const hasDep = admission.feeItems.some(it => 
        (it.description || '').toLowerCase().includes('deposit') && Number(it.amount) > 0
      );
      if (hasDep) return true;
    }
    return Boolean(admission.depositPaid);
  };

  // Format date helper: DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const mon = String(d.getMonth() + 1).padStart(2, '0');
      const yr = d.getFullYear();
      return `${day}/${mon}/${yr}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Build the complete 102 rows sequentially (1 to 102)
  const masterRows = useMemo(() => {
    const rows = [];
    for (let sNum = 1; sNum <= 102; sNum++) {
      // Find active admission for this desk
      const adm = admissions.find(a => 
        Number(a.seatNumber) === sNum && 
        a.status !== 'Cancelled' && 
        a.status !== 'Vacated'
      );

      const isOccupied = Boolean(adm);

      const monthsData = {};
      MONTH_COLUMNS.forEach(m => {
        monthsData[m.key] = isOccupied ? isMonthPaidForAdmission(adm, m.key) : false;
      });

      rows.push({
        no: sNum,
        seatNumber: sNum,
        isOccupied,
        admission: adm || null,
        startingDate: isOccupied ? formatDate(adm.startDate) : '',
        seatNo: sNum,
        name: isOccupied ? (adm.studentName || '') : '',
        mobileNo: isOccupied ? (adm.studentPhone || '') : '',
        deposit: isOccupied ? isDepositPaid(adm) : false,
        months: monthsData
      });
    }
    return rows;
  }, [admissions, manualChecks]);

  // Filtered rows for on-screen table
  const displayedRows = useMemo(() => {
    return masterRows.filter(row => {
      // Scope / filter
      if (filterMode === 'occupied' && !row.isOccupied) return false;
      if (filterMode === 'vacant' && row.isOccupied) return false;

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchSeat = String(row.seatNumber).includes(q);
        const matchName = row.name.toLowerCase().includes(q);
        const matchPhone = row.mobileNo.includes(q);
        return matchSeat || matchName || matchPhone;
      }
      return true;
    });
  }, [masterRows, filterMode, searchTerm]);

  // Rows for Printing based on printScope
  const rowsForPrint = useMemo(() => {
    return masterRows.filter(row => {
      if (printScope === 'occupied') return row.isOccupied;
      if (printScope === 'first-half') return row.seatNumber <= 50;
      if (printScope === 'second-half') return row.seatNumber > 50;
      return true; // 'all' (1-102)
    });
  }, [masterRows, printScope]);

  // Statistics
  const totalOccupied = masterRows.filter(r => r.isOccupied).length;
  const totalVacant = 102 - totalOccupied;
  const totalDeposits = masterRows.filter(r => r.deposit).length;

  // Toggle Month Column selection for Print / View
  const toggleMonth = (mKey) => {
    setSelectedMonths(prev => {
      if (prev.includes(mKey)) {
        return prev.filter(k => k !== mKey);
      } else {
        // Keep order 04..03
        const allKeys = MONTH_COLUMNS.map(m => m.key);
        const next = [...prev, mKey];
        return allKeys.filter(k => next.includes(k));
      }
    });
  };

  const handleSelectAllMonths = () => {
    setSelectedMonths(MONTH_COLUMNS.map(m => m.key));
  };

  const handleClearMonths = () => {
    setSelectedMonths([]);
  };

  const handleSelectQuarter = (q) => {
    const qMonths = MONTH_COLUMNS.filter(m => m.quarter === q).map(m => m.key);
    setSelectedMonths(qMonths);
  };

  const handleSelectCurrentMonth = () => {
    const curMonthInt = new Date().getMonth() + 1;
    const curKey = String(curMonthInt).padStart(2, '0');
    setSelectedMonths([curKey]);
  };

  // Toggle checkbox directly on table
  const handleToggleMonthCell = (seatNum, mKey, currentVal, hasStudent) => {
    if (!hasStudent) return; // Empty rows don't toggle
    const overrideKey = `${seatNum}_${mKey}`;
    saveManualCheck(overrideKey, !currentVal);
  };

  const handleToggleDepositCell = (seatNum, currentVal, hasStudent) => {
    if (!hasStudent) return;
    const overrideKey = `${seatNum}_deposit`;
    saveManualCheck(overrideKey, !currentVal);
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV with selected columns
  const handleExportCSV = () => {
    const headerCols = ['No.', 'Starting Date', 'Seat No.', 'Name', 'Mobile No.', 'Deposit'];
    selectedMonths.forEach(mKey => {
      const mObj = MONTH_COLUMNS.find(m => m.key === mKey);
      headerCols.push(`Month ${mKey} (${mObj?.name || ''})`);
    });

    const csvRows = [headerCols.join(',')];

    rowsForPrint.forEach(r => {
      const rowData = [
        r.no,
        `"${r.startingDate || ''}"`,
        r.seatNo,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.mobileNo || ''}"`,
        r.deposit ? 'PAID' : ''
      ];

      selectedMonths.forEach(mKey => {
        rowData.push(r.months[mKey] ? 'PAID' : '');
      });

      csvRows.push(rowData.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrainDock_Master_Register_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* ================= 1. HEADER & KPI CARDS ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-2xl bg-[#5B1484] text-white shadow-md">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    102-Desk Master Monthly Register
                  </h2>
                  <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                    Real-Time Auto Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Seat 1 to 102 master spreadsheet with automatic admission binding, deposit tracking, and monthly fee checkmarks.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPrintModalOpen(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#5B1484] to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-purple-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Register (Select Columns)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                title="Refresh latest admissions"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Desks</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">102 Desks</span>
            <span className="text-[10px] text-slate-500 font-medium">Fixed 1 to 102 Layout</span>
          </div>

          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Occupied (Admitted)</span>
            <span className="text-2xl font-black text-purple-950 mt-0.5 block">{totalOccupied} Students</span>
            <span className="text-[10px] text-purple-700 font-semibold">{((totalOccupied / 102) * 100).toFixed(0)}% Occupancy</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Vacant Desks</span>
            <span className="text-2xl font-black text-emerald-950 mt-0.5 block">{totalVacant} Seats</span>
            <span className="text-[10px] text-emerald-700 font-medium">Auto-cleared on delete</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Deposits Recorded</span>
            <span className="text-2xl font-black text-amber-950 mt-0.5 block">{totalDeposits} Desks</span>
            <span className="text-[10px] text-amber-800 font-semibold">Security Vault Active</span>
          </div>
        </div>
      </div>

      {/* ================= 2. CONTROLS: SEARCH, FILTER & MONTH SELECTOR ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, mobile, or seat #..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-[#5B1484] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 102 Desks
            </button>
            <button
              onClick={() => setFilterMode('occupied')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterMode === 'occupied' ? 'bg-[#5B1484] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Occupied Only ({totalOccupied})
            </button>
            <button
              onClick={() => setFilterMode('vacant')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterMode === 'vacant' ? 'bg-[#5B1484] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vacant Only ({totalVacant})
            </button>
          </div>

          {/* Quick Print Config Shortcut */}
          <button
            onClick={() => setPrintModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer self-start md:self-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
            <span>Customize Columns ({selectedMonths.length}/12 Months Active)</span>
          </button>
        </div>

        {/* Quick Month Filter Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Display Months:
          </span>
          {MONTH_COLUMNS.map(m => {
            const isSelected = selectedMonths.includes(m.key);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => toggleMonth(m.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-[#5B1484] text-white border-[#5B1484] shadow-2xs' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                title={`Toggle month ${m.key} (${m.name})`}
              >
                {m.key}
              </button>
            );
          })}

          <div className="ml-auto flex items-center space-x-2 text-[11px]">
            <button
              onClick={handleSelectAllMonths}
              className="text-purple-700 hover:underline font-bold"
            >
              All 12
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleSelectCurrentMonth}
              className="text-purple-700 hover:underline font-bold"
            >
              Current Month
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleClearMonths}
              className="text-slate-500 hover:underline font-bold"
            >
              Clear
            </button>
          </div>
        </div>

      </div>

      {/* ================= 3. MASTER REGISTER GRID (MATCHING USER'S IMAGE DESIGN) ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Header: Exact Deep Purple Theme from User Screenshot */}
            <thead>
              <tr className="bg-[#5B1484] text-white font-bold text-[11px] tracking-wide select-none">
                <th className="py-3 px-3.5 text-center border-r border-purple-800/80 w-12">No.</th>
                <th className="py-3 px-4 border-r border-purple-800/80 min-w-[110px]">Starting Date</th>
                <th className="py-3 px-3 text-center border-r border-purple-800/80 w-20">Seat No.</th>
                <th className="py-3 px-4 border-r border-purple-800/80 min-w-[180px]">Name</th>
                <th className="py-3 px-4 border-r border-purple-800/80 min-w-[130px]">Mobile No.</th>
                <th className="py-3 px-3 text-center border-r border-purple-800/80 w-20">Deposit</th>

                {/* Dynamically Filtered Month Columns (04 to 03) */}
                {MONTH_COLUMNS.filter(m => selectedMonths.includes(m.key)).map(m => (
                  <th 
                    key={m.key} 
                    className="py-3 px-2.5 text-center border-r border-purple-800/80 w-12 font-mono font-bold"
                    title={`Month ${m.key} (${m.name})`}
                  >
                    {m.key}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body Rows: Alternating Tint Matching User Image */}
            <tbody className="divide-y divide-purple-100 font-medium">
              {displayedRows.map((row, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isEven ? 'bg-white' : 'bg-[#FAF5FF]'; // Soft purple tint matching screenshot
                const hasStudent = row.isOccupied;

                return (
                  <tr 
                    key={row.seatNumber}
                    className={`${rowBg} hover:bg-purple-100/60 transition-colors group`}
                  >
                    
                    {/* 1. No. */}
                    <td className="py-2.5 px-3.5 text-center font-mono text-slate-500 border-r border-purple-100">
                      {row.no}
                    </td>

                    {/* 2. Starting Date */}
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700 border-r border-purple-100">
                      {row.startingDate || (
                        <span className="text-slate-300 select-none">—</span>
                      )}
                    </td>

                    {/* 3. Seat No. */}
                    <td className="py-2.5 px-3 text-center font-mono font-black text-slate-800 border-r border-purple-100">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        hasStudent ? 'bg-purple-100 text-purple-900' : 'text-slate-400'
                      }`}>
                        {row.seatNo}
                      </span>
                    </td>

                    {/* 4. Name */}
                    <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-purple-100">
                      {hasStudent ? (
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-[200px]" title={row.name}>
                            {row.name}
                          </span>
                          {onOpenEditStudent && (
                            <button
                              onClick={() => onOpenEditStudent(row.admission)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-purple-700 hover:bg-purple-200 rounded transition-all ml-1 cursor-pointer"
                              title="Edit student admission"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-300">
                          <span>—</span>
                          {onOpenAddStudent && (
                            <button
                              onClick={() => onOpenAddStudent(row.seatNumber)}
                              className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded bg-[#5B1484] text-white text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
                              title={`Admit student to Seat #${row.seatNumber}`}
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Admit</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 5. Mobile No. */}
                    <td className="py-2.5 px-4 font-mono text-slate-700 border-r border-purple-100">
                      {hasStudent ? (
                        <a 
                          href={`tel:${row.mobileNo}`}
                          className="hover:text-purple-700 hover:underline font-semibold"
                          title="Call or WhatsApp student"
                        >
                          {row.mobileNo}
                        </a>
                      ) : (
                        <span className="text-slate-300 select-none">—</span>
                      )}
                    </td>

                    {/* 6. Deposit Checkbox (Interactive & Exact Box Appearance) */}
                    <td className="py-2.5 px-3 text-center border-r border-purple-100">
                      <button
                        type="button"
                        onClick={() => handleToggleDepositCell(row.seatNumber, row.deposit, hasStudent)}
                        disabled={!hasStudent}
                        className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-all cursor-pointer ${
                          row.deposit 
                            ? 'bg-[#5B1484] border-[#5B1484] text-white shadow-2xs' 
                            : 'border-purple-600/70 bg-white hover:bg-purple-50 disabled:border-slate-300 disabled:hover:bg-white disabled:cursor-default'
                        }`}
                        title={hasStudent ? (row.deposit ? 'Deposit Paid (Click to toggle)' : 'Deposit Pending (Click to toggle)') : 'Vacant Seat'}
                      >
                        {row.deposit && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>

                    {/* Month Checkboxes (04 to 03) */}
                    {MONTH_COLUMNS.filter(m => selectedMonths.includes(m.key)).map(m => {
                      const isPaid = row.months[m.key];
                      return (
                        <td 
                          key={m.key} 
                          className="py-2.5 px-2 text-center border-r border-purple-100"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleMonthCell(row.seatNumber, m.key, isPaid, hasStudent)}
                            disabled={!hasStudent}
                            className={`w-5 h-5 rounded border-2 inline-flex items-center justify-center transition-all cursor-pointer ${
                              isPaid 
                                ? 'bg-[#5B1484] border-[#5B1484] text-white shadow-2xs' 
                                : 'border-purple-600/70 bg-white hover:bg-purple-50 disabled:border-slate-300 disabled:hover:bg-white disabled:cursor-default'
                            }`}
                            title={hasStudent ? `Month ${m.key} (${m.name}) - ${isPaid ? 'Paid' : 'Unpaid'} (Click to toggle)` : 'Vacant Seat'}
                          >
                            {isPaid && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Status Bar */}
        <div className="p-3.5 px-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">Showing {displayedRows.length} of 102 Desks</span>
            <span>•</span>
            <span>Click any checkbox to toggle payment / deposit status.</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-purple-900">
              <span className="w-3 h-3 rounded bg-[#5B1484] inline-block"></span>
              <span>Paid / Active</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
              <span className="w-3 h-3 rounded border border-purple-600 bg-white inline-block"></span>
              <span>Pending</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= 4. PRINT CONFIGURATION MODAL ================= */}
      {printModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setPrintModalOpen(false); }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-slate-800 space-y-6 shadow-2xl relative my-3 sm:my-8">
            <button 
              onClick={() => setPrintModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-mono text-purple-800 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Official Register Print Engine
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Print Master Monthly Register
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pehle 6 columns compulsory hain. Uske bad jin months ki print nikalni hai unhe select karein.
              </p>
            </div>

            {/* SECTION 1: COMPULSORY COLUMNS (LOCKED) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  <span>Compulsory Columns (Always Printed)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  6 Columns Locked
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs font-semibold text-slate-700">
                {COMPULSORY_COLUMNS.map(col => (
                  <div key={col.key} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <CheckSquare className="w-4 h-4 text-[#5B1484]" />
                    <span>{col.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: SELECTABLE MONTH COLUMNS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  <span>Select Month Columns to Print ({selectedMonths.length}/12 Selected)</span>
                </span>

                {/* Quick Presets */}
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllMonths}
                    className="text-purple-700 hover:underline font-bold"
                  >
                    All 12
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleSelectCurrentMonth}
                    className="text-purple-700 hover:underline font-bold"
                  >
                    Current Month
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleClearMonths}
                    className="text-slate-500 hover:underline font-bold"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MONTH_COLUMNS.map(m => {
                  const isChecked = selectedMonths.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleMonth(m.key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-xs font-bold ${
                        isChecked 
                          ? 'bg-purple-50 text-purple-950 border-purple-500 shadow-2xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#5B1484]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-mono">{m.key}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans font-normal">{m.name.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quarter Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quarters:</span>
                <button
                  type="button"
                  onClick={() => handleSelectQuarter('Q1')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-semibold cursor-pointer"
                >
                  Q1 (04, 05, 06)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuarter('Q2')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-semibold cursor-pointer"
                >
                  Q2 (07, 08, 09)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuarter('Q3')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-semibold cursor-pointer"
                >
                  Q3 (10, 11, 12)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuarter('Q4')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 text-xs font-semibold cursor-pointer"
                >
                  Q4 (01, 02, 03)
                </button>
              </div>
            </div>

            {/* SECTION 3: PRINT ROW SCOPE & OPTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Print Scope (Rows)</label>
                <select
                  value={printScope}
                  onChange={(e) => setPrintScope(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="all">All 102 Desks (Blank lines included for manual handwriting)</option>
                  <option value="occupied">Occupied Desks Only ({totalOccupied} Students)</option>
                  <option value="first-half">Desks 1 to 50 (Batch 1)</option>
                  <option value="second-half">Desks 51 to 102 (Batch 2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Print Orientation</label>
                <select
                  value={printOrientation}
                  onChange={(e) => setPrintOrientation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="landscape">Landscape (Recommended for multiple months)</option>
                  <option value="portrait">Portrait (Best when printing 1-3 months)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintModalOpen(false);
                  setTimeout(() => handlePrint(), 200);
                }}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#5B1484] to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document Now (Print / Save as PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 5. DEDICATED PRINT AREA (SHOWN ONLY DURING WINDOW.PRINT()) ================= */}
      <div id="print-master-register-area" className="hidden print:block font-sans text-black bg-white p-2">
        
        {/* Style injection for exact paper sizing and hide rest of admin UI */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-master-register-area, #print-master-register-area * {
              visibility: visible;
            }
            #print-master-register-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background: white !important;
              color: black !important;
            }
            @page {
              size: ${printOrientation};
              margin: 8mm;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        ` }} />

        {/* Letterhead Header */}
        <div className="border-b-2 border-black pb-2 mb-3 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">
              Brain Dock Library — Master Admission & Monthly Fee Register
            </h1>
            <p className="text-[10px] text-gray-700 font-semibold">
              2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601 • Helpline: +91 63 5600 6100
            </p>
          </div>
          <div className="text-right text-[10px] font-mono">
            <p className="font-bold">Academic Year: 2026-27</p>
            <p>Printed on: {new Date().toLocaleDateString('en-GB')}</p>
            <p>Total Desks Printed: {rowsForPrint.length}</p>
          </div>
        </div>

        {/* Printable Table */}
        <table className="w-full text-left text-[10px] border border-black border-collapse">
          <thead>
            <tr className="bg-gray-200 text-black font-bold border-b border-black">
              <th className="p-1 border border-black text-center w-8">No.</th>
              <th className="p-1 border border-black min-w-[70px]">Starting Date</th>
              <th className="p-1 border border-black text-center w-12">Seat No.</th>
              <th className="p-1 border border-black min-w-[140px]">Name</th>
              <th className="p-1 border border-black min-w-[85px]">Mobile No.</th>
              <th className="p-1 border border-black text-center w-12">Deposit</th>

              {MONTH_COLUMNS.filter(m => selectedMonths.includes(m.key)).map(m => (
                <th key={m.key} className="p-1 border border-black text-center font-mono w-8">
                  {m.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowsForPrint.map((row) => (
              <tr key={row.seatNumber} className="border-b border-gray-300">
                <td className="p-1 border border-black text-center font-mono font-bold">{row.no}</td>
                <td className="p-1 border border-black font-mono">{row.startingDate || ''}</td>
                <td className="p-1 border border-black text-center font-mono font-black">{row.seatNo}</td>
                <td className="p-1 border border-black font-bold uppercase truncate max-w-[160px]">{row.name || ''}</td>
                <td className="p-1 border border-black font-mono">{row.mobileNo || ''}</td>
                <td className="p-1 border border-black text-center font-bold">
                  {row.deposit ? '✓' : '□'}
                </td>

                {MONTH_COLUMNS.filter(m => selectedMonths.includes(m.key)).map(m => (
                  <td key={m.key} className="p-1 border border-black text-center font-bold font-mono">
                    {row.months[m.key] ? '✓' : '□'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Footer */}
        <div className="mt-6 pt-3 border-t border-gray-400 flex items-center justify-between text-[10px] text-gray-700">
          <span>Prepared by: Brain Dock Automated ERP Terminal</span>
          <span className="font-bold">Authorized Signature / Director: ____________________</span>
        </div>

      </div>

    </div>
  );
}

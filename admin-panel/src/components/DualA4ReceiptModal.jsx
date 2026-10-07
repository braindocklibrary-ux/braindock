import React from 'react';
import { Printer, X, CheckCircle2, ShieldCheck, Scissors } from 'lucide-react';

export default function DualA4ReceiptModal({ receipt, isOpen, onClose }) {
  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper to render one copy of the receipt
  const renderSingleReceipt = (copyType, copyColor) => {
    const isStudentCopy = copyType === 'STUDENT COPY';
    return (
      <div className="receipt-single-box border-2 border-slate-800 rounded-xl p-3.5 sm:p-4 bg-white text-slate-900 relative">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2.5">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Brain Dock Library" 
              className="h-10 w-auto object-contain filter contrast-125"
            />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-slate-950 font-serif leading-none">
                BRAIN DOCK LIBRARY & STUDY SANCTUARY
              </h2>
              <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                24/7 Intelligent Digital Research Commons & Dedicated Reading Desks
              </p>
              <p className="text-[9px] text-slate-500 font-mono">
                Silicon Corridor, Knowledge Zone, Gujarat • Helpline: +91 63 5600 6100 • Reg: BDL-REG-2026-GUJ
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`inline-block font-mono font-black text-[10px] px-2.5 py-0.5 rounded tracking-wider text-white ${
              isStudentCopy ? 'bg-purple-900' : 'bg-slate-900'
            }`}>
              {copyType}
            </span>
            <p className="text-xs font-mono font-black text-purple-900 mt-1">
              {receipt.receiptNumber}
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              Date: <strong>{receipt.date}</strong>
            </p>
          </div>
        </div>

        {/* Student & Seat Grid */}
        <div className="grid grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2.5">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Student Name:</span>
            <strong className="text-slate-950 text-xs block truncate">{receipt.studentName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Contact Mobile:</span>
            <strong className="text-slate-900 font-mono text-[11px] block">{receipt.studentPhone}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Allocated Desk:</span>
            <strong className="text-purple-950 font-black text-xs font-mono block bg-purple-100/80 px-1.5 py-0.2 rounded w-fit border border-purple-300">
              SEAT #{receipt.seatNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Machine PIN / ID:</span>
            <strong className="text-slate-900 font-mono text-[11px] block">
              PIN #{receipt.biometricEnrollmentId || receipt.seatNumber || '01'}
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Shift & Hours:</span>
            <strong className="text-slate-800 text-[10px] block truncate">{receipt.shift || 'Full Day (24x7)'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Plan Duration:</span>
            <strong className="text-slate-800 text-[10px] block">{receipt.plan || 'Monthly'}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Membership Validity:</span>
            <strong className="text-emerald-950 font-mono text-[11px] block">
              {receipt.validFrom} <span className="text-slate-400">TO</span> {receipt.validTo}
            </strong>
          </div>
        </div>

        {/* Financial Breakdown Table */}
        {(() => {
          const items = (receipt.feeItems && Array.isArray(receipt.feeItems) && receipt.feeItems.length > 0)
            ? receipt.feeItems
            : [{ description: `Dedicated Study Desk #${receipt.seatNumber} & Facility Pass`, amount: receipt.totalFee }];

          return (
            <div className="mt-2 border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-1 px-2.5">Item Description (विवरण)</th>
                    <th className="py-1 px-2 text-right">Amount (रकम)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 px-2.5">
                        <strong className="text-slate-900">{item.description}</strong>
                      </td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">
                        ₹{item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-[10px]">
                  <tr>
                    <td className="py-1 px-2.5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[9px] text-slate-700">
                        <span>Payment Mode: <strong className="font-mono text-slate-900">{receipt.paymentMode || 'UPI'}</strong></span>
                        <span>Ref / UTR: <strong className="font-mono text-slate-900">{receipt.transactionRef || 'OFFLINE-DESK'}</strong></span>
                      </div>
                    </td>
                    <td className="py-1 px-2 text-right">
                      <div className="space-y-0.5 text-right font-mono">
                        <div className="text-[10px]">Total Agreed: <strong className="font-bold text-slate-950">₹{receipt.totalFee}</strong></div>
                        <div className="text-[10px] text-emerald-800">Paid: <strong className="font-bold text-emerald-800">₹{receipt.amountPaid}</strong></div>
                        {receipt.pendingDue > 0 ? (
                          <div className="text-[10px] text-rose-700 font-bold">Due: ₹{receipt.pendingDue}</div>
                        ) : (
                          <div className="text-[9px] text-slate-500">Due: ₹0 (NIL)</div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {/* Signature Section (Left: Student Sign, Right: Library Authorized Sign - Stamp Removed as Requested) */}
        <div className="mt-3 pt-2 border-t border-slate-300 flex items-end justify-between">
          {/* 1. Student Signature */}
          <div className="space-y-1">
            <div className="border-b border-slate-500 w-44 h-8 flex items-end">
              <span className="text-[8px] text-slate-400 italic mb-0.5">student signature...</span>
            </div>
            <p className="text-[9px] font-bold text-slate-800 leading-tight">Student Signature (विद्यार्थी हस्ताक्षर)</p>
            <p className="text-[8px] text-slate-600 font-mono">
              Name: <strong>{receipt.studentName}</strong>
            </p>
          </div>

          {/* 2. Authorized Signatory */}
          <div className="space-y-1 text-right">
            <div className="border-b border-slate-500 w-44 h-8 ml-auto flex items-end justify-end">
              <span className="font-serif italic text-[11px] text-slate-800 font-bold mb-0.5">Dr. Keval Patel</span>
            </div>
            <p className="text-[9px] font-bold text-slate-800 leading-tight">Authorized Signatory (अधिकृत हस्ताक्षर)</p>
            <p className="text-[8px] text-slate-500 font-mono">
              Brain Dock Library Administration • Date: <strong>{receipt.date}</strong>
            </p>
          </div>
        </div>

        {/* Terms footer */}
        <div className="mt-1.5 pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500 font-mono">
          <span>* Fees once paid are non-refundable. Biometric punch mandatory for entry & exit. Strict silence.</span>
          <span className="font-bold text-slate-700">Computer Generated Official Receipt</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-start justify-center animate-in fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      
      {/* Print-specific Stylesheet injected inline */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
          }
          /* Hide everything in print */
          body * {
            visibility: hidden !important;
          }
          /* Only make the printable receipt container visible */
          #printable-a4-dual-receipt, #printable-a4-dual-receipt * {
            visibility: visible !important;
          }
          #printable-a4-dual-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          .receipt-single-box {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-2 sm:my-6 border border-slate-300 text-slate-900 print:p-0 print:border-none print:shadow-none print:m-0">
        
        {/* Modal Controls - Sticky at Top (Hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-200 no-print space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 font-mono uppercase tracking-wider">
                A4 DUAL RECEIPT (2 प्रति: विद्यार्थी + कार्यालय)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Single A4 Page • 2 Receipts with Perforated Cut Line
              </span>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <button 
                onClick={handlePrint}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF (लैपटॉप में PDF सेव करें)</span>
              </button>
              <button 
                onClick={onClose}
                className="px-3 py-1.5 text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-300 rounded-xl transition-colors font-bold text-xs flex items-center space-x-1 cursor-pointer"
                title="Close (ESC)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5 text-[11px] text-purple-900 flex items-center justify-between">
            <span>💡 <strong>लैपटॉप में रसीद सेव करने के लिए:</strong> ऊपर <strong>"Print / Save as PDF"</strong> बटन दबाएं &gt; प्रिंट विंडो में Destination / Printer में <strong>"Save as PDF"</strong> चुनें और सेव करें।</span>
          </div>
        </div>

        {/* Printable Container: 2 Receipts Stacked for 1 A4 Page */}
        <div id="printable-a4-dual-receipt" className="space-y-2.5 mt-3">
          
          {/* 1. TOP RECEIPT: STUDENT COPY */}
          {renderSingleReceipt('STUDENT COPY', 'purple')}

          {/* 2. PERFORATED CUTTING LINE BETWEEN RECEIPT 1 & 2 */}
          <div className="py-1 text-center relative flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-slate-400"></div>
            <div className="absolute bg-white px-3 text-[9px] text-slate-500 font-mono tracking-widest uppercase flex items-center space-x-1.5 border border-slate-300 rounded-full shadow-2xs">
              <Scissors className="w-3 h-3 text-slate-600 rotate-90" />
              <span>✂ CUT ALONG DOTTED LINE • यहाँ से कैंची से काटें • (STUDENT COPY TOP / OFFICE COPY BOTTOM) ✂</span>
            </div>
          </div>

          {/* 3. BOTTOM RECEIPT: OFFICE / LIBRARY COPY */}
          {renderSingleReceipt('OFFICE / LIBRARY COPY', 'slate')}

        </div>

      </div>
    </div>
  );
}

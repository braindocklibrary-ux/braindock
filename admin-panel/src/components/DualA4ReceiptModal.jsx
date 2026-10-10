import React from 'react';
import { Printer, X, Scissors } from 'lucide-react';

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

  // Helper to render one copy of the receipt (fills exact half of A4 page in print)
  const renderSingleReceipt = (copyType) => {
    const isStudentCopy = copyType === 'STUDENT COPY';
    return (
      <div className="receipt-single-box border-2 border-slate-900 rounded-lg p-2.5 sm:p-3 bg-white text-slate-900 relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1">
          <div className="flex items-center space-x-2.5">
            <img 
              src="/logo.png" 
              alt="Brain Dock Library" 
              className="h-9 w-auto object-contain filter contrast-125"
            />
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-950 font-serif leading-none">
                BRAIN DOCK LIBRARY
              </h2>
              <p className="text-[9px] text-slate-600 font-semibold mt-0.5 leading-tight">
                24/7 Intelligent Digital Research Commons & Dedicated Reading Desks
              </p>
              <p className="text-[8px] text-slate-500 font-mono mt-0.5 leading-none">
                2nd Floor, Jay Complex, Near Gandhi Baug, Amreli - 365601 • Helpline: +91 63 5600 6100
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`inline-block font-mono font-black text-[8.5px] px-2 py-0.5 rounded tracking-wider text-white ${
              isStudentCopy ? 'bg-purple-900' : 'bg-slate-900'
            }`}>
              {copyType}
            </span>
            <p className="text-[11px] font-mono font-black text-purple-900 mt-0.5 leading-none">
              {receipt.receiptNumber}
            </p>
            <p className="text-[8px] text-slate-500 font-mono mt-0.5 leading-none">
              Date: <strong>{receipt.date}</strong>
            </p>
          </div>
        </div>

        {/* Student & Seat Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-[8.5px] bg-slate-50 p-1.5 rounded-md border border-slate-200 mt-1.5">
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Student Name:</span>
            <strong className="text-slate-950 text-[10px] block truncate">{receipt.studentName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Contact Mobile:</span>
            <strong className="text-slate-900 font-mono text-[9.5px] block">{receipt.studentPhone}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Allocated Desk:</span>
            <strong className="text-purple-950 font-black text-[9.5px] font-mono block bg-purple-100/90 px-1 py-0.2 rounded w-fit border border-purple-300">
              SEAT #{receipt.seatNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Machine PIN / ID:</span>
            <strong className="text-slate-900 font-mono text-[9.5px] block">
              PIN #{receipt.biometricEnrollmentId || receipt.seatNumber || '01'}
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Shift & Hours:</span>
            <strong className="text-slate-800 text-[8.5px] block truncate">{receipt.shift || 'Full Day (24x7)'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Plan Duration:</span>
            <strong className="text-slate-800 text-[8.5px] block">{receipt.plan || 'Monthly'}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[7.5px] uppercase font-bold">Membership Validity:</span>
            <strong className="text-emerald-950 font-mono text-[9.5px] block">
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
            <div className="mt-1.5 border border-slate-300 rounded-md overflow-hidden">
              <table className="w-full text-[8.5px] text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-0.5 px-2">Item Description</th>
                    <th className="py-0.5 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-0.5 px-2">
                        <strong className="text-slate-900">{item.description}</strong>
                      </td>
                      <td className="py-0.5 px-2 text-right font-mono font-bold text-slate-900">
                        ₹{item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-300 font-semibold text-[8.5px]">
                  <tr>
                    <td className="py-0.5 px-2">
                      <div className="flex flex-wrap items-center gap-x-3 text-[8px] text-slate-700">
                        <span>Mode: <strong className="font-mono text-slate-900">{receipt.paymentMode || 'UPI'}</strong></span>
                        <span>Ref: <strong className="font-mono text-slate-900">{receipt.transactionRef || 'OFFLINE-DESK'}</strong></span>
                      </div>
                    </td>
                    <td className="py-0.5 px-2 text-right">
                      <div className="flex items-center justify-end space-x-2 text-right font-mono text-[8.5px]">
                        <span>Total: <strong className="font-bold text-slate-950">₹{receipt.totalFee}</strong></span>
                        <span className="text-emerald-800">Paid: <strong className="font-bold">₹{receipt.amountPaid}</strong></span>
                        {receipt.pendingDue > 0 ? (
                          <span className="text-rose-700 font-bold">Due: ₹{receipt.pendingDue}</span>
                        ) : (
                          <span className="text-slate-500">Due: ₹0</span>
                        )}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })()}

        {/* Signature Section */}
        <div className="mt-2 pt-1 border-t border-slate-300 flex items-end justify-between">
          {/* 1. Student Signature */}
          <div>
            <div className="border-b border-slate-500 w-36 sm:w-40 h-5 flex items-end">
              <span className="text-[7px] text-slate-400 italic">student signature...</span>
            </div>
            <p className="text-[8.5px] font-bold text-slate-800 leading-tight mt-0.5">Student Signature</p>
            <p className="text-[7.5px] text-slate-600 font-mono leading-none">
              Name: <strong>{receipt.studentName}</strong>
            </p>
          </div>

          {/* 2. Library Representative */}
          <div className="text-right">
            <div className="border-b border-slate-500 w-36 sm:w-40 h-5 ml-auto"></div>
            <p className="text-[8.5px] font-bold text-slate-800 leading-tight mt-0.5">Library Representative</p>
            <p className="text-[7.5px] text-slate-500 font-mono leading-none">
              Brain Dock Library Administration • Date: <strong>{receipt.date}</strong>
            </p>
          </div>
        </div>

        {/* Terms footer */}
        <div className="mt-1 pt-0.5 border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-500 font-mono leading-none">
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
      
      {/* Print-specific Stylesheet: Exact 1-Page A4 Full Coverage (50% Student Copy + 50% Office Copy) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 8mm !important;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }
          /* Hide everything outside receipt modal in print */
          body * {
            visibility: hidden !important;
          }
          /* Only make the printable receipt container visible */
          #printable-a4-dual-receipt, #printable-a4-dual-receipt * {
            visibility: visible !important;
          }
          #printable-a4-dual-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 287mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: white !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          .receipt-single-box {
            width: 100% !important;
            height: 48.5% !important;
            max-height: 139mm !important;
            box-sizing: border-box !important;
            border: 1.5px solid #0f172a !important;
            border-radius: 6px !important;
            padding: 3.5mm 5mm !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          .receipt-cut-line {
            height: 3% !important;
            max-height: 7mm !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-2 sm:my-6 border border-slate-300 text-slate-900 print:p-0 print:border-none print:shadow-none print:m-0">
        
        {/* Modal Controls - Sticky at Top (Hidden in print) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-200 no-print space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 font-mono uppercase tracking-wider">
                A4 DUAL RECEIPT (STUDENT COPY + OFFICE COPY)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Full A4 Page • 2 Balanced Receipts with Perforated Cut Line
              </span>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <button 
                onClick={handlePrint}
                className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
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
            <span>💡 <strong>To save receipt as PDF:</strong> Click <strong>"Print / Save as PDF"</strong> above and select <strong>"Save as PDF"</strong> in the destination dropdown.</span>
          </div>
        </div>

        {/* Printable Container: 2 Receipts Stacked to Cover Full A4 Page */}
        <div id="printable-a4-dual-receipt" className="space-y-2 mt-3">
          
          {/* 1. TOP RECEIPT: STUDENT COPY (Upper Half of A4) */}
          {renderSingleReceipt('STUDENT COPY', 'purple')}

          {/* 2. PERFORATED CUTTING LINE IN THE CENTER */}
          <div className="receipt-cut-line py-1 text-center relative flex items-center justify-center my-1">
            <div className="w-full border-t border-dashed border-slate-400"></div>
            <div className="absolute bg-white px-3 text-[8.5px] text-slate-500 font-mono tracking-widest uppercase flex items-center space-x-1.5 border border-slate-300 rounded-full shadow-2xs">
              <Scissors className="w-3 h-3 text-slate-600 rotate-90" />
              <span>✂ CUT ALONG DOTTED LINE • (STUDENT COPY TOP / OFFICE COPY BOTTOM) ✂</span>
            </div>
          </div>

          {/* 3. BOTTOM RECEIPT: OFFICE / LIBRARY COPY (Lower Half of A4) */}
          {renderSingleReceipt('OFFICE / LIBRARY COPY', 'slate')}

        </div>

      </div>
    </div>
  );
}

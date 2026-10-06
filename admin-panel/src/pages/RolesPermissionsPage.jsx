import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export default function RolesPermissionsPage() {
  const roles = ['Super Admin', 'Admin', 'Librarian', 'Staff', 'Accountant', 'Content Manager'];
  const modules = [
    { name: 'Dashboard Overview', roles: [true, true, true, true, true, true] },
    { name: 'Books Catalogue & Add/Edit', roles: [true, true, true, false, false, false] },
    { name: 'Circulation (Issue/Return)', roles: [true, true, true, true, false, false] },
    { name: 'Book Reservations', roles: [true, true, true, false, false, false] },
    { name: 'Members Management', roles: [true, true, true, false, false, false] },
    { name: 'Staff Management', roles: [true, false, false, false, false, false] },
    { name: 'Study Rooms & Seats', roles: [true, true, true, true, false, false] },
    { name: 'Lockers Bay', roles: [true, true, true, true, false, false] },
    { name: 'Payments & Invoices', roles: [true, true, false, false, true, false] },
    { name: 'Fines Collection', roles: [true, true, true, false, true, false] },
    { name: 'Events & Workshops', roles: [true, true, false, false, false, true] },
    { name: 'Announcements', roles: [true, true, false, false, false, true] },
    { name: 'Web Content & Gallery', roles: [true, true, false, false, false, true] },
    { name: 'Institutional Reports', roles: [true, true, true, false, true, false] },
    { name: 'Audit Logs', roles: [true, true, false, false, false, false] },
    { name: 'System Settings & Cloudinary', roles: [true, false, false, false, false, false] }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          Access Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-500 mt-0.5">Enforce granular operational privileges across administrative tiers.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Module / Operational Scope</th>
                {roles.map(r => (
                  <th key={r} className="p-4 text-center font-bold">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-slate-900">{m.name}</td>
                  {m.roles.map((hasAccess, rIdx) => (
                    <td key={rIdx} className="p-4 text-center">
                      {hasAccess ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

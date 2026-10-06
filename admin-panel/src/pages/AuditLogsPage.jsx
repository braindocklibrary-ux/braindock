import React, { useState, useEffect } from 'react';
import { History, Shield, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bdl_token') || 'demo'}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setLogs(data.data); });
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] uppercase tracking-wider font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          Security Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">System Audit & Compliance Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">Immutable record of administrative operations, catalog changes, and member transactions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, i) => (
                <tr key={log.id || i} className="hover:bg-slate-50/70">
                  <td className="p-4 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{log.actorName}</td>
                  <td className="p-4 font-mono text-[11px] text-purple-800">{log.actorRole}</td>
                  <td className="p-4 font-semibold text-emerald-700">{log.action}</td>
                  <td className="p-4 text-slate-600">{log.module}</td>
                  <td className="p-4 text-slate-500">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

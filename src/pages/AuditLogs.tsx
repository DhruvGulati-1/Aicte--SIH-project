import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { AuditLogItem } from '../types/index.js';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, [targetFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        targetType: targetFilter === 'ALL' ? undefined : targetFilter,
        search: search || undefined
      });
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Statutory Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, tamper-evident chronological ledger of all regulatory transitions, scrutinies, and decisions.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <RefreshCw size={13} className="text-slate-500" />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Actor Name, Action, or Record ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadLogs()}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <select
          value={targetFilter}
          onChange={e => setTargetFilter(e.target.value)}
          className="text-xs py-2 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden text-slate-700 font-medium"
        >
          <option value="ALL">All Target Types</option>
          <option value="APPLICATION">Applications</option>
          <option value="DOCUMENT">Documents</option>
          <option value="COMPLIANCE">Compliance</option>
          <option value="EVC">Expert Visits (EVC)</option>
          <option value="AI_AGENT">AI Agents</option>
          <option value="SYSTEM">System & Logins</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading tamper-evident ledger...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No audit records matching search parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Type & ID</th>
                  <th className="py-3 px-4">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 font-sans whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-sans font-semibold">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{log.targetType}</span> · {log.targetId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans text-xs">
                      {log.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Filter,
  Plus,
  Bot,
  Sparkles,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { ComplianceItem, DocumentRecord, AgentComplianceResult } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

export const Compliance: React.FC = () => {
  const { user } = useAuth();
  const [complianceList, setComplianceList] = useState<ComplianceItem[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Agent 2 Compliance Monitoring state
  const [agentResult, setAgentResult] = useState<AgentComplianceResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Verify Modal
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [verifyStatus, setVerifyStatus] = useState('COMPLIANT');
  const [verifyComments, setVerifyComments] = useState('');

  useEffect(() => {
    loadComplianceData();
  }, [statusFilter]);

  async function loadComplianceData() {
    setLoading(true);
    try {
      const [compRes, expRes] = await Promise.all([
        api.getCompliance({ status: statusFilter === 'ALL' ? undefined : statusFilter }),
        api.getExpiringDocuments(30)
      ]);
      setComplianceList(compRes.items);
      setExpiringDocs(expRes.documents);
    } catch (err) {
      console.error('Failed to load compliance records:', err);
    } finally {
      setLoading(false);
    }
  }

  const runAgent = async () => {
    setAgentLoading(true);
    try {
      // Evaluate for first institution or default
      const instId = complianceList[0]?.institutionId || 'inst-001';
      const res = await api.runComplianceAgent(instId);
      setAgentResult(res);
    } catch (err) {
      console.error('Compliance Agent failed:', err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!selectedItem) return;
    try {
      await api.verifyCompliance(selectedItem.id, verifyStatus, verifyComments);
      setSelectedItem(null);
      setVerifyComments('');
      await loadComplianceData();
    } catch (err: any) {
      alert(`Error verifying: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regulatory Compliance Monitor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time statutory tracking of fire safety, land titles, anti-ragging mandates, and expiring credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAgent}
            disabled={agentLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
          >
            <Bot size={14} />
            {agentLoading ? 'Agent 2 Evaluating...' : 'Run Compliance Monitoring Agent'}
          </button>
        </div>
      </div>

      {/* Expiring in 30 Days Alert Callout */}
      {expiringDocs.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Attention: {expiringDocs.length} Statutory Document(s) Expiring in &le; 30 Days</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {expiringDocs.map(d => `${d.fileName} (${d.expiryDate})`).join(', ')}. Automated reminder notices dispatched.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className="px-3 py-1.5 text-xs font-semibold bg-white text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition-colors shrink-0"
          >
            Filter Expiring Items
          </button>
        </div>
      )}

      {/* AI Agent 2 Results */}
      {agentResult && (
        <div className="p-5 rounded-xl bg-white border border-indigo-200 shadow-2xs text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <div>
              <span className="font-bold text-indigo-900">Agent 2: Compliance Monitoring Assessment</span>
              <p className="text-[11px] text-slate-500">Model: {agentResult.modelUsed} · Temporal Calculation Engine</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Overall Rate: </span>
              <span className="text-base font-extrabold text-blue-700">{agentResult.overallComplianceRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentResult.findings.map((f, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{f.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    f.status === 'EXPIRED' || f.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{f.actionRequired}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-medium">
        {['ALL', 'COMPLIANT', 'PENDING', 'OVERDUE', 'EXPIRED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === st
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'All Items' : st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading compliance mandates...
          </div>
        ) : complianceList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No compliance items matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Requirement Title</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complianceList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {item.requirementCode}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{item.requiredEvidence}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {item.institutionName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {item.dueDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {item.verifiedBy || 'Unverified'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        Verify Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VERIFY COMPLIANCE MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Verify Statutory Compliance</h3>
            <p className="text-xs text-slate-500">{selectedItem.title} · {selectedItem.institutionName}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status Verification *</label>
                <select
                  value={verifyStatus}
                  onChange={e => setVerifyStatus(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                >
                  <option value="COMPLIANT">Compliant (Verified Valid Evidence)</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="OVERDUE">Overdue (Issue Show-Cause Notice)</option>
                  <option value="EXPIRED">Expired Certificate</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reviewer Endorsement Comments</label>
                <textarea
                  rows={3}
                  placeholder="Record verification notes, certificate registration numbers, or deficiencies..."
                  value={verifyComments}
                  onChange={e => setVerifyComments(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs"
              >
                Save Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

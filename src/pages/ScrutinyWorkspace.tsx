import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { Application, DocumentRecord, AgentScrutinyResult } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

export const ScrutinyWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFindings, setAiFindings] = useState<AgentScrutinyResult | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await api.getApplications();
      setApplications(res.applications);
      if (res.applications.length > 0) {
        setSelectedAppId(res.applications[0].id);
        await selectApplication(res.applications[0].id);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function selectApplication(id: string) {
    setSelectedAppId(id);
    try {
      const res = await api.getApplication(id);
      setSelectedApp(res.application);
      setDocuments(res.documents);
      setAiFindings(null); // reset until run
    } catch (err) {
      console.error('Failed to load application detail:', err);
    }
  }

  const runAiScrutiny = async () => {
    if (!selectedAppId) return;
    setAiLoading(true);
    try {
      const res = await api.runScrutinyAgent(selectedAppId);
      setAiFindings(res);
    } catch (err) {
      console.error('Scrutiny agent execution failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateDocStatus = (docId: string, newStatus: any) => {
    setDocuments(prev =>
      prev.map(d => (d.id === docId ? { ...d, status: newStatus, verifiedBy: user?.name, verifiedAt: new Date().toISOString() } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Scrutiny Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Examine submitted statutory documents, identify discrepancies, and generate verified scrutiny memos.
          </p>
        </div>
        <button
          onClick={runAiScrutiny}
          disabled={aiLoading || !selectedAppId}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
        >
          <Sparkles size={14} />
          {aiLoading ? 'Agent 1 Scanning Documents...' : 'Run Application Scrutiny Agent'}
        </button>
      </div>

      {/* Application Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Select Application:</span>
          <select
            value={selectedAppId}
            onChange={e => selectApplication(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium text-slate-800"
          >
            {applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.id} — {app.institutionName} ({app.currentStage})
              </option>
            ))}
          </select>
        </div>

        {selectedApp && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Stage:</span>
            <StatusBadge status={selectedApp.currentStage} />
            <span className="text-slate-500 ml-2">Type:</span>
            <span className="font-semibold text-slate-800">{selectedApp.applicationType.replace(/_/g, ' ')}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Documents Table & AI Assistant Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Documents Review Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Submitted Statutory Checklist</h2>
            <span className="text-xs text-slate-500">{documents.length} Files Uploaded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Officer Decision</th>
                  <th className="py-2.5 px-3 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{doc.documentType.replace(/_/g, ' ')}</p>
                      <p className="text-[11px] text-blue-600 underline truncate max-w-xs">{doc.fileName}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {doc.expiryDate || 'Perpetual Title'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={doc.status}
                        onChange={e => handleUpdateDocStatus(doc.id, e.target.value)}
                        className="text-[11px] py-1 px-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="VERIFIED">Verified OK</option>
                        <option value="CORRECTION_REQUIRED">Correction Required</option>
                        <option value="REJECTED">Defective / Rejected</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: AI Scrutiny Agent Findings Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Bot size={16} className="text-indigo-600" />
              Agent 1: Scrutiny Assistant
            </h2>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">AICTE APH 2026-27</span>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
            <span className="font-bold">Human Decision-Maker Rule:</span> AI scrutiny findings are regulatory suggestions and never automatically verify or reject an institution's application.
          </div>

          {aiFindings ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">Scrutiny Score:</span>
                <span className="font-extrabold text-indigo-700 text-sm">{aiFindings.scrutinyScore}/100</span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {aiFindings.findings.map((finding, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{finding.field}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        finding.type === 'expired_document' || finding.type === 'missing_field'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {finding.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{finding.evidence}</p>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                      <span className="font-semibold text-blue-700">Action: </span>
                      {finding.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200 space-y-2">
              <Bot size={24} className="mx-auto text-slate-300" />
              <p>Click "Run Application Scrutiny Agent" to cross-check extracted OCR texts, land titles, and faculty ratios.</p>
            </div>
          )}
        </div>
      </div>

      {/* OCR INSPECTION MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{selectedDoc.fileName}</h3>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <span className="font-bold text-slate-700 text-[11px]">Extracted Text Payload:</span>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-slate-800 max-h-60 overflow-y-auto">
                {selectedDoc.extractedText || 'No text extracted.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

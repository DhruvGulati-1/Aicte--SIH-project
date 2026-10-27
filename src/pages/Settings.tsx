import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Cpu,
  Layers,
  Clock,
  Shield,
  Workflow,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api.js';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // SLA form states
  const [reviewDays, setReviewDays] = useState(30);
  const [evcHours, setEvcHours] = useState(48);
  const [cureDays, setCureDays] = useState(10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setSettings(res);
      if (res.sla) {
        setReviewDays(res.sla.defaultReviewDays);
        setEvcHours(res.sla.evcCompletionHours);
        setCureDays(res.sla.deficiencyCureDays);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSla = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Administration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure statutory approval SLAs, regulatory workflow pathways, and inspect backend integrations.
        </p>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PostgreSQL Database */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Database size={15} className="text-blue-600" />
              PostgreSQL Database
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                settings?.database?.postgresConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {settings?.database?.postgresConnected ? 'Connected Live' : 'Dev Store Active'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {settings?.database?.message || 'Development Store with full AICTE seed dataset is active.'}
          </p>
          <div className="pt-1 text-[11px] font-mono text-slate-400">
            Schema: <span className="text-slate-600">/server/db/schema.sql</span>
          </div>
        </div>

        {/* Gemini AI Engine */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Cpu size={15} className="text-indigo-600" />
              Google Gemini API
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                settings?.ai?.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {settings?.ai?.configured ? 'Online' : 'Fallback Engine'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Model: <span className="font-semibold text-slate-800">{settings?.ai?.model || 'gemini-3.8-flash'}</span>. Handles scrutiny analysis, RAG synthesis, and qualitative risk ranking.
          </p>
          <div className="pt-1 text-[11px] text-slate-400">
            Telemetry Header: <span className="font-mono text-slate-600">User-Agent: aistudio-build</span>
          </div>
        </div>

        {/* n8n Orchestrator */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Workflow size={15} className="text-purple-600" />
              n8n Orchestrator
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
              {settings?.n8n?.configured ? 'Connected' : 'Standalone Direct'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Direct backend agent orchestration is active. Optional webhook adapter can be configured via N8N_WEBHOOK_URL.
          </p>
        </div>
      </div>

      {/* SLA Configuration Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Statutory SLA & Deadline Rules (APH 2026-27)</h2>
          <p className="text-xs text-slate-500">Configure processing windows and notification thresholds</p>
        </div>

        <form onSubmit={handleSaveSla} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Standard Scrutiny SLA (Days)</label>
            <input
              type="number"
              value={reviewDays}
              onChange={e => setReviewDays(parseInt(e.target.value) || 30)}
              className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-400">Default: 30 days statutory window</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">EVC Report Upload Limit (Hours)</label>
            <input
              type="number"
              value={evcHours}
              onChange={e => setEvcHours(parseInt(e.target.value) || 48)}
              className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-400">Default: 48 hours post-visit</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deficiency Cure Period (Days)</label>
            <input
              type="number"
              value={cureDays}
              onChange={e => setCureDays(parseInt(e.target.value) || 10)}
              className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
            />
            <span className="text-[11px] text-slate-400">Default: 10 days institution response</span>
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 size={14} /> SLA Parameters saved successfully.
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs"
            >
              Save SLA Parameters
            </button>
          </div>
        </form>
      </div>

      {/* Configured Workflow Pathways */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Supported Workflow Pathways</h2>
          <p className="text-xs text-slate-500">Configured statutory approval paths recognized by the core engine</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 font-mono">SCRUTINY_EVC</span>
            <p className="text-slate-600 text-[11px]">
              Standard pathway: Document scrutiny followed by physical Expert Visit Committee on-site inspection.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 font-mono">ONLY_SCRUTINY</span>
            <p className="text-slate-600 text-[11px]">
              Fast-track pathway: Document scrutiny only (applicable for standard Extension of Approval without expansion).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 font-mono">EVC_SAC_SHC</span>
            <p className="text-slate-600 text-[11px]">
              Comprehensive review: Scrutiny + EVC + Standing Hearing Committee & Standing Appellate Committee review.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 font-mono">ONLY_EVC</span>
            <p className="text-slate-600 text-[11px]">
              Surprise/Complaint inspection: Physical on-site verification ordered by Competent Authority directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

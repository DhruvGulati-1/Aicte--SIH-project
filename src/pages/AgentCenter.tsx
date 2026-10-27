import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  FileSearch,
  ShieldCheck,
  GitBranch,
  Gauge,
  BookOpen,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { api } from '../services/api.js';
import { Application, Institution } from '../types/index.js';

export const AgentCenter: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<'scrutiny' | 'compliance' | 'workflow' | 'risk' | 'rag'>('scrutiny');
  const [applications, setApplications] = useState<Application[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>(null);

  // Inputs
  const [targetAppId, setTargetAppId] = useState('');
  const [targetInstId, setTargetInstId] = useState('');
  const [ragQuery, setRagQuery] = useState('What are the minimum land area and faculty cadre ratio requirements for undergraduate engineering institutions under AICTE Approval Process Handbook 2026?');

  // Outputs
  const [output, setOutput] = useState<any>(null);
  const [activeModel, setActiveModel] = useState('gemini-3.8-flash');

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, iRes, sRes] = await Promise.all([
          api.getApplications(),
          api.getInstitutions(),
          api.getSettings()
        ]);
        setApplications(aRes.applications);
        setInstitutions(iRes.institutions);
        setSystemSettings(sRes);
        if (aRes.applications.length > 0) setTargetAppId(aRes.applications[0].id);
        if (iRes.institutions.length > 0) setTargetInstId(iRes.institutions[0].id);
      } catch (err) {
        console.error('Failed to load initial Agent data:', err);
      }
    }
    loadData();
  }, []);

  const executeAgent = async () => {
    setLoading(true);
    setOutput(null);
    try {
      if (selectedAgent === 'scrutiny') {
        const res = await api.runScrutinyAgent(targetAppId);
        setOutput(res);
        setActiveModel(res.modelUsed);
      } else if (selectedAgent === 'compliance') {
        const res = await api.runComplianceAgent(targetInstId);
        setOutput(res);
        setActiveModel(res.modelUsed);
      } else if (selectedAgent === 'workflow') {
        const res = await api.runWorkflowAgent(targetAppId);
        setOutput(res);
        setActiveModel(res.modelUsed);
      } else if (selectedAgent === 'risk') {
        const res = await api.runRiskAgent(targetAppId);
        setOutput(res);
        setActiveModel(res.modelUsed);
      } else if (selectedAgent === 'rag') {
        const res = await api.runRagAgent(ragQuery);
        setOutput(res);
        setActiveModel(res.modelUsed);
      }
    } catch (err: any) {
      setOutput({ error: err.message, status: 'Execution Failed' });
    } finally {
      setLoading(false);
    }
  };

  const agents = [
    {
      id: 'scrutiny',
      title: 'Agent 1: Application Scrutiny Agent',
      desc: 'Checks required statutory fields, land deeds, and flags discrepancies across submitted documents.',
      icon: FileSearch
    },
    {
      id: 'compliance',
      title: 'Agent 2: Compliance Monitoring Agent',
      desc: 'Evaluates compliance rules, identifies upcoming deadlines, and generates reminder notices.',
      icon: ShieldCheck
    },
    {
      id: 'workflow',
      title: 'Agent 3: Workflow Coordination Agent',
      desc: 'Summarizes current workflow state, detects stalled processing, and suggests the next action.',
      icon: GitBranch
    },
    {
      id: 'risk',
      title: 'Agent 4: Risk and Prioritization Agent',
      desc: 'Ranks applications using transparent deterministic scoring factors and qualitative AI breakdown.',
      icon: Gauge
    },
    {
      id: 'rag',
      title: 'Agent 5: Regulatory RAG Assistant',
      desc: 'Grounds answers in indexed AICTE Approval Process Handbooks with exact citations.',
      icon: BookOpen
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Agent Center (SIH26262 Architecture)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous multi-agent regulatory pipeline with deterministic fallbacks and strict human decision boundaries.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <Cpu size={14} className="text-indigo-600" />
          <span className="text-slate-500">Core Model:</span>
          <span className="font-semibold text-slate-800">{systemSettings?.ai?.model || 'gemini-3.8-flash'}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1"></span>
        </div>
      </div>

      {/* Human Decision-Maker Constitution Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center justify-between border border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
          <span>
            <strong className="text-white">Statutory Safeguard Boundary:</strong> RegulaFlow AI agents provide regulatory assistance and structured recommendations. Agents never possess unilateral authority to grant or reject an application.
          </span>
        </div>
      </div>

      {/* Agent Selector Carousel / Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {agents.map(ag => {
          const Icon = ag.icon;
          const active = selectedAgent === ag.id;
          return (
            <button
              key={ag.id}
              onClick={() => {
                setSelectedAgent(ag.id as any);
                setOutput(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                active
                  ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                {active && <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>}
              </div>
              <h3 className={`text-xs font-bold leading-snug ${active ? 'text-blue-900' : 'text-slate-900'}`}>
                {ag.title.split(':')[0]}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ag.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Execution Console Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {agents.find(a => a.id === selectedAgent)?.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {agents.find(a => a.id === selectedAgent)?.desc}
          </p>
        </div>

        {/* Input Parameters Form */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
          {selectedAgent === 'rag' ? (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Regulatory Query (Tested against verified AICTE regulations) *
              </label>
              <textarea
                rows={3}
                value={ragQuery}
                onChange={e => setRagQuery(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          ) : selectedAgent === 'compliance' ? (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Institution *</label>
              <select
                value={targetInstId}
                onChange={e => setTargetInstId(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-200 bg-white focus:outline-hidden"
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.officialId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Application *</label>
              <select
                value={targetAppId}
                onChange={e => setTargetAppId(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-200 bg-white focus:outline-hidden"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.id} — {app.institutionName} ({app.currentStage})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={executeAgent}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Bot size={14} />
              {loading ? 'Agent Executing...' : 'Execute Agent Task'}
            </button>
          </div>
        </div>

        {/* Output Display Card */}
        {output && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900">Agent Output & Structured Findings</span>
              <span className="text-[11px] text-slate-500 font-mono">Engine: {activeModel}</span>
            </div>

            {/* Special Pretty View based on Agent */}
            {selectedAgent === 'rag' && output.sources && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
                  <span className="font-bold block text-sm">Synthesized Regulatory Answer:</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{output.answer}</p>
                  <p className="text-[11px] text-blue-800 italic pt-1 border-t border-blue-200/60">
                    Recommendation: {output.recommendation}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Retrieved Regulatory Source Evidences:</h4>
                  <div className="space-y-2">
                    {output.sources.map((s: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{s.sourceTitle}</span>
                          <span className="text-blue-600 font-mono text-[11px]">Relevance: {(s.relevanceScore * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-slate-700 italic">"{s.passage}"</p>
                        <span className="text-[10px] text-slate-400 block">Section Code: {s.section}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedAgent === 'scrutiny' && output.findings && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                  <span className="font-bold text-indigo-950">Calculated Scrutiny Compliance Index:</span>
                  <span className="text-lg font-extrabold text-indigo-700">{output.scrutinyScore}/100</span>
                </div>
                <div className="space-y-2">
                  {output.findings.map((f: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{f.field}</span>
                        <span className="text-[11px] font-semibold text-slate-500">Confidence: {(f.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-slate-600">{f.evidence}</p>
                      <p className="text-blue-700 font-medium text-[11px]">Action: {f.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAgent === 'risk' && output.factors && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-950">Deterministic Risk Score:</span>
                  <span className="text-lg font-extrabold text-amber-800">{output.deterministicScore}/100 ({output.riskLevel})</span>
                </div>
                <div className="space-y-1.5">
                  {output.factors.map((f: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-800">{f.factor}: {f.description}</span>
                      <span className="font-bold text-slate-900">+{f.points} pts</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700">
                  <span className="font-bold">Qualitative AI Risk Analysis: </span>
                  {output.qualitativeAnalysis}
                </div>
              </div>
            )}

            {/* Structured JSON Raw Inspector */}
            <div className="pt-2">
              <span className="font-bold text-[11px] text-slate-500 block mb-1">Raw Validated Output Schema:</span>
              <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-72">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

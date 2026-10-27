import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  ExternalLink,
  Bot,
  Sparkles,
  FileText,
  Calendar,
  Shield,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { RegulatorySource } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const RegulatoryKnowledge: React.FC = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState<RegulatorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // RAG Query
  const [query, setQuery] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Add Source Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('All India Council for Technical Education (AICTE)');
  const [version, setVersion] = useState('APH-2026-27-REV-2');
  const [samplePassage, setSamplePassage] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const res = await api.getKnowledgeSources();
      setSources(res.sources);
    } catch (err) {
      console.error('Failed to load knowledge sources:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setRagLoading(true);
    setRagResult(null);
    try {
      const res = await api.runRagAgent(query);
      setRagResult(res);
    } catch (err: any) {
      alert(`RAG query failed: ${err.message}`);
    } finally {
      setRagLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!title.trim()) return;
    try {
      await api.addKnowledgeSource({
        title,
        issuingAuthority: authority,
        version,
        samplePassage
      });
      setAddModalOpen(false);
      setTitle('');
      setSamplePassage('');
      await loadSources();
    } catch (err: any) {
      alert(`Failed to add source: ${err.message}`);
    }
  };

  const filteredSources = sources.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.version.toLowerCase().includes(search.toLowerCase()) ||
    s.samplePassage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Regulatory Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative, indexed corpus of AICTE Approval Process Handbooks, statutory regulations, and Gazette notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus size={14} />
            Index Regulatory Circular
          </button>
        </div>
      </div>

      {/* RAG Query Sandbox Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-blue-600" />
            Statutory RAG Query Assistant
          </h2>
          <span className="text-[11px] text-slate-500">Retrieves verbatim passages & handbook chapters</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Ask a regulatory question (e.g. 'What is the required teacher-student ratio for B.Tech CSE?')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRunQuery()}
            className="flex-1 text-xs p-2.5 rounded-md border border-slate-200 focus:outline-hidden focus:border-blue-500"
          />
          <button
            onClick={handleRunQuery}
            disabled={ragLoading || !query.trim()}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors shrink-0 disabled:opacity-50"
          >
            {ragLoading ? 'Searching Corpus...' : 'Search Regulations'}
          </button>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 pt-1">
          <span className="font-semibold text-slate-700">Quick Searches:</span>
          <button
            onClick={() => { setQuery('What are the minimum land requirements for technical campuses in metro vs rural areas?'); }}
            className="hover:underline text-blue-600"
          >
            Land requirements
          </button>
          <span>·</span>
          <button
            onClick={() => { setQuery('What is the mandatory cadre ratio (Professors to Assistant Professors)?'); }}
            className="hover:underline text-blue-600"
          >
            Faculty Cadre Ratio
          </button>
          <span>·</span>
          <button
            onClick={() => { setQuery('What is the Supreme Court mandate on campus anti-ragging CCTV?'); }}
            className="hover:underline text-blue-600"
          >
            Anti-Ragging directives
          </button>
        </div>

        {/* RAG Answer Display */}
        {ragResult && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50/80 border border-blue-200 text-xs space-y-3 animate-in fade-in duration-150">
            <div>
              <span className="font-bold text-blue-950 block text-sm">Grounded Statutory Answer:</span>
              <p className="text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{ragResult.answer}</p>
            </div>

            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-2 border-t border-blue-200/60">
                <span className="font-bold text-blue-900 block mb-1">Citing Verified Regulatory Sources:</span>
                <div className="space-y-1.5">
                  {ragResult.sources.map((s: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-white border border-blue-200/80 text-[11px]">
                      <span className="font-semibold text-slate-900">{s.sourceTitle}</span> [Section: {s.section}]
                      <p className="text-slate-600 italic mt-0.5">"{s.passage}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Indexed Official Regulatory Authorities</h2>
            <p className="text-xs text-slate-500">{sources.length} Verified Sources Active in Knowledge Corpus</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search circulars..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredSources.map(src => (
            <div key={src.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{src.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Authority: {src.issuingAuthority} · Version: <span className="font-mono text-slate-700">{src.version}</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  {src.chunksCount} Vector Chunks
                </span>
              </div>

              {src.samplePassage && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 font-serif leading-relaxed">
                  "{src.samplePassage}"
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Published: {src.publicationDate} · Effective: {src.effectiveDate}</span>
                {src.sourceUrl && (
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    AICTE Official Gazette <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD SOURCE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Index New Regulatory Source</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AICTE Approval Process Handbook (APH 2026-27) Addendum"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={authority}
                  onChange={e => setAuthority(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gazette / Version Code</label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Regulatory Text Sample / Excerpt *</label>
                <textarea
                  rows={4}
                  placeholder="Enter the official text excerpt, chapter clause, and compliance norms..."
                  value={samplePassage}
                  onChange={e => setSamplePassage(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAddModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                disabled={!title.trim()}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-xs"
              >
                Index Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

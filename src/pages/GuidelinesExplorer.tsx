import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ChevronRight,
  Calculator,
  Building,
  Scale,
  Sparkles,
  ExternalLink,
  Award,
  Lock
} from 'lucide-react';
import { AICTE_GUIDELINE_CHAPTERS, AICTE_CALCULATION_NORMS } from '../data/aicteGuidelinesData.js';

export const GuidelinesExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChapterId, setSelectedChapterId] = useState(AICTE_GUIDELINE_CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChapter = AICTE_GUIDELINE_CHAPTERS.find(c => c.id === selectedChapterId) || AICTE_GUIDELINE_CHAPTERS[0];

  const filteredClauses = activeChapter.clauses.filter(clause => {
    return (
      clause.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.clauseNo.includes(searchQuery) ||
      clause.statutoryThreshold.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091530] via-[#0f214f] to-[#1c194a] p-6 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                <ShieldCheck size={13} className="text-emerald-400" />
                Statutory AICTE Regulations
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-mono">Gazette of India Compliant</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              AICTE Guidelines & Norms Explorer
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Official chapter-by-chapter Approval Process Handbook (APH 2026-27) provisions, statutory thresholds, mandatory documentary evidence, and penal regulations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              <BookOpen size={14} />
              AICTE Courses Catalog
            </button>
            <button
              onClick={() => navigate('/knowledge')}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <Sparkles size={14} className="text-blue-400" />
              Query with AI RAG
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Land & Cadre Norms Reference Quick-Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building size={15} className="text-blue-600" />
              Statutory Contiguous Land Norms
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Schedule II
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            • <strong>Mega/Metro City:</strong> ≥ 2.50 Acres contiguous<br />
            • <strong>Urban/State Capital:</strong> ≥ 4.00 Acres<br />
            • <strong>Rural/District:</strong> ≥ 7.50 Acres contiguous registered title
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Scale size={15} className="text-emerald-600" />
              Cadre Ratio 1:2:6 Formula
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Reg. 4.2
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            • <strong>Student-Teacher Ratio:</strong> 1:15 for UG Engg, 1:20 for MBA<br />
            • <strong>Cadre Balance:</strong> 1 Professor : 2 Associate : 6 Assistant<br />
            • <strong>Pay Scale:</strong> 7th CPC with biometric time-logging
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lock size={15} className="text-amber-600" />
              Non-Waivable Prerequisites
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Mandatory
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            • State Fire Safety Director General NOC<br />
            • PWD Certified Universal Barrier-Free Ramps & Lifts<br />
            • Anti-Ragging 24x7 IP CCTV Surveillance & Squad Order
          </p>
        </div>
      </div>

      {/* Main Chapter Navigation & Clauses Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Chapters Navigation */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            APH 2026-27 Chapters
          </span>
          <div className="space-y-1.5">
            {AICTE_GUIDELINE_CHAPTERS.map(chap => {
              const active = chap.id === selectedChapterId;
              return (
                <button
                  key={chap.id}
                  onClick={() => {
                    setSelectedChapterId(chap.id);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    active
                      ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold opacity-90">{chap.chapterNumber}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                  </div>
                  <p className="mt-1 font-semibold leading-tight">{chap.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapter Overview & Clauses */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chapter Details Banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-700 uppercase">
                {activeChapter.chapterNumber}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {activeChapter.clauses.length} Prescribed Clauses
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{activeChapter.title}</h2>
            <p className="text-xs font-medium text-slate-600">{activeChapter.subTitle}</p>
            <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
              {activeChapter.description}
            </p>
            <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-200">
              <strong className="text-slate-800">Scope of Application:</strong> {activeChapter.scope}
            </div>
          </div>

          {/* Search Clauses Input */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search within ${activeChapter.chapterNumber} clauses or thresholds...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Clauses List */}
          <div className="space-y-4">
            {filteredClauses.map(clause => (
              <div
                key={clause.clauseNo}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-mono font-bold text-blue-800">
                      Clause {clause.clauseNo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{clause.heading}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{clause.content}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/90 p-3 text-emerald-950 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Statutory Minimum Threshold
                    </span>
                    <p className="text-[11px] leading-snug">{clause.statutoryThreshold}</p>
                  </div>

                  <div className="rounded-lg bg-blue-50/70 border border-blue-200/90 p-3 text-blue-950 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                      Mandatory Evidence Document
                    </span>
                    <p className="text-[11px] leading-snug">{clause.essentialEvidence}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-rose-50/80 border border-rose-200 p-2.5 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <strong className="text-rose-950">Non-Compliance Statutory Consequence: </strong>
                    {clause.nonComplianceConsequence}
                  </div>
                </div>
              </div>
            ))}

            {filteredClauses.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                No clauses matched the search query "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Shield,
  GraduationCap,
  Landmark,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';

interface AffiliatedCampus {
  id: string;
  officialId: string;
  name: string;
  state: string;
  type: string;
  email: string;
  head: string;
}

const SAMPLE_CAMPUSES: AffiliatedCampus[] = [
  {
    id: 'inst-001',
    officialId: '1-10928374',
    name: 'Delhi Institute of Engineering & Advanced Technology',
    state: 'Delhi (NRO)',
    type: 'Engineering & Technology',
    email: 'principal@iitdelhi.ac.in',
    head: 'Prof. R. Venkatesh (Dean)'
  },
  {
    id: 'inst-002',
    officialId: '1-23847119',
    name: 'Pune College of Engineering & Research',
    state: 'Maharashtra (WRO)',
    type: 'Engineering & Technology',
    email: 'principal@pune-engg.ac.in',
    head: 'Dr. Sunita Kulkarni (Principal)'
  },
  {
    id: 'inst-003',
    officialId: '1-34982710',
    name: 'National Institute of Pharmaceutical Sciences',
    state: 'Karnataka (SWRO)',
    type: 'Pharmacy',
    email: 'dean@nips-edu.org',
    head: 'Prof. Amitava Ghosh (Director)'
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  // Two Interfaces: 1 for Institution, 1 for AICTE Official
  const [selectedInterface, setSelectedInterface] = useState<'INSTITUTION' | 'OFFICIAL'>('INSTITUTION');

  // Institution credentials pre-filled by default
  const [identifier, setIdentifier] = useState('principal@iitdelhi.ac.in');
  const [password, setPassword] = useState('inst123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const liveUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSwitchInterface = (mode: 'INSTITUTION' | 'OFFICIAL') => {
    setSelectedInterface(mode);
    setError('');
    if (mode === 'INSTITUTION') {
      setIdentifier('principal@iitdelhi.ac.in');
      setPassword('inst123');
    } else {
      setIdentifier('officer.sharma@aicte-india.org');
      setPassword('officer123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
      if (selectedInterface === 'OFFICIAL') {
        navigate('/official');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your official email/PID and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFastPassInstitution = async (campus: AffiliatedCampus) => {
    setError('');
    setSubmitting(true);
    try {
      setIdentifier(campus.email);
      setPassword('inst123');
      await login(campus.email, 'inst123');
      navigate('/');
    } catch {
      try {
        await switchRole('INSTITUTION');
        navigate('/');
      } catch (err2: any) {
        setError(err2.message || 'Failed to authenticate campus.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFastPassOfficial = async (role: UserRole) => {
    setError('');
    setSubmitting(true);
    try {
      await switchRole(role);
      navigate('/official');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate official.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Background Subtle Gradient Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-25">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600 rounded-full blur-[160px]" />
      </div>

      {/* Top SIH 2026 Submission Header */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
        {/* Emblem & SIH Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner">
          <Landmark size={14} className="text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            AICTE APPROVAL & REGULATORY AUTOMATION PLATFORM
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-600 hidden sm:inline" />
          <span className="text-amber-400 font-bold">SIH26262</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
          RegulaFlow <span className="text-blue-500">AI</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Smart India Hackathon 2026 • Dual Interface Platform for Technical Institutions and AICTE Regulatory Officials
        </p>

        {/* SIH Submission Live Link Card (Ready to Copy to SIH Website) */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 text-left flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-amber-300">Live Production Server Operational</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{liveUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              {copiedLink ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied!' : 'Copy Live Link for SIH'}</span>
            </button>
            <a
              href="/api/v1/health"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              Health Check
            </a>
          </div>
        </div>

        {/* TWO INTERFACES SELECTOR TABS */}
        <div className="pt-2 flex justify-center">
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl w-full max-w-lg">
            <button
              type="button"
              onClick={() => handleSwitchInterface('INSTITUTION')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                selectedInterface === 'INSTITUTION'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 size={16} />
              <div className="text-left">
                <div className="leading-tight">1. Institution Portal</div>
                <div className="text-[10px] opacity-75 font-normal">Colleges & Polytechnics</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchInterface('OFFICIAL')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                selectedInterface === 'OFFICIAL'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield size={16} />
              <div className="text-left">
                <div className="leading-tight">2. AICTE Official Portal</div>
                <div className="text-[10px] opacity-75 font-normal">Scrutiny & Approval Directorate</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Login Box */}
      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-xl relative">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 space-y-6">
          {/* Interface Contextual Banner */}
          {selectedInterface === 'INSTITUTION' ? (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/90 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                <GraduationCap size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Interface 1: Technical Institution Portal
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    AY 2026-27
                  </span>
                </div>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  Log in with your institution's <strong>Permanent Institute ID (PID)</strong> or registered email to file Extension of Approval (EoA), upload mandatory compliance, and respond to deficiency notices.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-600/20">
                <Shield size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Interface 2: AICTE Regulatory & Scrutiny Directorate
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Official Bureau
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Authorized access for AICTE Scrutiny Officers, Expert Visit Committees (EVC), and Competent Authorities to verify APH norms, issue deficiency memos, and grant approvals.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {selectedInterface === 'INSTITUTION'
                  ? 'AICTE Permanent Institute ID (PID) or Official Email'
                  : 'AICTE Officer Designation ID or Official Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {selectedInterface === 'INSTITUTION' ? <Building2 size={16} /> : <Mail size={16} />}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={
                    selectedInterface === 'INSTITUTION'
                      ? 'e.g. 1-10928374 or principal@iitdelhi.ac.in'
                      : 'e.g. officer.sharma@aicte-india.org or OFFICER-NORTH-01'
                  }
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedInterface === 'INSTITUTION'
                  ? 'Enter AICTE Permanent ID (e.g. 1-10928374) or registered email'
                  : 'Enter official AICTE officer email (e.g. officer.sharma@aicte-india.org)'}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pre-filled default password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{password}</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50 ${
                selectedInterface === 'INSTITUTION'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
              }`}
            >
              <span>
                {submitting
                  ? 'Authenticating...'
                  : selectedInterface === 'INSTITUTION'
                  ? 'Sign in to Institution Portal'
                  : 'Sign in to AICTE Official Directorate'}
              </span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* SIH EVALUATOR QUICK ACCESS (1-CLICK DIRECT LOGINS) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Zap size={13} className="text-amber-500" />
                <span>SIH Evaluator Quick Access (1-Click Test Logins)</span>
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Instant Access</span>
            </div>

            {selectedInterface === 'INSTITUTION' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Select a pre-registered technical institution to instantly test the approval dossier workflow:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_CAMPUSES.map(campus => (
                    <button
                      key={campus.id}
                      type="button"
                      onClick={() => handleFastPassInstitution(campus)}
                      disabled={submitting}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-left transition-all flex items-center justify-between group text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                            {campus.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 shrink-0">
                            PID: {campus.officialId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {campus.head} • {campus.state}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">
                  Select an AICTE Bureau official role to access the Official Directorate workspace:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFastPassOfficial('OFFICER')}
                    disabled={submitting}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-left transition-all group text-xs"
                  >
                    <div className="font-bold text-slate-900 group-hover:text-amber-950 flex items-center justify-between">
                      <span>AICTE Scrutiny Officer</span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dr. Arvind Sharma (HQ Desk)</p>
                    <p className="text-[10px] text-amber-700 font-mono mt-1">officer.sharma@aicte-india.org</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFastPassOfficial('COMPETENT_AUTHORITY')}
                    disabled={submitting}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-left transition-all group text-xs"
                  >
                    <div className="font-bold text-slate-900 group-hover:text-amber-950 flex items-center justify-between">
                      <span>Competent Authority</span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-amber-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Approval Bureau Director</p>
                    <p className="text-[10px] text-amber-700 font-mono mt-1">ca@aicte-india.org</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info for SIH */}
        <div className="mt-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            RegulaFlow AI • Built for <strong>Smart India Hackathon 2026</strong> (Problem Statement: SIH26262)
          </p>
          <p className="text-[11px] text-slate-600">
            Compliant with AICTE Approval Process Handbook (APH 2024-27) & Statutory Regulatory Framework
          </p>
        </div>
      </div>
    </div>
  );
};

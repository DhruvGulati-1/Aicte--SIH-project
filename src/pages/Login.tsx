import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('officer.sharma@aicte-india.org');
  const [password, setPassword] = useState('officer123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError('');
    setSubmitting(true);
    try {
      await switchRole(role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login with demo role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
          RF
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">RegulaFlow AI</h1>
        <p className="text-xs text-slate-400">
          AI-Powered AICTE Approval Workflow Automation & Compliance Monitoring Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Official Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-600 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hackathon Demo Quick-Access Personas
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Click to sign in instantly with authorized role</p>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(DEMO_USERS) as UserRole[]).map(role => {
                const info = DEMO_USERS[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickLogin(role)}
                    className="w-full p-2 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/50 text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{info.label}</span>
                      <p className="text-[10px] text-slate-500">{info.desc}</p>
                    </div>
                    <ArrowRight size={13} className="text-slate-400 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4">
          SIH26262 MVP · Not an official AICTE portal
        </p>
      </div>
    </div>
  );
};

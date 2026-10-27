import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { api } from '../../services/api.js';
import { Database, AlertCircle, Sparkles, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [dismissBanner, setDismissBanner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        setHealthInfo(res);
      } catch {
        // ignore
      }
    }
    checkHealth();
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-64 flex-1 flex-col bg-[#0b1329]">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />

        {/* Development & Database Transparency Banner */}
        {healthInfo && !dismissBanner && (
          <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">RegulaFlow Core:</span>
              <span className="text-slate-300">
                {healthInfo.database?.mode === 'PostgreSQL'
                  ? 'Connected to Live PostgreSQL'
                  : 'Development Store Active with Real AICTE Seed Records'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">
                {healthInfo.ai?.geminiAvailable ? 'Gemini 3.8 Flash Online' : 'AI Engine: Deterministic APH 2026-27'}
              </span>
              <Link to="/settings" className="underline text-blue-400 hover:text-blue-300 ml-1">
                View Settings
              </Link>
            </div>
            <button
              onClick={() => setDismissBanner(true)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Quiet Government Tech Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>RegulaFlow AI · SIH26262 AICTE Approval & Compliance Monitoring Platform</span>
            <span className="text-slate-400">Production-Ready Architecture · Not an Official AICTE Government Portal</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

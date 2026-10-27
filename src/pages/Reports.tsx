import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [ageing, setAgeing] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, aRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getDashboardAgeing()
        ]);
        setSummary(sRes);
        setAgeing(aRes.ageing);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const exportCsv = () => {
    if (!ageing.length) return;
    const headers = ['Application ID', 'Institution', 'Current Stage', 'Priority', 'Age (Days)', 'SLA Status'];
    const rows = ageing.map(r => [
      r.applicationId,
      `"${r.institutionName}"`,
      r.stage,
      r.priority,
      r.ageDays,
      r.slaStatus
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_Approval_Pipeline_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stateData = summary?.charts?.stateDistribution || [];
  const statusData = summary?.charts?.statusDistribution || [];
  const stageData = summary?.charts?.stageDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Regulatory Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official approval metrics, regional throughput, SLA compliance statistics, and CSV data export.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <FileSpreadsheet size={14} />
          Export Application Pipeline CSV
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Review Duration</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.charts?.averageProcessingDays || 19.4} Days</p>
          <span className="text-[11px] text-emerald-600 font-medium">Within statutory 30-day SLA</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Compliance Adherence Rate</span>
          <p className="text-2xl font-bold text-blue-700 mt-2">{summary?.charts?.complianceRate || 86}%</p>
          <span className="text-[11px] text-slate-500">Institutional statutory norm satisfaction</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Pipeline Volume</span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{summary?.kpis?.applicationsReceived || 5} Applications</p>
          <span className="text-[11px] text-slate-500">Academic Year 2026-27</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">State-wise Institution Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Active registered technical campuses</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Throughput */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">Throughput Across Stages</h2>
          <p className="text-xs text-slate-500 mb-4">Breakdown of pending applications</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

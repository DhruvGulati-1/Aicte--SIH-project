import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight
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
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { ApplicationHistory, EvcVisit } from '../types/index.js';

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
const STAGE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [ageingList, setAgeingList] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [sumRes, ageRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardAgeing()
      ]);
      setSummary(sumRes);
      setAgeingList(ageRes.ageing);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-lg border border-slate-200"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-lg border border-slate-200"></div>
          <div className="h-64 bg-white rounded-lg border border-slate-200"></div>
        </div>
      </div>
    );
  }

  const kpis = summary?.kpis || {};
  const charts = summary?.charts || {};
  const recentActivity: ApplicationHistory[] = summary?.recentActivity || [];
  const upcomingVisits: EvcVisit[] = summary?.upcomingVisits || [];

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time regulatory workflow oversight, scrutiny tracking, and AICTE compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw size={13} className="text-slate-500" />
            Refresh Data
          </button>
          <button
            onClick={() => navigate('/applications/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            New Application
          </button>
        </div>
      </div>

      {/* Institution Role Banner */}
      {user?.role === 'INSTITUTION' && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-blue-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider">
                  Logged In as Institution Portal User
                </span>
                <span className="text-xs text-slate-300 font-mono">PID: 1-10928374</span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Delhi Institute of Engineering & Advanced Technology
              </h2>
              <p className="text-xs text-slate-300">
                Dean of Academic Operations: <span className="font-semibold text-white">{user.name}</span> ({user.email}) · South Delhi, NRO Region
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/applications')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-white text-blue-900 hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
              >
                Track Campus Applications
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 transition-colors cursor-pointer"
              >
                AICTE Course Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8 Clickable KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Institutions */}
        <div
          onClick={() => navigate('/institutions')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Institutions</span>
            <Building2 size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.totalInstitutions || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>Verified AICTE records</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 2. Applications Received */}
        <div
          onClick={() => navigate('/applications')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Applications Received</span>
            <FileText size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.applicationsReceived || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>AY 2026-27 session</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 3. Under Scrutiny */}
        <div
          onClick={() => navigate('/applications?stage=UNDER_SCRUTINY')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Under Scrutiny</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.underScrutiny || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
            <span>Regional officer reviews</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 4. Awaiting Institution */}
        <div
          onClick={() => navigate('/applications?status=AWAITING_INSTITUTION')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Awaiting Response</span>
            <AlertTriangle size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.awaitingInstitution || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 mt-1">
            <span>Deficiency cure window</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 5. Pending Expert Evaluation */}
        <div
          onClick={() => navigate('/evc')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Evaluation</span>
            <CalendarCheck size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.pendingEvc || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 mt-1">
            <span>EVC visits scheduled</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 6. Overdue / Urgent */}
        <div
          onClick={() => navigate('/applications?priority=URGENT')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overdue / Critical SLA</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">{kpis.overdueApps || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
            <span>Urgent intervention</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 7. Compliance Due Soon */}
        <div
          onClick={() => navigate('/compliance')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Compliance Expiring</span>
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.complianceDueSoon || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
            <span>Due in &le; 30 days</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>

        {/* 8. Completed Applications */}
        <div
          onClick={() => navigate('/applications?status=APPROVED')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed Decisions</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis.applicationsCompleted || 0}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
            <span>Approved / Finalized</span>
            <ChevronRight size={12} className="ml-auto text-slate-400" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Applications by Workflow Stage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Application Pipeline by Stage</h2>
              <p className="text-xs text-slate-500">Distribution across statutory regulatory scrutiny stages</p>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              Avg Processing: <span className="font-bold text-blue-600">{charts.averageProcessingDays || 19} Days</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.stageDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Application Status</h2>
            <p className="text-xs text-slate-500">Current disposition of active submissions</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {(charts.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {(charts.statusDistribution || []).map((s: any, idx: number) => (
              <div key={s.status} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[idx % STATUS_COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{s.status}:</span>
                <span className="font-semibold text-slate-800 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Workflow Activity & Upcoming EVC Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Application History */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Workflow Activity</h2>
              <p className="text-xs text-slate-500">Live transitions recorded in statutory audit log</p>
            </div>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full Audit <ArrowRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No recent activity recorded.</p>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-medium">
                    {act.actorRole.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">{act.actorName}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 line-clamp-1">{act.reason || act.comments}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-medium text-blue-700">{act.applicationId}</span>
                      <span>·</span>
                      <span>{act.action.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming EVC Visits */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Expert Evaluation Visits (EVC)</h2>
              <p className="text-xs text-slate-500">Scheduled on-site infrastructure and academic audits</p>
            </div>
            <button
              onClick={() => navigate('/evc')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              EVC Desk <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingVisits.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                No active visits currently scheduled.
              </div>
            ) : (
              upcomingVisits.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/applications/${v.applicationId}`)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{v.institutionName}</span>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <CalendarCheck size={13} className="text-blue-600" />
                      {v.scheduledDate} {v.scheduledTime}
                    </span>
                    <span>·</span>
                    <span className="truncate">Lead: {v.leadEvaluator}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {v.meetingMode.replace(/_/g, ' ')} · {v.locationOrMeetingLink || 'Main Campus'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ageing & SLA Monitoring Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Application Ageing & SLA Health</h2>
            <p className="text-xs text-slate-500">Statutory 30-day processing deadline compliance</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Application ID</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Age (Days)</th>
                <th className="py-2.5 px-3">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ageingList.map((row) => (
                <tr
                  key={row.applicationId}
                  onClick={() => navigate(`/applications/${row.applicationId}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-blue-600">{row.applicationId}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{row.institutionName}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={row.stage} />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={row.priority} />
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{row.ageDays} / 30</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        row.slaStatus === 'BREACHED'
                          ? 'bg-rose-100 text-rose-800'
                          : row.slaStatus === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.slaStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { Application } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');

  useEffect(() => {
    loadApplications();
  }, [searchParams]);

  async function loadApplications() {
    setLoading(true);
    try {
      const stageParam = searchParams.get('stage');
      const statusParam = searchParams.get('status');
      const priorityParam = searchParams.get('priority');
      const searchParam = searchParams.get('search');

      const res = await api.getApplications({
        stage: stageParam || undefined,
        status: statusParam || undefined,
        priority: priorityParam || undefined,
        search: searchParam || undefined
      });
      setApplications(res.applications);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (stageFilter !== 'ALL') params.stage = stageFilter;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (priorityFilter !== 'ALL') params.priority = priorityFilter;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStageFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and scrutinize technical institution approval workflows from submission to final decree.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadApplications}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw size={13} className="text-slate-500" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/applications/new')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus size={15} />
            Submit New Application
          </button>
        </div>
      </div>

      {/* Filter Presets Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* Preset Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => {
              setStageFilter('ALL');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setSearchParams({});
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              !searchParams.get('stage') && !searchParams.get('status') && !searchParams.get('priority')
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => {
              setStageFilter('UNDER_SCRUTINY');
              setSearchParams({ stage: 'UNDER_SCRUTINY' });
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              searchParams.get('stage') === 'UNDER_SCRUTINY'
                ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Under Scrutiny
          </button>
          <button
            onClick={() => {
              setStatusFilter('AWAITING_INSTITUTION');
              setSearchParams({ status: 'AWAITING_INSTITUTION' });
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              searchParams.get('status') === 'AWAITING_INSTITUTION'
                ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Awaiting Institution Response
          </button>
          <button
            onClick={() => {
              setPriorityFilter('URGENT');
              setSearchParams({ priority: 'URGENT' });
            }}
            className={`px-3 py-1 rounded-md transition-colors ${
              searchParams.get('priority') === 'URGENT'
                ? 'bg-rose-50 text-rose-800 font-semibold border border-rose-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Urgent SLA Priority
          </button>
        </div>

        {/* Detailed Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or Institution Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">All Stages</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_SCRUTINY">Under Scrutiny</option>
              <option value="SCRUTINY_REVERTED">Scrutiny Reverted</option>
              <option value="EVC_SCHEDULED">EVC Scheduled</option>
              <option value="EVC_COMPLETED">EVC Completed</option>
              <option value="FINAL_DECISION_PENDING">Final Decision Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-md border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="AWAITING_INSTITUTION">Awaiting Institution</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors"
            >
              Apply Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading applications registry...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No applications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No applications match the selected filter criteria. Try resetting filters or submit a new application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                      {app.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 truncate max-w-xs">{app.institutionName}</p>
                      <span className="text-[11px] text-slate-400">AY {app.academicYear} · Path: {app.workflowPath}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {app.applicationType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={app.currentStage} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {app.assignedOfficerName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={app.priority} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

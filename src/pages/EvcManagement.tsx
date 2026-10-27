import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  CheckCircle,
  FileCheck,
  Plus,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { EvcVisit, Application } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { useAuth } from '../context/AuthContext.js';

export const EvcManagement: React.FC = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<EvcVisit[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // New Visit Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-11-04');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM IST');
  const [leadEvaluator, setLeadEvaluator] = useState('Dr. K. N. Rao');
  const [meetingMode, setMeetingMode] = useState<'PHYSICAL_ONSITE' | 'VIRTUAL_HYBRID'>('PHYSICAL_ONSITE');
  const [locationOrLink, setLocationOrLink] = useState('Main Academic Block Conference Hall');

  // Submit Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<EvcVisit | null>(null);
  const [findingsSummary, setFindingsSummary] = useState('');

  useEffect(() => {
    loadVisits();
  }, []);

  async function loadVisits() {
    setLoading(true);
    try {
      const [vRes, aRes] = await Promise.all([
        api.getEvcVisits(),
        api.getApplications()
      ]);
      setVisits(vRes.visits);
      setApplications(aRes.applications);
      if (aRes.applications.length > 0) {
        setSelectedAppId(aRes.applications[0].id);
      }
    } catch (err) {
      console.error('Failed to load EVC visits:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateVisit = async () => {
    if (!selectedAppId || !scheduledDate) return;
    try {
      await api.createEvcVisit({
        applicationId: selectedAppId,
        scheduledDate,
        scheduledTime,
        leadEvaluator,
        evaluatorTeam: ['Dr. Meera Nambiar (NIT Surat)', 'Dr. Rajesh Deshmukh (VJTI Mumbai)'],
        meetingMode,
        locationOrMeetingLink: locationOrLink
      });
      setNewModalOpen(false);
      await loadVisits();
    } catch (err: any) {
      alert(`Error scheduling visit: ${err.message}`);
    }
  };

  const handleCompleteReport = async () => {
    if (!selectedVisit || !findingsSummary.trim()) return;
    try {
      await api.completeEvcVisit(
        selectedVisit.id,
        findingsSummary,
        selectedVisit.checklistItems?.map(c => ({ ...c, verified: true })),
        'Physical inspection conducted and unanimous positive recommendation recorded.'
      );
      setReportModalOpen(false);
      setSelectedVisit(null);
      setFindingsSummary('');
      await loadVisits();
    } catch (err: any) {
      alert(`Error completing visit report: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expert Visit Committee (EVC) Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate peer-review evaluator panels, manage inspection visits, and record verified on-site findings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus size={14} />
            Schedule New Expert Visit
          </button>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading scheduled visits...
          </div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No expert visits scheduled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Visit ID</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Lead Evaluator</th>
                  <th className="py-3 px-4">Meeting Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {v.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{v.institutionName}</p>
                      <p className="text-[11px] text-slate-400">Application: {v.applicationId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {v.scheduledDate} {v.scheduledTime}
                    </td>
                    <td className="py-3 px-4 text-slate-800 whitespace-nowrap font-medium">
                      {v.leadEvaluator}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {v.meetingMode.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {v.status === 'COMPLETED' ? (
                        <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          Report Filed
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedVisit(v);
                            setFindingsSummary(
                              'The committee inspected physical labs, library volumes, and barrier-free facilities. Found compliant with AICTE Approval Process Handbook 2026-27 norms.'
                            );
                            setReportModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          Submit EVC Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE VISIT MODAL */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900">Schedule Expert Visit</h3>
              <button onClick={() => setNewModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Application *</label>
                <select
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.id} — {app.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lead Evaluator *</label>
                <input
                  type="text"
                  value={leadEvaluator}
                  onChange={e => setLeadEvaluator(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Mode</label>
                <select
                  value={meetingMode}
                  onChange={e => setMeetingMode(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                >
                  <option value="PHYSICAL_ONSITE">Physical On-Site Inspection</option>
                  <option value="VIRTUAL_HYBRID">Virtual / Hybrid Hearing</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={e => setLocationOrLink(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setNewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVisit}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT REPORT MODAL */}
      {reportModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload EVC Inspection Findings & Report</h3>
            <p className="text-xs text-slate-500">{selectedVisit.institutionName} · Lead: {selectedVisit.leadEvaluator}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Final Panel Recommendation Summary *</label>
                <textarea
                  rows={4}
                  value={findingsSummary}
                  onChange={e => setFindingsSummary(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-md focus:outline-hidden"
                  placeholder="Summarize verified physical infrastructure, laboratory standards, and recommendation for approval..."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                Upon submission, all checklist items will be locked as verified and the application stage will advance to <span className="font-semibold text-slate-800">EVC_COMPLETED</span>.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteReport}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-xs"
              >
                Finalize & Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

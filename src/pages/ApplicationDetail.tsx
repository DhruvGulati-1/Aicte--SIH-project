import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldAlert,
  Bot,
  History,
  Send,
  Eye,
  Check,
  X,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  Application,
  Institution,
  DocumentRecord,
  ApplicationHistory,
  EvcVisit,
  AgentScrutinyResult,
  AgentRiskResult,
  AgentWorkflowResult
} from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<{
    application: Application;
    institution: Institution;
    documents: DocumentRecord[];
    history: ApplicationHistory[];
    evc?: EvcVisit;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'scrutiny' | 'workflow' | 'evc' | 'compliance' | 'history' | 'ai'
  >('overview');

  // Modals / Action States
  const [revertModalOpen, setRevertModalOpen] = useState(false);
  const [revertReason, setRevertReason] = useState('');
  const [revertComments, setRevertComments] = useState('');

  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [resubmitRemarks, setResubmitRemarks] = useState('');

  const [completeStageModalOpen, setCompleteStageModalOpen] = useState(false);
  const [selectedNextStage, setSelectedNextStage] = useState('');
  const [stageComments, setStageComments] = useState('');

  // AI Agent States
  const [scrutinyResult, setScrutinyResult] = useState<AgentScrutinyResult | null>(null);
  const [riskResult, setRiskResult] = useState<AgentRiskResult | null>(null);
  const [workflowAgentResult, setWorkflowAgentResult] = useState<AgentWorkflowResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Document Viewer Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    if (id) loadApplication();
  }, [id]);

  async function loadApplication() {
    setLoading(true);
    try {
      if (!id) return;
      const res = await api.getApplication(id);
      setAppData(res);
      // Pre-set next stage recommendation
      if (res.application.currentStage === 'SUBMITTED') {
        setSelectedNextStage('UNDER_SCRUTINY');
      } else if (res.application.currentStage === 'UNDER_SCRUTINY') {
        setSelectedNextStage('SCRUTINY_COMPLETED');
      } else if (res.application.currentStage === 'SCRUTINY_COMPLETED') {
        setSelectedNextStage(res.application.workflowPath === 'ONLY_SCRUTINY' ? 'FINAL_DECISION_PENDING' : 'EVC_SCHEDULED');
      } else if (res.application.currentStage === 'EVC_COMPLETED') {
        setSelectedNextStage('FINAL_DECISION_PENDING');
      } else if (res.application.currentStage === 'FINAL_DECISION_PENDING') {
        setSelectedNextStage('APPROVED');
      }
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRevert = async () => {
    if (!id || !revertReason) return;
    try {
      await api.revertApplication(id, revertReason, revertComments);
      setRevertModalOpen(false);
      setRevertReason('');
      setRevertComments('');
      await loadApplication();
    } catch (err: any) {
      alert(`Error reverting: ${err.message}`);
    }
  };

  const handleResubmit = async () => {
    if (!id) return;
    try {
      await api.resubmitApplication(id, resubmitRemarks || 'Resubmitted with rectified documents.');
      setResubmitModalOpen(false);
      setResubmitRemarks('');
      await loadApplication();
    } catch (err: any) {
      alert(`Error resubmitting: ${err.message}`);
    }
  };

  const handleCompleteStage = async () => {
    if (!id || !selectedNextStage) return;
    try {
      await api.completeStage(id, selectedNextStage, 'STAGE_ADVANCED', stageComments);
      setCompleteStageModalOpen(false);
      setStageComments('');
      await loadApplication();
    } catch (err: any) {
      alert(`Error completing stage: ${err.message}`);
    }
  };

  const triggerAiScrutiny = async () => {
    if (!id) return;
    setAiLoading(true);
    try {
      const res = await api.runScrutinyAgent(id);
      setScrutinyResult(res);
    } catch (err) {
      console.error('AI Scrutiny failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const triggerAiRisk = async () => {
    if (!id) return;
    setAiLoading(true);
    try {
      const res = await api.runRiskAgent(id);
      setRiskResult(res);
    } catch (err) {
      console.error('AI Risk calculation failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const triggerWorkflowCoordination = async () => {
    if (!id) return;
    setAiLoading(true);
    try {
      const res = await api.runWorkflowAgent(id);
      setWorkflowAgentResult(res);
    } catch (err) {
      console.error('AI Workflow Coordination failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !appData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-32 bg-white rounded-xl border border-slate-200"></div>
        <div className="h-96 bg-white rounded-xl border border-slate-200"></div>
      </div>
    );
  }

  const { application, institution, documents, history, evc } = appData;

  const STAGES_PIPELINE = [
    { key: 'SUBMITTED', label: '1. Submitted' },
    { key: 'UNDER_SCRUTINY', label: '2. Scrutiny' },
    { key: 'EVC_SCHEDULED', label: '3. EVC Visit' },
    { key: 'EVC_COMPLETED', label: '4. Evaluation' },
    { key: 'FINAL_DECISION_PENDING', label: '5. Final Review' },
    { key: 'APPROVED', label: '6. Decree' }
  ];

  // Helper to determine stage state
  const getCurrentStageIndex = () => {
    const s = application.currentStage;
    if (s === 'SUBMITTED') return 0;
    if (s === 'UNDER_SCRUTINY' || s === 'SCRUTINY_REVERTED' || s === 'SCRUTINY_COMPLETED') return 1;
    if (s === 'EVC_SCHEDULED' || s === 'EVC_IN_PROGRESS') return 2;
    if (s === 'EVC_COMPLETED') return 3;
    if (s === 'FINAL_DECISION_PENDING' || s === 'SAC_REVIEW' || s === 'SHC_REVIEW') return 4;
    if (s === 'APPROVED' || s === 'REJECTED') return 5;
    return 0;
  };

  const currentIdx = getCurrentStageIndex();

  return (
    <div className="space-y-6">
      {/* Back Button & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors w-fit"
        >
          <ArrowLeft size={15} />
          Back to Applications List
        </button>

        {/* Permitted Action Buttons based on Role & Stage */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Officer Scrutiny Actions */}
          {(user?.role === 'OFFICER' || user?.role === 'ADMIN') &&
            application.currentStage === 'UNDER_SCRUTINY' && (
              <>
                <button
                  onClick={() => setRevertModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                >
                  Revert for Deficiencies
                </button>
                <button
                  onClick={() => setCompleteStageModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                >
                  Advance Stage
                </button>
              </>
            )}

          {/* Institution Resubmission */}
          {(user?.role === 'INSTITUTION' || user?.role === 'ADMIN') &&
            application.currentStage === 'SCRUTINY_REVERTED' && (
              <button
                onClick={() => setResubmitModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors shadow-xs"
              >
                Submit Rectified Clarification
              </button>
            )}

          {/* Competent Authority Final Decision */}
          {(user?.role === 'COMPETENT_AUTHORITY' || user?.role === 'ADMIN') &&
            application.currentStage === 'FINAL_DECISION_PENDING' && (
              <>
                <button
                  onClick={() => {
                    setSelectedNextStage('REJECTED');
                    setCompleteStageModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 rounded-md transition-colors shadow-xs"
                >
                  Issue Rejection Decree
                </button>
                <button
                  onClick={() => {
                    setSelectedNextStage('APPROVED');
                    setCompleteStageModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                >
                  Grant Letter of Approval (LoA)
                </button>
              </>
            )}

          {/* Generic Advance for other permitted transitions */}
          {user?.role === 'ADMIN' && application.status === 'IN_PROGRESS' && (
            <button
              onClick={() => setCompleteStageModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Manual Stage Transition
            </button>
          )}
        </div>
      </div>

      {/* Primary Application Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {application.id}
              </span>
              <StatusBadge status={application.currentStage} />
              <StatusBadge status={application.priority} />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-600 font-medium">{application.applicationType.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{application.institutionName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official AICTE ID: <span className="font-semibold text-slate-700">{institution?.officialId}</span> · Academic Session {application.academicYear} · Workflow: <span className="font-semibold text-slate-700">{application.workflowPath}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Submission Date</span>
              <span className="font-semibold text-slate-800">{new Date(application.submissionDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">SLA Target</span>
              <span className="font-semibold text-blue-600">{application.targetSlaDate ? new Date(application.targetSlaDate).toLocaleDateString() : '30 Days'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Officer</span>
              <span className="font-semibold text-slate-800">{application.assignedOfficerName || 'Regional Desk'}</span>
            </div>
          </div>
        </div>

        {/* Workflow Stage Stepper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Statutory Regulatory Progression</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STAGES_PIPELINE.map((stg, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div
                  key={stg.key}
                  className={`p-2.5 rounded-lg border text-xs transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{stg.label}</span>
                    {isPast && <Check size={14} className="text-emerald-600" />}
                    {isCurrent && <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8 Detail Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'documents', label: `2. Documents (${documents.length})` },
            { id: 'scrutiny', label: '3. Scrutiny Findings' },
            { id: 'workflow', label: '4. Workflow Timeline' },
            { id: 'evc', label: '5. Expert Evaluation' },
            { id: 'compliance', label: '6. Compliance' },
            { id: 'history', label: `7. Activity Trail (${history.length})` },
            { id: 'ai', label: '8. AI Assistance' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Institution Specifications</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Trust / Society</span>
                <span className="font-semibold text-slate-800">{application.details.trustOrSocietyName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Institution Category</span>
                <span className="font-semibold text-slate-800">{institution?.institutionType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Land Area</span>
                <span className="font-semibold text-slate-800">{application.details.landAreaAcres || 'N/A'} Acres</span>
              </div>
              <div>
                <span className="text-slate-400 block">Sanctioned Built-Up Area</span>
                <span className="font-semibold text-slate-800">{application.details.builtUpAreaSqM?.toLocaleString() || 'N/A'} Sq. Meters</span>
              </div>
              <div>
                <span className="text-slate-400 block">Teaching Faculty Strength</span>
                <span className="font-semibold text-slate-800">{application.details.facultyCount || 'N/A'} Members</span>
              </div>
              <div>
                <span className="text-slate-400 block">Campus Location</span>
                <span className="font-semibold text-slate-800">{institution?.district}, {institution?.state}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Proposed Programs & Intake Capacity</h2>
            <div className="space-y-2">
              {application.details.programsProposed?.map((prog, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-medium text-slate-800">{prog}</span>
                  <span className="text-blue-600 font-semibold text-[11px]">AICTE Approved Track</span>
                </div>
              ))}
            </div>
            <div className="pt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">Total Requested Intake: </span>
              <span className="font-bold text-blue-700">{application.details.totalIntakeRequested} Seats</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Mandatory Statutory Documents</h2>
              <p className="text-xs text-slate-500">Uploaded affidavits, safety NOCs, land titles, and cadre rosters</p>
            </div>
            <button
              onClick={triggerAiScrutiny}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Sparkles size={13} />
              Run AI Document Scrutiny
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Document Type</th>
                  <th className="py-2.5 px-4">File Name</th>
                  <th className="py-2.5 px-4">Validity / Expiry</th>
                  <th className="py-2.5 px-4">Verification Status</th>
                  <th className="py-2.5 px-4">Reviewer Notes</th>
                  <th className="py-2.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {doc.documentType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-blue-600 underline truncate max-w-xs cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                      {doc.fileName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {doc.expiryDate ? doc.expiryDate : 'Perpetual Title'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                      {doc.verifierNotes || 'Awaiting scrutiny'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SCRUTINY FINDINGS */}
      {activeTab === 'scrutiny' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Scrutiny Findings & Discrepancy Ledger</h2>
                <p className="text-xs text-slate-500">Human scrutiny observations and AI suggestions (APH Chapter II Rules)</p>
              </div>
              <button
                onClick={triggerAiScrutiny}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Bot size={14} />
                {aiLoading ? 'Analyzing Documents...' : 'Refresh AI Scrutiny Findings'}
              </button>
            </div>

            {/* AI Scrutiny Output Display */}
            {scrutinyResult ? (
              <div className="space-y-4 mb-6">
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-950">AI Document Scrutiny Assessment Score: </span>
                    <span className="text-lg font-extrabold text-indigo-700 ml-1">{scrutinyResult.scrutinyScore}/100</span>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      Model: {scrutinyResult.modelUsed} · Generated: {new Date(scrutinyResult.generatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                    Human Review Required
                  </span>
                </div>

                <div className="space-y-3">
                  {scrutinyResult.findings.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{f.field}</span>
                        <span className="text-[11px] font-medium text-slate-500">
                          Confidence: {(f.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-slate-600">{f.evidence}</p>
                      <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                        <span className="font-semibold text-blue-700">Recommended Action: </span>
                        {f.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Click "Refresh AI Scrutiny Findings" to scan all uploaded documents with Agent 1.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: WORKFLOW TIMELINE */}
      {activeTab === 'workflow' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Workflow Transitions & Authority Log</h2>
            <p className="text-xs text-slate-500">Chronological transitions verified against backend role permissions</p>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {history.map((h) => (
              <div key={h.id} className="relative">
                <span className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white"></span>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{h.action.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 mt-1">{h.reason}</p>
                  {h.comments && <p className="text-slate-500 italic mt-0.5">{h.comments}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Actor: <span className="font-semibold text-slate-700">{h.actorName}</span> ({h.actorRole})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPERT EVALUATION (EVC) */}
      {activeTab === 'evc' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Expert Visit Committee (EVC) Dossier</h2>
              <p className="text-xs text-slate-500">Statutory on-site physical inspection report and recommendations</p>
            </div>
            {evc && <StatusBadge status={evc.status} />}
          </div>

          {evc ? (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Lead Evaluator</span>
                  <span className="font-semibold text-slate-800">{evc.leadEvaluator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Scheduled Date</span>
                  <span className="font-semibold text-slate-800">{evc.scheduledDate} {evc.scheduledTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Meeting Mode</span>
                  <span className="font-semibold text-slate-800">{evc.meetingMode.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location / Link</span>
                  <span className="font-semibold text-slate-800 truncate">{evc.locationOrMeetingLink || 'Main Campus'}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Inspection Checklist</h3>
                <div className="space-y-1.5">
                  {evc.checklistItems?.map((c, i) => (
                    <div key={i} className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">{c.item}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {c.verified ? 'Verified on Site' : 'Pending Verification'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {evc.findingsSummary && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <h4 className="font-semibold mb-1">EVC Recommendation & Final Report:</h4>
                  <p>{evc.findingsSummary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
              No Expert Visit has been scheduled for this application yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Institution Compliance Record</h2>
            <p className="text-xs text-slate-500">Statutory norms, fire safety, land, and faculty ratio mandates</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <p className="font-semibold text-slate-800 mb-1">Active Mandates Under Review:</p>
            <p className="text-slate-600">
              Fire Safety NOC renewal valid until 17 Nov 2026. Cadre ratio compliance 1:15 satisfied with 88 approved teachers.
            </p>
            <button
              onClick={() => navigate('/compliance')}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Open Full Compliance Center &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: ACTIVITY TRAIL */}
      {activeTab === 'history' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Complete Historical Audit Trail</h2>
            <p className="text-xs text-slate-500">Tamper-evident system activity log for this record</p>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-800">{h.action}</span>
                  <p className="text-slate-600">{h.reason}</p>
                  <span className="text-[11px] text-slate-400">Actor: {h.actorName} ({h.actorRole})</span>
                </div>
                <span className="text-[11px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AI ASSISTANCE */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">AI Assistance Suite (SIH26262 Agents)</h2>
                <p className="text-xs text-slate-500">Autonomous evaluation agents with human review boundaries</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={triggerAiRisk}
                  disabled={aiLoading}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Calculate Risk Index
                </button>
                <button
                  onClick={triggerWorkflowCoordination}
                  disabled={aiLoading}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors"
                >
                  Analyze Next Step
                </button>
              </div>
            </div>

            {/* Risk Agent Result */}
            {riskResult && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Deterministic Risk Index:</span>
                  <span className="text-base font-extrabold text-blue-700">{riskResult.deterministicScore}/100 ({riskResult.riskLevel})</span>
                </div>
                <div className="space-y-1">
                  {riskResult.factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>{f.factor}</span>
                      <span className="font-semibold text-slate-800">+{f.points} pts</span>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px]">
                  <span className="font-semibold text-slate-900">Qualitative AI Synthesis: </span>
                  {riskResult.qualitativeAnalysis}
                </div>
              </div>
            )}

            {/* Workflow Agent Result */}
            {workflowAgentResult && (
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-xs space-y-2 text-indigo-950">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Workflow Coordination Recommendation:</span>
                  <span className="font-semibold text-[11px] text-indigo-700">Assignee: {workflowAgentResult.recommendedAssigneeRole}</span>
                </div>
                <p className="font-semibold text-indigo-900">{workflowAgentResult.suggestedAction}</p>
                <p className="text-[11px] text-indigo-800">{workflowAgentResult.rationale}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDoc.fileName}</h3>
                <p className="text-xs text-slate-500">{selectedDoc.documentType} · Valid to: {selectedDoc.expiryDate || 'Perpetual'}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Extracted OCR Content & Header Excerpt:</span>
              <p className="text-slate-800 font-mono bg-white p-3 rounded border border-slate-200 whitespace-pre-wrap">
                {selectedDoc.extractedText || 'No extracted text available for this binary scan.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={selectedDoc.status} />
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVERT FOR DEFICIENCIES MODAL */}
      {revertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Revert Application to Institution</h3>
            <p className="text-xs text-slate-500">
              State specific statutory deficiencies under APH Chapter II. The institution will be notified and given a 10-day cure period.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Deficiency Reason *</label>
                <input
                  type="text"
                  placeholder="e.g. Fire Safety NOC approaching expiration; renewed receipt required."
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Officer Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions on required attested documents and resolution deadlines..."
                  value={revertComments}
                  onChange={(e) => setRevertComments(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevertModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRevert}
                disabled={!revertReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Reversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUBMIT APPLICATION MODAL */}
      {resubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Submit Rectification Clarification</h3>
            <p className="text-xs text-slate-500">
              Institution declaration regarding uploaded replacement documents and deficiency remedy.
            </p>

            <div className="text-xs">
              <label className="font-semibold text-slate-700 block mb-1">Institution Explanation / Remarks *</label>
              <textarea
                rows={3}
                placeholder="We have uploaded the certified acknowledgment slip from the state fire bureau..."
                value={resubmitRemarks}
                onChange={(e) => setResubmitRemarks(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResubmitModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleResubmit}
                className="px-4 py-2 text-xs font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Submit for Re-Scrutiny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE STAGE / ADVANCE MODAL */}
      {completeStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Advance Workflow Stage</h3>
            <p className="text-xs text-slate-500">
              Move application {application.id} from current stage <span className="font-semibold">{application.currentStage}</span> to next authorized status.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Stage *</label>
                <select
                  value={selectedNextStage}
                  onChange={(e) => setSelectedNextStage(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                >
                  <option value="UNDER_SCRUTINY">Under Scrutiny</option>
                  <option value="SCRUTINY_COMPLETED">Scrutiny Completed</option>
                  <option value="EVC_SCHEDULED">EVC Scheduled</option>
                  <option value="EVC_COMPLETED">EVC Completed</option>
                  <option value="FINAL_DECISION_PENDING">Final Decision Pending</option>
                  <option value="APPROVED">Approved (Grant Letter of Approval)</option>
                  <option value="REJECTED">Rejected (Letter of Rejection)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Officer / Authority Endorsement Comments</label>
                <textarea
                  rows={3}
                  placeholder="Record formal reasons and findings for the immutable audit log..."
                  value={stageComments}
                  onChange={(e) => setStageComments(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCompleteStageModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteStage}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs"
              >
                Confirm Transition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

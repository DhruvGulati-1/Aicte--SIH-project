import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Send,
  Trash2
} from 'lucide-react';
import { api } from '../services/api.js';
import { Institution, ApplicationType, WorkflowPath, PriorityLevel, AicteCourse } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { AICTE_COURSES } from '../data/aicteCoursesData.js';

export const NewApplicationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedInstId, setSelectedInstId] = useState('');
  const [appType, setAppType] = useState<ApplicationType>('EXTENSION_OF_APPROVAL');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [workflowPath, setWorkflowPath] = useState<WorkflowPath>('SCRUTINY_EVC');
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL');

  // Institution details
  const [trustName, setTrustName] = useState('');
  const [landArea, setLandArea] = useState<number>(5.5);
  const [builtUpArea, setBuiltUpArea] = useState<number>(14500);
  const [facultyCount, setFacultyCount] = useState<number>(45);

  // Programs & Intake
  const [programs, setPrograms] = useState<string[]>([
    'B.Tech in Artificial Intelligence & Machine Learning [AICTE-ENG-UG-101] (Intake: 60)',
    'B.Tech in Computer Science & Engineering [AICTE-ENG-UG-102] (Intake: 60)'
  ]);
  const [selectedCatalogCourseId, setSelectedCatalogCourseId] = useState<string>(AICTE_COURSES[0].id);
  const [customProgramInput, setCustomProgramInput] = useState('');
  const [totalIntake, setTotalIntake] = useState(120);

  // Documents
  const [uploadedFiles, setUploadedFiles] = useState<{ type: string; name: string; size: string }[]>([
    { type: 'LAND_TITLE_DEED', name: 'Registered_Land_Title_Deed_Copy.pdf', size: '3.4 MB' },
    { type: 'FIRE_SAFETY_NOC', name: 'State_Fire_Department_NOC_2026.pdf', size: '1.8 MB' },
    { type: 'BUILDING_PLAN_APPROVAL', name: 'Municipal_Sanctioned_Plan.pdf', size: '4.2 MB' },
    { type: 'FACULTY_CADRE_LIST', name: 'Biometric_Faculty_Cadre_Roster.pdf', size: '1.2 MB' }
  ]);

  // Declarations
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  useEffect(() => {
    async function loadInsts() {
      try {
        const res = await api.getInstitutions();
        setInstitutions(res.institutions);
        if (user?.institutionId) {
          setSelectedInstId(user.institutionId);
        } else if (res.institutions.length > 0) {
          setSelectedInstId(res.institutions[0].id);
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      }
    }
    loadInsts();
  }, [user]);

  const addAicteCatalogCourse = () => {
    const found = AICTE_COURSES.find(c => c.id === selectedCatalogCourseId);
    if (found) {
      const entry = `${found.degree} in ${found.courseName} [${found.nomenclatureCode}] (Intake: ${found.standardIntakeUnit})`;
      if (!programs.includes(entry)) {
        setPrograms(prev => [...prev, entry]);
        setTotalIntake(prev => prev + found.standardIntakeUnit);
      }
    }
  };

  const addCustomProgram = () => {
    if (customProgramInput.trim()) {
      setPrograms(prev => [...prev, customProgramInput.trim()]);
      setCustomProgramInput('');
      setTotalIntake(prev => prev + 60);
    }
  };

  const removeProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  const handleFakeFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => [
        ...prev.filter(f => f.type !== type),
        { type, name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedInstId) return alert('Please select an institution.');
    if (!declarationAgreed) return alert('Please confirm statutory declarations before submission.');

    setSubmitting(true);
    try {
      const inst = institutions.find(i => i.id === selectedInstId);
      const payload = {
        institutionId: selectedInstId,
        institutionName: inst?.name || 'Institution',
        applicationType: appType,
        academicYear,
        workflowPath,
        priority,
        details: {
          programsProposed: programs,
          totalIntakeRequested: totalIntake,
          landAreaAcres: landArea,
          builtUpAreaSqM: builtUpArea,
          facultyCount,
          trustOrSocietyName: trustName || 'Registered Educational Society'
        }
      };

      const res = await api.createApplication(payload);
      alert(`Application ${res.id} submitted successfully!`);
      navigate(`/applications/${res.id}`);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    '1. Institution',
    '2. Application Type',
    '3. Infrastructure',
    '4. Programs & Intake',
    '5. Documents',
    '6. Declarations',
    '7. Review & Submit'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AICTE Application Submission Wizard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Step-by-step regulatory application for approval, extension, or expansion under APH 2026-27.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] text-xs">
          {steps.map((st, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div key={st} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className={`font-medium ${isCurrent ? 'text-blue-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {st}
                </span>
                {idx < steps.length - 1 && <span className="h-0.5 w-6 bg-slate-200"></span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Body Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        {/* STEP 1: Select Institution */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Select or Confirm Institution</h2>
            <p className="text-xs text-slate-500">Choose the institution associated with this regulatory approval request.</p>
            <div className="space-y-2">
              {institutions.map(inst => (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstId(inst.id)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedInstId === inst.id
                      ? 'bg-blue-50/80 border-blue-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inst.name}</span>
                    <span className="text-blue-600 font-semibold">{inst.officialId}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{inst.address} · {inst.institutionType}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Application Type & Workflow */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Application Type & Regulatory Path</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Application Type *</label>
                <select
                  value={appType}
                  onChange={e => setAppType(e.target.value as ApplicationType)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                >
                  <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA)</option>
                  <option value="INCREASE_IN_INTAKE">Increase in Intake / Additional Division</option>
                  <option value="NEW_COURSE">Introduction of New Course / Program</option>
                  <option value="NEW_INSTITUTION">Setting up of New Technical Institution</option>
                  <option value="CLOSURE_OF_COURSE">Closure of Course / Program</option>
                  <option value="CHANGE_OF_SITE">Change of Site / Location</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Session *</label>
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                >
                  <option value="2026-2027">2026-2027 (Active Intake)</option>
                  <option value="2027-2028">2027-2028 (Advance Planning)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prescribed Workflow Path *</label>
                <select
                  value={workflowPath}
                  onChange={e => setWorkflowPath(e.target.value as WorkflowPath)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                >
                  <option value="SCRUTINY_EVC">Scrutiny + Expert Visit Committee (Standard)</option>
                  <option value="ONLY_SCRUTINY">Only Scrutiny (Documentary Verification for EoA)</option>
                  <option value="EVC_SAC_SHC">Scrutiny + EVC + Standing Appellate Committee (High Intake)</option>
                  <option value="ONLY_EVC">Only EVC (Physical Verification)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Processing Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as PriorityLevel)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                >
                  <option value="NORMAL">Normal (Standard 30-Day SLA)</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Expedited Hearing</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Infrastructure Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Infrastructure & Trust Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Sponsoring Trust / Society Name *</label>
                <input
                  type="text"
                  placeholder="e.g. National Technical Education Society"
                  value={trustName}
                  onChange={e => setTrustName(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Total Contiguous Land (Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={landArea}
                  onChange={e => setLandArea(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400">AICTE Metro Norm: &ge; 2.5 Acres, Non-Metro: &ge; 4.0 Acres</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sanctioned Built-Up Area (Sq. Meters) *</label>
                <input
                  type="number"
                  value={builtUpArea}
                  onChange={e => setBuiltUpArea(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full-time Regular Faculty Strength *</label>
                <input
                  type="number"
                  value={facultyCount}
                  onChange={e => setFacultyCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Programs & Intake Capacity */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Academic Programs & Official AICTE Nomenclature</h2>
            <p className="text-slate-500">
              Select standardized programs from the official AICTE Approval Process Handbook (APH 2026-27) catalog.
            </p>

            {/* Official Catalog Dropdown Picker */}
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/90 space-y-3">
              <label className="font-bold text-blue-950 block">Select from AICTE Approved Courses:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCatalogCourseId}
                  onChange={e => setSelectedCatalogCourseId(e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-blue-200 bg-white font-medium text-slate-800 focus:outline-hidden"
                >
                  {AICTE_COURSES.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.nomenclatureCode}] {c.degree} in {c.courseName} — {c.programLabel} (Intake: {c.standardIntakeUnit}) {c.isEmergingArea ? '★ Emerging' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAicteCatalogCourse}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
                >
                  + Add AICTE Course
                </button>
              </div>

              {/* Show selected course details */}
              {(() => {
                const active = AICTE_COURSES.find(c => c.id === selectedCatalogCourseId);
                if (!active) return null;
                return (
                  <div className="p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 block">Cadre Ratio Norm:</span>
                      <strong className="text-slate-800">{active.cadreRatioNorm}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Min Lab Space:</span>
                      <strong className="text-slate-800">{active.minimumLabAreaSqM} m²</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Approved Units:</span>
                      <strong className="text-slate-800">{active.maxDivisionsAllowed} Divisions ({active.maxDivisionsAllowed * active.standardIntakeUnit} seats)</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Custom Program Entry */}
            <div className="space-y-1 pt-1">
              <label className="font-semibold text-slate-700 block">Or Add Custom / Interdisciplinary Program:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. M.Tech Autonomous Aerial Vehicles (Intake: 30)"
                  value={customProgramInput}
                  onChange={e => setCustomProgramInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-md border border-slate-200 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addCustomProgram}
                  className="px-3 py-2 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-900"
                >
                  Add Custom
                </button>
              </div>
            </div>

            {/* Selected Programs List */}
            <div className="space-y-2 pt-2">
              <label className="font-bold text-slate-800 block">Proposed Program List for AY 2026-27:</label>
              {programs.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <span className="font-medium text-slate-800">{p}</span>
                  <button type="button" onClick={() => removeProgram(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs">
              <label className="font-semibold text-slate-700 block mb-1">Total Requested Annual Intake (All Programs)</label>
              <input
                type="number"
                value={totalIntake}
                onChange={e => setTotalIntake(parseInt(e.target.value) || 0)}
                className="w-48 p-2.5 rounded-md border border-slate-200 focus:outline-hidden font-bold text-blue-700"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Documents */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Mandatory Statutory Documents</h2>
            <p className="text-xs text-slate-500">Upload attested PDF copies of required statutory documents (Max 10 MB per file).</p>

            <div className="space-y-3">
              {[
                { type: 'LAND_TITLE_DEED', label: '1. Registered Land Title Deed / 30-Year Leasehold' },
                { type: 'FIRE_SAFETY_NOC', label: '2. Fire Safety Certificate (State Fire Service)' },
                { type: 'BUILDING_PLAN_APPROVAL', label: '3. Building Plan Sanction by Local Municipal Authority' },
                { type: 'FACULTY_CADRE_LIST', label: '4. Biometric Faculty Cadre Roster (1:15 & 1:2:6)' }
              ].map(item => {
                const existing = uploadedFiles.find(f => f.type === item.type);
                return (
                  <div key={item.type} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      {existing ? (
                        <p className="text-emerald-700 text-[11px] font-medium mt-0.5">
                          Uploaded: {existing.name} ({existing.size})
                        </p>
                      ) : (
                        <p className="text-amber-600 text-[11px] mt-0.5">Pending upload</p>
                      )}
                    </div>
                    <div>
                      <label className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1">
                        <Upload size={12} />
                        {existing ? 'Replace File' : 'Upload PDF'}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={e => handleFakeFileUpload(item.type, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Declarations */}
        {step === 6 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Statutory Undertaking & Declarations</h2>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-slate-700">
              <p>
                1. We certify that all particulars, land deeds, building approvals, and faculty rosters submitted herein are genuine and strictly compliant with AICTE Regulations and Approval Process Handbook (APH 2026-27).
              </p>
              <p>
                2. The institution agrees to facilitate on-site inspection by the Expert Visit Committee (EVC) and maintain barrier-free campus amenities, fire safety systems, and anti-ragging measures.
              </p>
              <p>
                3. We acknowledge that any false representation or suppression of facts will lead to immediate withdrawal of approval and penal proceedings.
              </p>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={e => setDeclarationAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span className="font-medium text-slate-800">
                I hereby solemnly affirm and accept the statutory declarations on behalf of the sponsoring trust and institution.
              </span>
            </label>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {step === 7 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Review & Confirm Submission</h2>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Institution:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {institutions.find(i => i.id === selectedInstId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Application Type:</span>{' '}
                  <span className="font-bold text-slate-900">{appType.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400">Academic Year:</span>{' '}
                  <span className="font-bold text-slate-900">{academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-400">Workflow Path:</span>{' '}
                  <span className="font-bold text-slate-900">{workflowPath}</span>
                </div>
                <div>
                  <span className="text-slate-400">Land Area:</span>{' '}
                  <span className="font-bold text-slate-900">{landArea} Acres</span>
                </div>
                <div>
                  <span className="text-slate-400">Total Requested Intake:</span>{' '}
                  <span className="font-bold text-blue-700">{totalIntake} Seats</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
              Upon clicking "Submit Regulatory Application", this record will be officially registered in the AICTE Scrutiny Queue and assigned a tracking ID.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Previous Step
          </button>

          {step < 7 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !declarationAgreed}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-xs disabled:opacity-50"
            >
              <Send size={14} />
              {submitting ? 'Registering Application...' : 'Submit Regulatory Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

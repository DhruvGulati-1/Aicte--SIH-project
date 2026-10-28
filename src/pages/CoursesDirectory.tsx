import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Sparkles,
  Cpu,
  GraduationCap,
  Layers,
  Calculator,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Users,
  Flame,
  ArrowRight,
  X
} from 'lucide-react';
import { AICTE_COURSES } from '../data/aicteCoursesData.js';
import { AicteCourse, AicteProgramCategory } from '../types/index.js';

export const CoursesDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [emergingOnly, setEmergingOnly] = useState<boolean>(false);
  const [activeCourseModal, setActiveCourseModal] = useState<AicteCourse | null>(null);

  // Calculator drawer state
  const [calcOpen, setCalcOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'metro' | 'urban' | 'rural'>('urban');
  const [selectedCoursesForCalc, setSelectedCoursesForCalc] = useState<{ course: AicteCourse; divisions: number }[]>([
    { course: AICTE_COURSES[0], divisions: 2 }, // AI/ML 2 divisions (120)
    { course: AICTE_COURSES[1], divisions: 1 }, // CSE 1 division (60)
  ]);

  const filteredCourses = useMemo(() => {
    return AICTE_COURSES.filter(course => {
      const matchesSearch =
        course.courseName.toLowerCase().includes(search.toLowerCase()) ||
        course.nomenclatureCode.toLowerCase().includes(search.toLowerCase()) ||
        course.degree.toLowerCase().includes(search.toLowerCase()) ||
        (course.emergingSubDomain && course.emergingSubDomain.toLowerCase().includes(search.toLowerCase()));

      const matchesProgram = selectedProgram === 'ALL' || course.program === selectedProgram;
      const matchesLevel = selectedLevel === 'ALL' || course.level === selectedLevel;
      const matchesEmerging = !emergingOnly || course.isEmergingArea;

      return matchesSearch && matchesProgram && matchesLevel && matchesEmerging;
    });
  }, [search, selectedProgram, selectedLevel, emergingOnly]);

  // Calculations for the interactive intake & norms calculator
  const totalCalculatedIntake = selectedCoursesForCalc.reduce((acc, curr) => {
    return acc + curr.course.standardIntakeUnit * curr.divisions;
  }, 0);

  // Undergraduate total headcount over 4 years approx: intake * duration
  const totalCalculatedStudents = selectedCoursesForCalc.reduce((acc, curr) => {
    return acc + curr.course.standardIntakeUnit * curr.divisions * curr.course.durationYears;
  }, 0);

  // 1:15 STR for engineering
  const totalFacultyNeeded = Math.ceil(totalCalculatedStudents / 15);
  // 1:2:6 Cadre breakdown (9 units total: 1/9 Professor, 2/9 Associate, 6/9 Assistant)
  const professorsNeeded = Math.max(1, Math.round((totalFacultyNeeded * 1) / 9));
  const assocProfNeeded = Math.max(2, Math.round((totalFacultyNeeded * 2) / 9));
  const asstProfNeeded = Math.max(1, totalFacultyNeeded - professorsNeeded - assocProfNeeded);

  // Land requirement
  const requiredLandAcres =
    selectedLocation === 'metro' ? 2.5 : selectedLocation === 'urban' ? 4.0 : 7.5;

  const totalLabAreaRequired = selectedCoursesForCalc.reduce((acc, curr) => {
    return acc + curr.course.minimumLabAreaSqM * curr.divisions;
  }, 0);

  const addCourseToCalculator = (course: AicteCourse) => {
    const existingIndex = selectedCoursesForCalc.findIndex(c => c.course.id === course.id);
    if (existingIndex >= 0) {
      setSelectedCoursesForCalc(prev =>
        prev.map((item, idx) => (idx === existingIndex ? { ...item, divisions: item.divisions + 1 } : item))
      );
    } else {
      setSelectedCoursesForCalc(prev => [...prev, { course, divisions: 1 }]);
    }
    setCalcOpen(true);
  };

  const removeCourseFromCalc = (index: number) => {
    setSelectedCoursesForCalc(prev => prev.filter((_, i) => i !== index));
  };

  const programTabs: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Programs (AICTE Catalog)' },
    { id: 'ENGINEERING_AND_TECHNOLOGY', label: 'Engineering & Technology' },
    { id: 'MANAGEMENT', label: 'Management (MBA/PGDM)' },
    { id: 'PHARMACY', label: 'Pharmacy (B.Pharm/Pharm.D)' },
    { id: 'COMPUTER_APPLICATIONS', label: 'Computer Applications (MCA)' },
    { id: 'ARCHITECTURE_AND_PLANNING', label: 'Architecture & Planning' },
    { id: 'DESIGN', label: 'Design (B.Des/M.Des)' },
    { id: 'HOTEL_MANAGEMENT', label: 'Hotel Management (BHMCT)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Official Government Tech Authority Styling */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1838] via-[#112352] to-[#1e1b4b] p-6 text-white shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-400/30">
                <ShieldCheck size={13} className="text-blue-400" />
                AICTE Official Nomenclature Directory
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-mono">APH 2026-27 Specification</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Approved Courses & Intake Matrix
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Standardized course nomenclatures, division limits, laboratory space requirements, and mandatory student-faculty cadre norms prescribed by the All India Council for Technical Education.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setCalcOpen(!calcOpen)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
            >
              <Calculator size={16} />
              {calcOpen ? 'Hide Norms Calculator' : 'AICTE Norms Calculator'}
            </button>
            <button
              onClick={() => navigate('/applications/new')}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              Apply for Courses
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive AICTE Norms Calculator Drawer */}
      {calcOpen && (
        <div className="rounded-2xl border-2 border-amber-300/80 bg-amber-50/40 p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Calculator size={18} className="text-amber-700" />
                Statutory AICTE Norms & Infrastructure Calculator (APH 2026-27 Table 2.1 & 5.1)
              </h2>
              <p className="text-xs text-amber-900 mt-0.5">
                Calculates mandatory land, faculty cadres (1:15 & 1:2:6), and laboratory floor areas based on proposed divisions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-900">Campus Location:</span>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value as any)}
                className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950"
              >
                <option value="metro">Mega / Metro City (Delhi, Mumbai, Bengaluru)</option>
                <option value="urban">Urban / State Capital</option>
                <option value="rural">Rural / District Jurisdiction</option>
              </select>
            </div>
          </div>

          {/* Calculator Output KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Proposed Annual Intake</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">{totalCalculatedIntake} Seats</span>
              <span className="text-[10px] text-slate-500">Total Student Strength: ~{totalCalculatedStudents}</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Min. Contiguous Land</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block">{requiredLandAcres} Acres</span>
              <span className="text-[10px] text-slate-500">{selectedLocation.toUpperCase()} Contiguous Title</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Mandatory Regular Faculty</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">{totalFacultyNeeded} Teachers</span>
              <span className="text-[10px] text-emerald-700 font-medium">STR 1:15 Adherence</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Instructional Lab Area</span>
              <span className="text-2xl font-black text-purple-900 mt-1 block">{totalLabAreaRequired} m²</span>
              <span className="text-[10px] text-slate-500">Dedicated Specialty Labs</span>
            </div>
          </div>

          {/* Faculty Cadre Ratio 1:2:6 Breakdown */}
          <div className="rounded-xl border border-amber-200 bg-white p-4 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-800">
                Statutory Cadre Distribution (1 Professor : 2 Associate Professors : 6 Assistant Professors)
              </span>
              <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                AICTE Regulation 4.2
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Professors (Ph.D Mandatory)</span>
                <span className="text-lg font-bold text-slate-900">{professorsNeeded}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Associate Professors</span>
                <span className="text-lg font-bold text-slate-900">{assocProfNeeded}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Assistant Professors</span>
                <span className="text-lg font-bold text-slate-900">{asstProfNeeded}</span>
              </div>
            </div>
          </div>

          {/* Courses in Current Calculation */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">Configured Division Allocation:</span>
            <div className="flex flex-wrap gap-2">
              {selectedCoursesForCalc.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs shadow-2xs"
                >
                  <span className="font-bold text-slate-900">{item.course.degree} {item.course.courseName}</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800 text-[10px]">
                    {item.divisions} Div ({item.divisions * item.course.standardIntakeUnit} seats)
                  </span>
                  <button
                    onClick={() => removeCourseFromCalc(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    title="Remove from calculator"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Program Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {programTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedProgram(tab.id)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-colors ${
              selectedProgram === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative sm:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course name, nomenclature code (e.g. AICTE-ENG-UG-101), or emerging domain..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden text-slate-700 font-medium"
          >
            <option value="ALL">All Academic Levels (UG, PG)</option>
            <option value="UG">Undergraduate (B.Tech, B.Pharm, B.Arch, B.Des)</option>
            <option value="PG">Postgraduate (M.Tech, MBA, MCA, M.Plan)</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emergingOnly}
              onChange={e => setEmergingOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500" />
              Emerging Technologies Only
            </span>
          </label>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider block">
                    {course.nomenclatureCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                    {course.degree} in {course.courseName}
                  </h3>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                  {course.level} · {course.durationYears} Yrs
                </span>
              </div>

              {course.isEmergingArea && (
                <div className="rounded-md bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <Flame size={12} className="text-amber-600 shrink-0" />
                  <span className="font-semibold truncate">{course.emergingSubDomain || 'AICTE Priority Area'}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Standard Division</span>
                  <span className="font-semibold text-slate-800">{course.standardIntakeUnit} Seats/Unit</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cadre Norm</span>
                  <span className="font-semibold text-slate-800">{course.cadreRatioNorm}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Min Lab Area</span>
                  <span className="font-semibold text-slate-800">{course.minimumLabAreaSqM} m²</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Divisions</span>
                  <span className="font-semibold text-slate-800">{course.maxDivisionsAllowed} Units</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setActiveCourseModal(course)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-center"
              >
                Inspect Labs & Norms
              </button>
              <button
                onClick={() => addCourseToCalculator(course)}
                className="rounded-lg bg-blue-50 text-blue-700 border border-blue-200 p-1.5 hover:bg-blue-100 transition-colors"
                title="Add to Intake Calculator"
              >
                <Calculator size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No AICTE courses matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting search filters or select a different program domain.</p>
        </div>
      )}

      {/* DETAIL MODAL FOR COURSE SPECIFICATION */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 block">
                  {activeCourseModal.nomenclatureCode}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeCourseModal.degree} in {activeCourseModal.courseName}
                </h2>
                <span className="text-xs text-slate-500">
                  {activeCourseModal.programLabel} · {activeCourseModal.durationYears} Years Duration · Approved Division: {activeCourseModal.standardIntakeUnit} Seats
                </span>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="rounded-md p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Statutory Lab Requirements */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Mandatory Statutory Laboratories Required by AICTE:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeCourseModal.mandatoryLabs.map((lab, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <span className="font-semibold text-slate-900">{i + 1}.</span> {lab}
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty & Cadre Allocation */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2 text-blue-950">
              <span className="font-bold block">Minimum Faculty Cadre Requirement (Per Approved Division):</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Professors</span>
                  <span className="font-bold text-base text-slate-900">{activeCourseModal.cadreDistribution.professors}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Associate Professors</span>
                  <span className="font-bold text-base text-slate-900">{activeCourseModal.cadreDistribution.associateProfessors}</span>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <span className="text-[10px] text-slate-500 block">Assistant Professors</span>
                  <span className="font-bold text-base text-slate-900">{activeCourseModal.cadreDistribution.assistantProfessors}</span>
                </div>
              </div>
            </div>

            {/* Eligibility & Reference */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Candidate Eligibility Criterion:</span>
                <p className="mt-0.5">{activeCourseModal.eligibilityCriteria}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Statutory Reference: <span className="font-mono text-slate-800">{activeCourseModal.aphChapterReference}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  addCourseToCalculator(activeCourseModal);
                  setActiveCourseModal(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
              >
                <Calculator size={14} /> Calculate Intake & Space
              </button>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

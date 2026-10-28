import { AicteGuidelineChapter } from '../types/index.js';

export const AICTE_GUIDELINE_CHAPTERS: AicteGuidelineChapter[] = [
  {
    id: 'chap-1-greenfield',
    chapterNumber: 'Chapter I',
    title: 'Setting up New Technical Institutions (Greenfield Approval)',
    subTitle: 'Grant of Letter of Intent (LoI) and Letter of Approval (LoA)',
    description: 'Statutory prerequisites, trust registration, land title clear encumbrance norms, and bank guarantees for establishment of new technical campuses.',
    scope: 'Applicable to Registered Societies, Trusts, and Section 8 Companies proposing new technical institutions.',
    clauses: [
      {
        clauseNo: '1.2.1',
        heading: 'Clear & Contiguous Land Ownership Requirement',
        content: 'Land must be registered in the name of the Trust/Society under clean freehold title or a minimum 30-year registered Government lease. No sub-leases or agricultural land without District Collector conversion order are permissible.',
        statutoryThreshold: 'Mega/Metro: ≥ 2.50 Acres contiguous; Urban/State Capital: ≥ 4.00 Acres; Rural/District: ≥ 7.50 Acres.',
        essentialEvidence: 'Certified copy of Registered Title Deed, Khasra/Khatauni revenue record, Non-Encumbrance Certificate (NEC) for last 30 years issued by Sub-Registrar.',
        nonComplianceConsequence: 'Immediate rejection at Scrutiny Stage. No conditional waiver permitted.'
      },
      {
        clauseNo: '1.4.3',
        heading: 'Sanctioned Built-Up Instructional & Administrative Space',
        content: 'Building plan sanctioned by the Competent Town Planning / Municipal Authority. FSI/FAR compliance must be certified by a registered Chartered Architect and Structural Stability Engineer.',
        statutoryThreshold: 'Instructional Area: Minimum 4.0 sq.m per student in Engg/Tech; Admin Area: Minimum 1000 sq.m; Amenities: Minimum 500 sq.m.',
        essentialEvidence: 'Approved Architectural Blueprints with municipal approval number, Structural Stability Certificate, and Occupancy/Completion Certificate.',
        nonComplianceConsequence: 'Reversion for structural clarification or deferral to next academic cycle.'
      },
      {
        clauseNo: '1.7.2',
        heading: 'Statutory Fire Safety NOC from State Director General of Fire Services',
        content: 'A valid Fire Safety NOC covering all blocks, academic wings, multi-story complexes, and hostels issued by the State Fire Services Department.',
        statutoryThreshold: 'Must be unexpired on the date of final evaluation and valid for the entire academic session.',
        essentialEvidence: 'Original Fire Safety Certificate with building hazard classification and hydrants test report.',
        nonComplianceConsequence: 'Statutory deficiency under Supreme Court mandate; application cannot proceed to EVC.'
      }
    ]
  },
  {
    id: 'chap-2-eoa-intake',
    chapterNumber: 'Chapter II',
    title: 'Extension of Approval (EoA) & Variation of Intake',
    subTitle: 'Annual Renewal, Additional Divisions, and Closure/Reduction',
    description: 'Prescribes the procedures for existing institutions seeking annual continuation, intake expansion in high-demand disciplines, or introduction of new divisions.',
    scope: 'Mandatory annual requirement for all AICTE approved institutions operating in India.',
    clauses: [
      {
        clauseNo: '2.3.1',
        heading: 'Mandatory Student-to-Faculty Ratio (STR) & Cadre Adherence',
        content: 'Institutions must maintain regular approved faculty based on the aggregate sanctioned intake across all 4 years of Undergraduate and 2 years of Postgraduate courses.',
        statutoryThreshold: 'Undergraduate Engg/Tech: 1:15 with Cadre Ratio of 1 Professor : 2 Associate Professors : 6 Assistant Professors. Management: 1:20.',
        essentialEvidence: 'Aadhaar-based biometric attendance logs, Form 16, Bank payroll disbursement statements with 7th Central Pay Commission scales.',
        nonComplianceConsequence: 'Intake reduction up to 50% or withdrawal of additional divisions.'
      },
      {
        clauseNo: '2.5.4',
        heading: 'Eligibility Criteria for Increase in Intake & Emerging Areas',
        content: 'Institutions seeking additional divisions or seats in AI, Data Science, VLSI, or Robotics must possess valid NBA accreditation in at least 50% of eligible courses with a minimum score of 650 points.',
        statutoryThreshold: 'Maximum intake limit: Up to 3 divisions (180 seats) in single emerging track; overall campus cap of 1200 UG seats.',
        essentialEvidence: 'NBA Accreditation Letter, Faculty qualification service registers, and GPU computing cluster invoice receipts.',
        nonComplianceConsequence: 'Application restricted to Existing Intake only without expansion.'
      },
      {
        clauseNo: '2.8.1',
        heading: 'Annual Mandatory Online Disclosure (AICTE Web Portal)',
        content: 'Every institution must publish a comprehensive public information bulletin on its website displaying fees approved by State Fee Regulatory Committee, faculty roster with Ph.D details, and admission statistics.',
        statutoryThreshold: 'Updated annually before 31st January for the succeeding academic year.',
        essentialEvidence: 'Live verifiable URL on college official portal with automated checksum.',
        nonComplianceConsequence: 'Rs. 50,000 to Rs. 2,00,000 penalty and withholding of EoA certificate.'
      }
    ]
  },
  {
    id: 'chap-3-emerging-tech',
    chapterNumber: 'Chapter III',
    title: 'Emerging Technologies, Supernumerary Seats & Industry Collaboration',
    subTitle: 'Industry 4.0 Tracks, Semiconductor Mission & International Mobility',
    description: 'Defines the framework for AICTE-approved emerging area disciplines, collaborative twinning programs, and supernumerary admissions (FN/NRI/OCI).',
    scope: 'Technical institutions establishing next-generation computing, clean mobility, or semiconductor infrastructure.',
    clauses: [
      {
        clauseNo: '3.1.2',
        heading: 'Special Incentives for India Semiconductor Mission (ISM) Alignment',
        content: 'Institutions introducing B.Tech in Semiconductor Technology or VLSI Design are permitted to hire up to 25% Professor of Practice / Adjunct Industry Experts without Ph.D requirement if possessing 10+ years fab/design house experience.',
        statutoryThreshold: 'Minimum 10 dedicated licensed EDA tools and cleanroom prototype fabrication workbench.',
        essentialEvidence: 'Industry MoU with certified semiconductor design foundry, laboratory asset register, and EDA software licenses.',
        nonComplianceConsequence: 'Course nomenclature changed back to general Electronics without ISM certification tag.'
      },
      {
        clauseNo: '3.4.1',
        heading: 'Supernumerary Seats for Tuition Fee Waiver (TFW) Scheme',
        content: 'Up to 5% supernumerary seats over and above the sanctioned intake must be reserved for economically weaker meritorious students with annual family income below Rs. 8.0 Lakhs.',
        statutoryThreshold: 'Mandatory 5% over sanctioned intake in all approved programs without infrastructure expansion penalty.',
        essentialEvidence: 'State CET admission allotment lists with TFW waiver code.',
        nonComplianceConsequence: 'Show-cause notice and freeze on intake increases.'
      }
    ]
  },
  {
    id: 'chap-4-scrutiny-evc',
    chapterNumber: 'Chapter IV',
    title: 'Scrutiny, Expert Visit Committee (EVC) & Standing Hearing Committee',
    subTitle: 'Inspection Procedures, On-Site Verifications & Appellate Remedies',
    description: 'Detailed operating procedures governing document scrutiny by regional officers, physical inspections by EVC peer evaluators, and appeals before the Standing Appellate Committee (SAC).',
    scope: 'Administrative review stages conducted by AICTE Regional Offices and statutory committees.',
    clauses: [
      {
        clauseNo: '4.2.3',
        heading: 'Document Scrutiny Timeframes & Deficiency Communication',
        content: 'Scrutiny officers must review submitted digital archives against Chapter II checklists within 10 working days. Any deficiency must be communicated in writing with a 10-day cure window.',
        statutoryThreshold: 'Standard SLA: 30 days from intake closure to Scrutiny Committee final recommendation.',
        essentialEvidence: 'Digital Scrutiny Report signed by two independent academic scrutinizers.',
        nonComplianceConsequence: 'Automatic escalation to Regional Officer / Member Secretary.'
      },
      {
        clauseNo: '4.5.1',
        heading: 'Expert Visit Committee (EVC) Physical Audit Protocols',
        content: 'EVC constitutes a 3-member panel (1 Chairman, 1 Senior Technical Expert, 1 Regional Architect). Panel must conduct physical inspection with geo-tagged video recording of barrier-free ramps, computing labs, and fire safety equipment.',
        statutoryThreshold: 'EVC Report must be uploaded to the central portal within 48 hours of inspection conclusion.',
        essentialEvidence: 'Geo-tagged photographic evidence, attendance register with evaluator signatures, and audio-visual recording disc.',
        nonComplianceConsequence: 'Report rejected as invalid; re-visit conducted at Council expense.'
      },
      {
        clauseNo: '4.9.2',
        heading: 'Appeals before Standing Appellate Committee (SAC)',
        content: 'An institution aggrieved by rejection or intake reduction may file an appeal before SAC within 7 calendar days with non-refundable hearing fee. No new documents not uploaded during original application window may be produced unless specifically requisitioned.',
        statutoryThreshold: 'SAC hearing conducted within 15 days of appeal filing; decision rendered by Competent Authority within 48 hours.',
        essentialEvidence: 'Formal appeal petition referencing specific clause numbers and previously submitted verification receipts.',
        nonComplianceConsequence: 'Final rejection of appeal; judicial review remedy remains with High Court.'
      }
    ]
  },
  {
    id: 'chap-5-safety-norms',
    chapterNumber: 'Chapter V',
    title: 'Norms & Standards for Essential Amenities & Campus Safety',
    subTitle: 'Barrier-Free Access, Anti-Ragging Directives & Student Welfare',
    description: 'Statutory compliance standards ensuring inclusive education for differently-abled students, mental health counseling cells, and 24x7 security surveillance.',
    scope: 'All campuses operating technical degree or diploma courses in India.',
    clauses: [
      {
        clauseNo: '5.1.1',
        heading: 'Universal Barrier-Free Environment & Differently-Abled Amenities',
        content: 'All educational blocks must feature disabled-friendly ramps with handrails, wide elevator access with braille buttons and audio prompts, dedicated unisex accessible washrooms, and tactile flooring guides.',
        statutoryThreshold: '100% ground and upper floor academic accessibility certified by District PWD Engineer.',
        essentialEvidence: 'PWD accessibility audit certificate and geo-tagged photographic panoramic sweep.',
        nonComplianceConsequence: 'Mandatory Rs. 1,00,000 fine and reduction of 20% intake until rectified.'
      },
      {
        clauseNo: '5.4.3',
        heading: 'Supreme Court Mandate on Anti-Ragging Surveillance & Squads',
        content: 'Formation of Anti-Ragging Committee headed by Principal/Director with police and civil representatives. 24x7 IP-based CCTV surveillance in all hostel gates, dining halls, sports arenas, and isolated campus corners.',
        statutoryThreshold: '100% student and parent online undertaking submission via UGC/AICTE portal; CCTV storage minimum 30 days.',
        essentialEvidence: 'Anti-Ragging Committee gazetted order, CCTV DVR server logs, and national portal compliance certificate.',
        nonComplianceConsequence: 'Immediate derecognition and criminal FIR under State Anti-Ragging Acts.'
      }
    ]
  }
];

export const AICTE_CALCULATION_NORMS = {
  landRequirements: {
    metro: { minAcres: 2.5, description: 'Mega/Metro Cities (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad)' },
    urban: { minAcres: 4.0, description: 'State Capitals, Tier-II Cities, and Municipal Corporation areas' },
    rural: { minAcres: 7.5, description: 'Rural and Gram Panchayat jurisdictions (Contiguous title)' }
  },
  cadreRatioEngineeringUG: {
    studentTeacherRatio: 15, // 1:15
    cadreRatio: '1:2:6', // 1 Professor : 2 Associate Professors : 6 Assistant Professors
    formula: 'Total Teachers = (Approved Total Intake * 4 Years) / 15'
  },
  cadreRatioManagementPG: {
    studentTeacherRatio: 20, // 1:20
    cadreRatio: '1:2:3',
    formula: 'Total Teachers = (Approved Total Intake * 2 Years) / 20'
  },
  spaceNorms: {
    classroomsPerDivision: 0.75, // per 60 intake
    classroomAreaSqM: 66,
    tutorialRoomsPerDivision: 0.25,
    tutorialRoomAreaSqM: 33,
    labsPerDivision: 2,
    labAreaSqM: 66,
    adminAreaBaseSqM: 1000,
    amenitiesAreaBaseSqM: 500
  }
};

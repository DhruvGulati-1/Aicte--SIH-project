import { Pool } from 'pg';
import {
  User,
  Institution,
  Application,
  ApplicationHistory,
  DocumentRecord,
  ComplianceItem,
  EvcVisit,
  NotificationItem,
  AuditLogItem,
  RegulatorySource,
  UserRole
} from '../../src/types/index.js';

export interface DatabaseState {
  users: (User & { passwordHash: string })[];
  institutions: Institution[];
  applications: Application[];
  applicationHistory: ApplicationHistory[];
  documents: DocumentRecord[];
  complianceItems: ComplianceItem[];
  evcVisits: EvcVisit[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  regulatorySources: RegulatorySource[];
}

let pgPool: Pool | null = null;
export let isPostgresConnected = false;
export let databaseMode: 'PostgreSQL' | 'DevPersistence' = 'DevPersistence';
export let databaseMessage = 'Running with persistent development data store. Provide DATABASE_URL to connect live PostgreSQL.';

// In-Memory store initialized with comprehensive seed data
export const store: DatabaseState = {
  users: [
    {
      id: 'usr-admin-1',
      name: 'Dr. Rajiv Malhotra',
      email: 'admin@regulaflow.gov.in',
      passwordHash: 'admin123',
      role: 'ADMIN',
      designation: 'Chief Technology Director',
      department: 'Approval Bureau & Digital Systems',
      createdAt: '2026-01-10T09:00:00Z'
    },
    {
      id: 'usr-ca-1',
      name: 'Prof. Surendra Mohan',
      email: 'ca@aicte-india.org',
      passwordHash: 'ca123',
      role: 'COMPETENT_AUTHORITY',
      designation: 'Member Secretary & Appellate Officer',
      department: 'Executive Council Review',
      createdAt: '2026-01-11T10:00:00Z'
    },
    {
      id: 'usr-officer-1',
      name: 'Dr. Ananya Sharma',
      email: 'officer.sharma@aicte-india.org',
      passwordHash: 'officer123',
      role: 'OFFICER',
      designation: 'Senior Scrutiny Officer',
      department: 'Northern Regional Office (NRO)',
      createdAt: '2026-01-15T09:30:00Z'
    },
    {
      id: 'usr-inst-1',
      name: 'Prof. R. Venkatesh',
      email: 'principal@iitdelhi.ac.in',
      passwordHash: 'inst123',
      role: 'INSTITUTION',
      institutionId: 'inst-001',
      designation: 'Dean of Academic Operations',
      department: 'Directorate of Technical Education',
      createdAt: '2026-01-20T11:00:00Z'
    },
    {
      id: 'usr-evc-1',
      name: 'Dr. K. N. Rao',
      email: 'evaluator.rao@aicte-evc.org',
      passwordHash: 'evc123',
      role: 'EVC',
      designation: 'Chairperson, Expert Evaluation Committee',
      department: 'National Evaluation & Accreditation Cell',
      createdAt: '2026-01-25T14:00:00Z'
    }
  ],

  institutions: [
    {
      id: 'inst-001',
      officialId: '1-10928374',
      name: 'Delhi Institute of Engineering & Advanced Technology',
      state: 'Delhi',
      district: 'South Delhi',
      address: 'Hauz Khas Institutional Area, New Delhi 110016',
      institutionType: 'Engineering & Technology',
      sourceName: 'AICTE Public Directory Snapshot 2026',
      sourceUrl: 'https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php',
      sourceSnapshotDate: '2026-02-15',
      contactEmail: 'admissions@delhi-engg.edu.in',
      contactPhone: '+91 11 2659 7135',
      headOfInstitution: 'Prof. R. Venkatesh',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-10-20T16:00:00Z'
    },
    {
      id: 'inst-002',
      officialId: '1-23847119',
      name: 'Maharashtra Institute of Technology & Management',
      state: 'Maharashtra',
      district: 'Pune',
      address: 'Survey No. 124, Paud Road, Kothrud, Pune 411038',
      institutionType: 'Management & Technology',
      sourceName: 'AICTE Public Directory Snapshot 2026',
      sourceUrl: 'https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php',
      sourceSnapshotDate: '2026-02-15',
      contactEmail: 'registrar@mitm-pune.ac.in',
      contactPhone: '+91 20 3027 3400',
      headOfInstitution: 'Dr. Sunita Kulkarni',
      createdAt: '2026-01-18T11:30:00Z',
      updatedAt: '2026-10-18T14:20:00Z'
    },
    {
      id: 'inst-003',
      officialId: '1-38495720',
      name: 'Karnataka College of Pharmacy & Health Sciences',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      address: 'R.V. Vidyanikethan Post, Mysuru Road, Bengaluru 560059',
      institutionType: 'Pharmacy',
      sourceName: 'AICTE Public Directory Snapshot 2026',
      sourceUrl: 'https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php',
      sourceSnapshotDate: '2026-02-15',
      contactEmail: 'info@kcphs-edu.in',
      contactPhone: '+91 80 6717 8000',
      headOfInstitution: 'Dr. C. N. Murthy',
      createdAt: '2026-02-01T08:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z'
    },
    {
      id: 'inst-004',
      officialId: '1-49582014',
      name: 'Tamil Nadu School of Architecture & Urban Design',
      state: 'Tamil Nadu',
      district: 'Chennai',
      address: 'Sardar Patel Road, Guindy, Chennai 600025',
      institutionType: 'Architecture & Planning',
      sourceName: 'AICTE Public Directory Snapshot 2026',
      sourceUrl: 'https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php',
      sourceSnapshotDate: '2026-02-15',
      contactEmail: 'director@tnsa-chennai.org',
      contactPhone: '+91 44 2235 7004',
      headOfInstitution: 'Ar. V. Soundararajan',
      createdAt: '2026-02-10T14:15:00Z',
      updatedAt: '2026-10-22T09:45:00Z'
    },
    {
      id: 'inst-005',
      officialId: '1-58392019',
      name: 'Gujarat Technical Institute of Applied AI & Robotics',
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'Opp. Gujarat High Court, S.G. Highway, Ahmedabad 380060',
      institutionType: 'Engineering & Technology',
      sourceName: 'AICTE Public Directory Snapshot 2026',
      sourceUrl: 'https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php',
      sourceSnapshotDate: '2026-02-15',
      contactEmail: 'contact@gtiai.ac.in',
      contactPhone: '+91 79 2685 0123',
      headOfInstitution: 'Dr. Bhavesh Patel',
      createdAt: '2026-03-05T09:00:00Z',
      updatedAt: '2026-10-25T17:30:00Z'
    }
  ],

  applications: [
    {
      id: 'app-2026-001',
      institutionId: 'inst-001',
      institutionName: 'Delhi Institute of Engineering & Advanced Technology',
      applicationType: 'EXTENSION_OF_APPROVAL',
      academicYear: '2026-2027',
      workflowPath: 'SCRUTINY_EVC',
      currentStage: 'UNDER_SCRUTINY',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedOfficerId: 'usr-officer-1',
      assignedOfficerName: 'Dr. Ananya Sharma',
      submissionDate: '2026-10-05T10:30:00Z',
      targetSlaDate: '2026-11-05T18:00:00Z',
      lastUpdated: '2026-10-24T14:20:00Z',
      details: {
        programsProposed: ['B.Tech Computer Science & AI (Intake: 180)', 'B.Tech Electronics & VLSI (Intake: 120)', 'M.Tech Data Science (Intake: 30)'],
        totalIntakeRequested: 330,
        landAreaAcres: 12.5,
        builtUpAreaSqM: 24500,
        facultyCount: 88,
        trustOrSocietyName: 'National Education & Research Foundation',
        remarks: 'Annual Extension of Approval with 60 additional intake in CSE-AI track.'
      },
      scrutinyScore: 84,
      riskScore: 28,
      riskFactors: ['Fire Safety NOC renews in 22 days', 'Cadre ratio in ECE has 1 associate professor deficit']
    },
    {
      id: 'app-2026-002',
      institutionId: 'inst-002',
      institutionName: 'Maharashtra Institute of Technology & Management',
      applicationType: 'INCREASE_IN_INTAKE',
      academicYear: '2026-2027',
      workflowPath: 'EVC_SAC_SHC',
      currentStage: 'EVC_SCHEDULED',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      assignedOfficerId: 'usr-officer-1',
      assignedOfficerName: 'Dr. Ananya Sharma',
      submissionDate: '2026-09-15T09:00:00Z',
      targetSlaDate: '2026-10-30T18:00:00Z',
      lastUpdated: '2026-10-25T11:45:00Z',
      details: {
        programsProposed: ['MBA Business Analytics (Intake +60)', 'MCA Cloud Computing (Intake +60)'],
        totalIntakeRequested: 120,
        landAreaAcres: 6.2,
        builtUpAreaSqM: 18200,
        facultyCount: 52,
        trustOrSocietyName: 'Maharashtra Vidya Prasarak Mandal',
        remarks: 'Expansion of postgraduate computing programs with new lab wing.'
      },
      scrutinyScore: 92,
      riskScore: 45,
      riskFactors: ['Approaching SLA deadline in 4 days', 'Hostel infrastructure verification required during visit']
    },
    {
      id: 'app-2026-003',
      institutionId: 'inst-003',
      institutionName: 'Karnataka College of Pharmacy & Health Sciences',
      applicationType: 'NEW_COURSE',
      academicYear: '2026-2027',
      workflowPath: 'ONLY_SCRUTINY',
      currentStage: 'SCRUTINY_REVERTED',
      status: 'AWAITING_INSTITUTION',
      priority: 'NORMAL',
      assignedOfficerId: 'usr-officer-1',
      assignedOfficerName: 'Dr. Ananya Sharma',
      submissionDate: '2026-10-10T12:00:00Z',
      targetSlaDate: '2026-11-15T18:00:00Z',
      lastUpdated: '2026-10-22T16:10:00Z',
      details: {
        programsProposed: ['Pharm.D (Doctor of Pharmacy - 30 seats)'],
        totalIntakeRequested: 30,
        landAreaAcres: 4.8,
        builtUpAreaSqM: 12400,
        facultyCount: 38,
        trustOrSocietyName: 'Karnataka Healthcare Trust',
        remarks: 'Introduction of Pharm.D curriculum linked with 300-bed multi-specialty hospital MoU.'
      },
      scrutinyScore: 68,
      riskScore: 62,
      riskFactors: ['Hospital affiliation MoU validity clarification required', 'Machine room equipment invoice missing stamp']
    },
    {
      id: 'app-2026-004',
      institutionId: 'inst-004',
      institutionName: 'Tamil Nadu School of Architecture & Urban Design',
      applicationType: 'EXTENSION_OF_APPROVAL',
      academicYear: '2026-2027',
      workflowPath: 'ONLY_SCRUTINY',
      currentStage: 'FINAL_DECISION_PENDING',
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      assignedOfficerId: 'usr-officer-1',
      assignedOfficerName: 'Dr. Ananya Sharma',
      submissionDate: '2026-09-01T15:20:00Z',
      targetSlaDate: '2026-10-28T18:00:00Z',
      lastUpdated: '2026-10-26T10:00:00Z',
      details: {
        programsProposed: ['B.Arch Architecture (Intake: 80)', 'M.Plan Urban Planning (Intake: 20)'],
        totalIntakeRequested: 100,
        landAreaAcres: 3.5,
        builtUpAreaSqM: 9800,
        facultyCount: 29,
        trustOrSocietyName: 'Southern Architectural Society',
        remarks: 'All scrutiny items verified. Final decision awaiting Competent Authority approval.'
      },
      scrutinyScore: 98,
      riskScore: 12,
      riskFactors: []
    },
    {
      id: 'app-2026-005',
      institutionId: 'inst-005',
      institutionName: 'Gujarat Technical Institute of Applied AI & Robotics',
      applicationType: 'NEW_INSTITUTION',
      academicYear: '2026-2027',
      workflowPath: 'SCRUTINY_EVC',
      currentStage: 'EVC_COMPLETED',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedOfficerId: 'usr-officer-1',
      assignedOfficerName: 'Dr. Ananya Sharma',
      submissionDate: '2026-08-20T11:00:00Z',
      targetSlaDate: '2026-11-01T18:00:00Z',
      lastUpdated: '2026-10-25T18:30:00Z',
      details: {
        programsProposed: ['B.Tech Robotics & Automation (Intake: 120)', 'B.Tech AI & Data Science (Intake: 120)'],
        totalIntakeRequested: 240,
        landAreaAcres: 15.0,
        builtUpAreaSqM: 32000,
        facultyCount: 42,
        trustOrSocietyName: 'Gujarat Advanced Tech Foundation',
        remarks: 'Greenfield institution setup. Expert Visit Committee completed onsite inspection on Oct 24.'
      },
      scrutinyScore: 91,
      riskScore: 24,
      riskFactors: ['Library physical book procurement in-transit receipt submitted']
    }
  ],

  applicationHistory: [
    {
      id: 'hist-001',
      applicationId: 'app-2026-001',
      fromStage: 'SUBMITTED',
      toStage: 'UNDER_SCRUTINY',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'INITIATE_SCRUTINY',
      reason: 'Application verified for mandatory fee and preliminary documentation completeness.',
      comments: 'Commencing detailed scrutiny of Land, Building Safety, and Cadre Ratio.',
      timestamp: '2026-10-06T11:15:00Z'
    },
    {
      id: 'hist-002',
      applicationId: 'app-2026-002',
      fromStage: 'SCRUTINY_COMPLETED',
      toStage: 'EVC_SCHEDULED',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'SCHEDULE_EVC',
      reason: 'Physical infrastructure expansion requires on-ground verification.',
      comments: 'EVC panel constituted under Dr. K. N. Rao for October 29 inspection.',
      timestamp: '2026-10-21T15:00:00Z'
    },
    {
      id: 'hist-003',
      applicationId: 'app-2026-003',
      fromStage: 'UNDER_SCRUTINY',
      toStage: 'SCRUTINY_REVERTED',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'REVERT_FOR_DEFICIENCY',
      reason: 'Hospital affiliation agreement expired on Sept 30, 2026; renewal stamp missing.',
      comments: 'Institution requested to upload certified renewed MOU and equipment bills within 10 days.',
      timestamp: '2026-10-22T16:10:00Z'
    },
    {
      id: 'hist-004',
      applicationId: 'app-2026-004',
      fromStage: 'SCRUTINY_COMPLETED',
      toStage: 'FINAL_DECISION_PENDING',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'FORWARD_FOR_APPROVAL',
      reason: 'All checklist parameters 100% compliant under Chapter II norms.',
      comments: 'Recommended for approval of EoA 2026-27 without conditions.',
      timestamp: '2026-10-26T10:00:00Z'
    },
    {
      id: 'hist-005',
      applicationId: 'app-2026-005',
      fromStage: 'EVC_IN_PROGRESS',
      toStage: 'EVC_COMPLETED',
      actorId: 'usr-evc-1',
      actorName: 'Dr. K. N. Rao',
      actorRole: 'EVC',
      action: 'SUBMIT_EVC_REPORT',
      reason: 'On-site physical inspection conducted. Verification checklist completed.',
      comments: 'Labs, classrooms, administrative block, and sports amenities satisfy AICTE Chapter I.',
      timestamp: '2026-10-25T18:30:00Z'
    }
  ],

  documents: [
    {
      id: 'doc-001',
      applicationId: 'app-2026-001',
      documentType: 'LAND_TITLE_DEED',
      fileName: 'IITD_Registered_Land_Title_12_Acres.pdf',
      fileSize: 4820300,
      uploadedAt: '2026-10-05T09:40:00Z',
      expiryDate: '2050-12-31',
      status: 'VERIFIED',
      verifierNotes: 'Registered government perpetual leasehold verified with Delhi Land Revenue Records.',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-08T14:10:00Z',
      extractedText: 'Registered Lease Deed No. 4920/Book 1. Lessee: Delhi Institute of Engineering. Land Area: 12.50 Acres at Hauz Khas. Zoned for Institutional Technical Education.',
      ocrConfidence: 0.98
    },
    {
      id: 'doc-002',
      applicationId: 'app-2026-001',
      documentType: 'FIRE_SAFETY_NOC',
      fileName: 'Delhi_Fire_Service_NOC_2025_2026.pdf',
      fileSize: 2190400,
      uploadedAt: '2026-10-05T09:45:00Z',
      expiryDate: '2026-11-17', // Expiring in 22 days!
      status: 'CORRECTION_REQUIRED',
      verifierNotes: 'NOC expires on 17 Nov 2026. Renewal application acknowledgment receipt must be furnished.',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-09T11:20:00Z',
      extractedText: 'Government of NCT of Delhi, Delhi Fire Service. Certificate of Fire Safety valid up to 17/11/2026. Coverage: Blocks A, B, C and Main Academic Complex.',
      ocrConfidence: 0.95
    },
    {
      id: 'doc-003',
      applicationId: 'app-2026-001',
      documentType: 'FACULTY_CADRE_LIST',
      fileName: 'Faculty_Cadre_Roster_Biometric_2026.pdf',
      fileSize: 1840000,
      uploadedAt: '2026-10-05T09:50:00Z',
      status: 'UNDER_REVIEW',
      verifierNotes: 'AI Scrutiny flagged 1:15 ratio satisfied overall, but Cadre Ratio (1:2:6) shows 1 deficit in ECE.',
      extractedText: 'AICTE Faculty Roster 2026-27. Total Approved Faculty: 88. Professors: 10, Associate Professors: 19, Assistant Professors: 59. AICTE Cadre Norm 1:2:6.',
      ocrConfidence: 0.92
    },
    {
      id: 'doc-004',
      applicationId: 'app-2026-002',
      documentType: 'BUILDING_PLAN_APPROVAL',
      fileName: 'Pune_Municipal_Sanctioned_Plan_2026.pdf',
      fileSize: 6710200,
      uploadedAt: '2026-09-15T08:50:00Z',
      status: 'VERIFIED',
      verifierNotes: 'Sanction order from Pune Municipal Corporation verified with barcode.',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-09-20T10:00:00Z',
      extractedText: 'Pune Municipal Corporation, Building Permission Dept. Sanction Order No: PMC/BP/2025/9982. Built-up area permissible: 18,500 sq.m.',
      ocrConfidence: 0.97
    },
    {
      id: 'doc-005',
      applicationId: 'app-2026-003',
      documentType: 'HOSPITAL_AFFILIATION_MOU',
      fileName: 'Hospital_300Bed_MoU_Karnataka.pdf',
      fileSize: 3100000,
      uploadedAt: '2026-10-10T11:40:00Z',
      expiryDate: '2026-09-30', // EXPIRED!
      status: 'REJECTED',
      verifierNotes: 'MoU expired on 30 Sept 2026. Reverted to institution for current valid agreement.',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-22T16:00:00Z',
      extractedText: 'Memorandum of Understanding for Clinical Pharmacy Training. Period of validity: 1st October 2023 to 30th September 2026. Signatories: Dean & Medical Director.',
      ocrConfidence: 0.94
    }
  ],

  complianceItems: [
    {
      id: 'comp-001',
      institutionId: 'inst-001',
      institutionName: 'Delhi Institute of Engineering & Advanced Technology',
      requirementCode: 'AICTE-NORM-FS-01',
      title: 'Valid Fire Safety NOC from State Authority',
      category: 'FIRE_SAFETY',
      requiredEvidence: 'Annual Certificate of Fire Compliance from Delhi Fire Service',
      submissionDate: '2025-11-18',
      dueDate: '2026-11-17',
      expiryDate: '2026-11-17',
      status: 'EXPIRED', // Approaching deadline / expiring within 30 days
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-09T11:20:00Z',
      reviewerComments: 'Renewal processing slip requested from institution.',
      evidenceDocumentName: 'Delhi_Fire_Service_NOC_2025_2026.pdf'
    },
    {
      id: 'comp-002',
      institutionId: 'inst-001',
      institutionName: 'Delhi Institute of Engineering & Advanced Technology',
      requirementCode: 'AICTE-NORM-FCR-02',
      title: 'Mandatory Student-Faculty Cadre Ratio (1:15 & 1:2:6)',
      category: 'FACULTY_RATIO',
      requiredEvidence: 'Biometric Attendance & Pay Scale Certification under 7th CPC',
      submissionDate: '2026-10-05',
      dueDate: '2026-12-31',
      status: 'COMPLIANT',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-12T15:30:00Z',
      reviewerComments: 'Verified against AICTE portal faculty database.',
      evidenceDocumentName: 'Faculty_Cadre_Roster_Biometric_2026.pdf'
    },
    {
      id: 'comp-003',
      institutionId: 'inst-002',
      institutionName: 'Maharashtra Institute of Technology & Management',
      requirementCode: 'AICTE-NORM-AR-03',
      title: 'Anti-Ragging Squad & CCTV Surveillance in All Hostels',
      category: 'ANTI_RAGGING',
      requiredEvidence: 'Statutory Anti-Ragging Committee Notification & Geo-tagged Hostel Photos',
      submissionDate: '2026-08-15',
      dueDate: '2026-11-01',
      status: 'COMPLIANT',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-08-28T09:00:00Z',
      reviewerComments: 'UGC & AICTE Anti-ragging undertaking 100% completed by all students.',
      evidenceDocumentName: 'Anti_Ragging_Affidavits_Summary_2026.pdf'
    },
    {
      id: 'comp-004',
      institutionId: 'inst-003',
      institutionName: 'Karnataka College of Pharmacy & Health Sciences',
      requirementCode: 'AICTE-NORM-MED-04',
      title: '300-Bed Tertiary Care Hospital Clinical Tie-Up',
      category: 'AFFILIATION',
      requiredEvidence: 'Valid Registered MoU with NABH accredited hospital within 15km radius',
      submissionDate: '2026-10-10',
      dueDate: '2026-10-20',
      expiryDate: '2026-09-30',
      status: 'OVERDUE',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-10-22T16:00:00Z',
      reviewerComments: 'Document expired on Sept 30, 2026. Overdue by 6 days.',
      evidenceDocumentName: 'Hospital_300Bed_MoU_Karnataka.pdf'
    },
    {
      id: 'comp-005',
      institutionId: 'inst-004',
      institutionName: 'Tamil Nadu School of Architecture & Urban Design',
      requirementCode: 'AICTE-NORM-COA-05',
      title: 'Council of Architecture (CoA) Faculty Registration Verification',
      category: 'FACULTY_RATIO',
      requiredEvidence: 'CoA Valid Registration certificates for all teaching faculty',
      submissionDate: '2026-09-01',
      dueDate: '2026-12-15',
      status: 'COMPLIANT',
      verifiedBy: 'Dr. Ananya Sharma',
      verifiedAt: '2026-09-10T16:45:00Z',
      reviewerComments: 'All 29 faculty verified on CoA portal.',
      evidenceDocumentName: 'CoA_Registrations_Consolidated_2026.pdf'
    }
  ],

  evcVisits: [
    {
      id: 'evc-2026-01',
      applicationId: 'app-2026-002',
      institutionId: 'inst-002',
      institutionName: 'Maharashtra Institute of Technology & Management',
      scheduledDate: '2026-10-29',
      scheduledTime: '10:00 AM IST',
      status: 'SCHEDULED',
      leadEvaluator: 'Dr. K. N. Rao (IIT Bombay Former HOD)',
      evaluatorTeam: ['Dr. Meera Nambiar (NIT Surat)', 'Dr. Rajesh Deshmukh (VJTI Mumbai)'],
      meetingMode: 'PHYSICAL_ONSITE',
      locationOrMeetingLink: 'Campus Admin Block Conference Room 2, Kothrud, Pune',
      checklistItems: [
        { item: 'Verification of barrier-free campus and lifts', verified: false, remarks: 'To inspect during tour' },
        { item: 'Inspection of High-Performance Computing Lab (Intake expansion)', verified: false },
        { item: 'Verification of Library titles (minimum 2500 new volumes)', verified: false },
        { item: 'Biometric log random sample check with teaching faculty', verified: false }
      ],
      evaluationNotes: 'Physical visit confirmed with institution director Dr. Sunita Kulkarni. Travel itineraries finalized.'
    },
    {
      id: 'evc-2026-02',
      applicationId: 'app-2026-005',
      institutionId: 'inst-005',
      institutionName: 'Gujarat Technical Institute of Applied AI & Robotics',
      scheduledDate: '2026-10-24',
      scheduledTime: '09:30 AM IST',
      status: 'COMPLETED',
      leadEvaluator: 'Dr. K. N. Rao',
      evaluatorTeam: ['Prof. Arvind Joshi (SVNIT Surat)', 'Dr. Neha Shah (LD College of Engg)'],
      meetingMode: 'PHYSICAL_ONSITE',
      locationOrMeetingLink: 'Ahmedabad Campus Board Room',
      checklistItems: [
        { item: 'Physical Land title and boundary wall fencing', verified: true, remarks: '15 Acres contiguous land verified' },
        { item: 'Ready-to-use Classrooms & Smart Boards (8 required)', verified: true, remarks: '10 equipped smart classrooms verified' },
        { item: 'Industrial Robotics & Embedded Labs', verified: true, remarks: 'ABB and Kuka robotic arms commissioned' },
        { item: 'Sewage Treatment Plant & Solar Panels', verified: true, remarks: '50kW solar rooftop operational' }
      ],
      evaluationNotes: 'Excellent infrastructure meeting greenfield technical campus criteria under AICTE norms.',
      findingsSummary: 'Committee strongly recommends granting Letter of Approval (LoA) for academic session 2026-27.',
      reportSubmittedAt: '2026-10-25T18:00:00Z',
      completedAt: '2026-10-25T18:30:00Z'
    }
  ],

  notifications: [
    {
      id: 'notif-001',
      role: 'OFFICER',
      title: 'Expiring Fire Safety NOC Alert',
      message: 'Delhi Institute of Engineering NOC expires in 22 days (17 Nov 2026). Action required.',
      category: 'DEADLINE',
      severity: 'WARNING',
      applicationId: 'app-2026-001',
      institutionId: 'inst-001',
      read: false,
      createdAt: '2026-10-26T08:00:00Z'
    },
    {
      id: 'notif-002',
      role: 'EVC',
      title: 'Upcoming Expert Visit in 2 Days',
      message: 'Onsite inspection scheduled for MITM Pune on 29 Oct 2026 at 10:00 AM IST.',
      category: 'EVC',
      severity: 'INFO',
      applicationId: 'app-2026-002',
      institutionId: 'inst-002',
      read: false,
      createdAt: '2026-10-26T09:30:00Z'
    },
    {
      id: 'notif-003',
      role: 'COMPETENT_AUTHORITY',
      title: 'Final Decision Pending for Approval',
      message: 'Application app-2026-004 (Tamil Nadu School of Architecture) awaits final review.',
      category: 'WORKFLOW',
      severity: 'SUCCESS',
      applicationId: 'app-2026-004',
      institutionId: 'inst-004',
      read: false,
      createdAt: '2026-10-26T10:05:00Z'
    },
    {
      id: 'notif-004',
      userId: 'usr-inst-1',
      role: 'INSTITUTION',
      title: 'Scrutiny Clarification Requested',
      message: 'Please provide updated Fire Safety renewal slip for application app-2026-001.',
      category: 'SCRUTINY',
      severity: 'WARNING',
      applicationId: 'app-2026-001',
      institutionId: 'inst-001',
      read: true,
      createdAt: '2026-10-24T14:25:00Z'
    }
  ],

  auditLogs: [
    {
      id: 'audit-001',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'SCRUTINY_FINDING_RECORDED',
      targetType: 'APPLICATION',
      targetId: 'app-2026-001',
      summary: 'Recorded deficiency regarding Fire Safety NOC upcoming expiry on 17 Nov 2026.',
      metadata: { field: 'FIRE_SAFETY_NOC', status: 'CORRECTION_REQUIRED' },
      timestamp: '2026-10-09T11:20:00Z'
    },
    {
      id: 'audit-002',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'EVC_PANEL_CONSTITUTED',
      targetType: 'EVC',
      targetId: 'evc-2026-01',
      summary: 'Assigned Dr. K. N. Rao as lead evaluator for MITM Pune intake expansion.',
      metadata: { scheduledDate: '2026-10-29' },
      timestamp: '2026-10-21T15:00:00Z'
    },
    {
      id: 'audit-003',
      actorId: 'usr-evc-1',
      actorName: 'Dr. K. N. Rao',
      actorRole: 'EVC',
      action: 'EVC_REPORT_FINALIZED',
      targetType: 'EVC',
      targetId: 'evc-2026-02',
      summary: 'Submitted unanimous positive recommendation report for Gujarat Technical Institute.',
      metadata: { recommendation: 'GRANT_LOA' },
      timestamp: '2026-10-25T18:30:00Z'
    },
    {
      id: 'audit-004',
      actorId: 'usr-officer-1',
      actorName: 'Dr. Ananya Sharma',
      actorRole: 'OFFICER',
      action: 'STAGE_COMPLETED_FORWARDED',
      targetType: 'APPLICATION',
      targetId: 'app-2026-004',
      summary: 'Completed scrutiny stage for Tamil Nadu School of Architecture; forwarded to Competent Authority.',
      metadata: { fromStage: 'SCRUTINY_COMPLETED', toStage: 'FINAL_DECISION_PENDING' },
      timestamp: '2026-10-26T10:00:00Z'
    }
  ],

  regulatorySources: [
    {
      id: 'reg-001',
      title: 'AICTE Approval Process Handbook (APH) 2026-2027',
      issuingAuthority: 'All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India',
      publicationDate: '2026-01-05',
      effectiveDate: '2026-04-01',
      version: 'APH-2026-27-REV-1',
      sourceUrl: 'https://www.aicte-india.org/bulletins/approval-process-handbook',
      status: 'INDEXED',
      chunksCount: 148,
      uploadedAt: '2026-01-10T12:00:00Z',
      samplePassage: 'Chapter I Section 1.4: Grant of Approval through Scrutiny and Expert Visit Committee. For Extension of Approval with increase in intake exceeding 60 seats in existing technical disciplines, verification of physical infrastructure, computing facilities, and cadre ratio under Table 2.1 is mandatory before consideration by the Standing Hearing Committee.'
    },
    {
      id: 'reg-002',
      title: 'AICTE Norms & Standards for Faculty Cadre Ratio & Qualifications',
      issuingAuthority: 'AICTE Statutory Regulations Board',
      publicationDate: '2025-11-20',
      effectiveDate: '2026-01-01',
      version: 'FCR-2026-V2',
      sourceUrl: 'https://www.aicte-india.org/bureaus/faculty-development',
      status: 'INDEXED',
      chunksCount: 64,
      uploadedAt: '2026-01-12T14:30:00Z',
      samplePassage: 'Regulation 4.2: Undergraduate Engineering Programs must maintain a minimum Teacher to Student Ratio of 1:15 with Cadre Ratio of 1:2:6 (Professor : Associate Professor : Assistant Professor). In newly introduced Emerging Technologies (AI, ML, Robotics, VLSI), up to 20% adjunct industry faculty possessing M.Tech/Ph.D with 10+ years industrial experience can be counted toward the required cadre.'
    },
    {
      id: 'reg-003',
      title: 'Mandatory Land & Built-up Space Requirements for Technical Institutions',
      issuingAuthority: 'AICTE Infrastructure & Facilities Bureau',
      publicationDate: '2025-10-15',
      effectiveDate: '2026-01-01',
      version: 'INFRA-APH-2026',
      sourceUrl: 'https://www.aicte-india.org/approval/land-norms',
      status: 'INDEXED',
      chunksCount: 82,
      uploadedAt: '2026-01-15T09:15:00Z',
      samplePassage: 'Schedule II: In Mega/Metro Cities, minimum contiguous land area for Engineering & Technology institution is 2.5 Acres, with Floor Space Index (FSI) adherence as per local urban municipal authority. For Non-Metro Urban areas, 4.0 Acres, and Rural areas 7.5 Acres minimum contiguous land is required under clear, encumbrance-free registered title or 30-year registered government lease.'
    },
    {
      id: 'reg-004',
      title: 'AICTE Anti-Ragging & Campus Safety Directives (Supreme Court Mandate)',
      issuingAuthority: 'AICTE Student Welfare & Regulatory Monitoring Cell',
      publicationDate: '2025-08-30',
      effectiveDate: '2025-09-01',
      version: 'SAFETY-DIR-2025-09',
      sourceUrl: 'https://www.aicte-india.org/anti-ragging',
      status: 'INDEXED',
      chunksCount: 42,
      uploadedAt: '2026-01-20T10:00:00Z',
      samplePassage: 'Clause 6.1: Every approved institution shall constitute an Anti-Ragging Committee headed by the Head of the Institution with representatives of civil and police administration, local media, NGOs, faculty, and student representatives. 24x7 CCTV coverage in hostel entrances, dining halls, and common academic corridors is mandatory.'
    }
  ]
};

// Initialize PostgreSQL if DATABASE_URL is configured
export async function initDatabase(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('localhost:5432') && process.env.NODE_ENV !== 'production') {
    databaseMode = 'DevPersistence';
    databaseMessage = 'Development Mode: Stateful in-memory/JSON store with full AICTE seed data is active. Set DATABASE_URL to connect external PostgreSQL.';
    isPostgresConnected = false;
    return;
  }

  try {
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
    });
    
    // Test connection
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    
    isPostgresConnected = true;
    databaseMode = 'PostgreSQL';
    databaseMessage = 'Connected to production PostgreSQL database successfully.';
    console.log('[DB] PostgreSQL connected successfully.');
  } catch (err: any) {
    console.warn('[DB] PostgreSQL connection failed, falling back to Development Store:', err.message);
    isPostgresConnected = false;
    databaseMode = 'DevPersistence';
    databaseMessage = `PostgreSQL connection attempt failed: ${err.message}. Running in safe DevPersistence mode.`;
  }
}

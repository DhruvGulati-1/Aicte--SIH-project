export type UserRole = 'ADMIN' | 'COMPETENT_AUTHORITY' | 'OFFICER' | 'INSTITUTION' | 'EVC';

export type WorkflowPath = 'ONLY_SCRUTINY' | 'SCRUTINY_EVC' | 'EVC_SAC_SHC' | 'ONLY_EVC';

export type ApplicationStage = 
  | 'SUBMITTED'
  | 'UNDER_SCRUTINY'
  | 'SCRUTINY_REVERTED'
  | 'SCRUTINY_COMPLETED'
  | 'EVC_SCHEDULED'
  | 'EVC_IN_PROGRESS'
  | 'EVC_COMPLETED'
  | 'SAC_REVIEW'
  | 'SHC_REVIEW'
  | 'FINAL_DECISION_PENDING'
  | 'APPROVED'
  | 'REJECTED';

export type ApplicationType = 
  | 'NEW_INSTITUTION'
  | 'EXTENSION_OF_APPROVAL'
  | 'INCREASE_IN_INTAKE'
  | 'NEW_COURSE'
  | 'CLOSURE_OF_COURSE'
  | 'CHANGE_OF_SITE';

export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'CORRECTION_REQUIRED';

export type ComplianceStatus = 'COMPLIANT' | 'PENDING' | 'OVERDUE' | 'EXPIRED' | 'UNDER_REVIEW';

export type EvcStatus = 'PLANNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'REPORT_SUBMITTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  designation?: string;
  department?: string;
  createdAt: string;
}

export interface Institution {
  id: string;
  officialId: string;
  name: string;
  state: string;
  district: string;
  address: string;
  institutionType: string; // Engineering, Management, Pharmacy, Architecture, etc.
  sourceName: string; // e.g. "AICTE Official Directory 2026"
  sourceUrl?: string;
  sourceSnapshotDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  headOfInstitution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  expiryDate?: string;
  status: DocumentStatus;
  verifierNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  extractedText?: string;
  ocrConfidence?: number;
}

export interface Application {
  id: string;
  institutionId: string;
  institutionName: string;
  applicationType: ApplicationType;
  academicYear: string;
  workflowPath: WorkflowPath;
  currentStage: ApplicationStage;
  status: 'IN_PROGRESS' | 'AWAITING_INSTITUTION' | 'APPROVED' | 'REJECTED';
  priority: PriorityLevel;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  submissionDate: string;
  targetSlaDate?: string;
  lastUpdated: string;
  details: {
    programsProposed: string[];
    totalIntakeRequested: number;
    landAreaAcres?: number;
    builtUpAreaSqM?: number;
    facultyCount?: number;
    trustOrSocietyName?: string;
    remarks?: string;
  };
  scrutinyScore?: number;
  riskScore?: number;
  riskFactors?: string[];
}

export interface ApplicationHistory {
  id: string;
  applicationId: string;
  fromStage: string;
  toStage: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  reason?: string;
  comments?: string;
  timestamp: string;
}

export interface ComplianceItem {
  id: string;
  institutionId: string;
  institutionName: string;
  requirementCode: string;
  title: string;
  category: 'FACULTY_RATIO' | 'INFRASTRUCTURE' | 'FIRE_SAFETY' | 'LAND_TITLE' | 'AFFILIATION' | 'ANTI_RAGGING';
  requiredEvidence: string;
  submissionDate?: string;
  dueDate: string;
  expiryDate?: string;
  status: ComplianceStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewerComments?: string;
  evidenceDocumentName?: string;
}

export interface EvcVisit {
  id: string;
  applicationId: string;
  institutionId: string;
  institutionName: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: EvcStatus;
  leadEvaluator: string;
  evaluatorTeam: string[];
  meetingMode: 'PHYSICAL_ONSITE' | 'VIRTUAL_HYBRID';
  locationOrMeetingLink?: string;
  checklistItems: {
    item: string;
    verified: boolean;
    remarks?: string;
  }[];
  evaluationNotes?: string;
  findingsSummary?: string;
  reportSubmittedAt?: string;
  completedAt?: string;
  cancellationReason?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  role?: UserRole;
  title: string;
  message: string;
  category: 'DEADLINE' | 'SCRUTINY' | 'EVC' | 'WORKFLOW' | 'COMPLIANCE' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  applicationId?: string;
  institutionId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: 'APPLICATION' | 'DOCUMENT' | 'INSTITUTION' | 'COMPLIANCE' | 'EVC' | 'AI_AGENT' | 'SYSTEM';
  targetId: string;
  summary: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface RegulatorySource {
  id: string;
  title: string;
  issuingAuthority: string;
  publicationDate: string;
  effectiveDate: string;
  version: string;
  sourceUrl?: string;
  status: 'INDEXED' | 'PENDING' | 'SUPERSEDED';
  chunksCount: number;
  uploadedAt: string;
  samplePassage?: string;
}

export interface AgentScrutinyResult {
  agent: 'application_scrutiny';
  applicationId: string;
  scrutinyScore: number;
  findings: {
    type: 'missing_field' | 'inconsistent_data' | 'expired_document' | 'deficiency_noted' | 'verified_match';
    field: string;
    evidence: string;
    confidence: number;
    recommendation: string;
    documentRef?: string;
  }[];
  requires_human_review: boolean;
  modelUsed: string;
  generatedAt: string;
}

export interface AgentComplianceResult {
  agent: 'compliance_monitoring';
  institutionId: string;
  overallComplianceRate: number;
  urgentItemsCount: number;
  findings: {
    requirementCode: string;
    title: string;
    status: 'EXPIRED' | 'DUE_SOON' | 'OVERDUE' | 'SATISFIED';
    daysRemaining: number;
    actionRequired: string;
  }[];
  suggestedNotifications: string[];
  modelUsed: string;
  generatedAt: string;
}

export interface AgentWorkflowResult {
  agent: 'workflow_coordination';
  applicationId: string;
  currentStage: string;
  workflowPath: string;
  isStalled: boolean;
  stalledDurationDays: number;
  nextPermittedActions: string[];
  recommendedAssigneeRole: UserRole;
  suggestedAction: string;
  rationale: string;
  modelUsed: string;
  generatedAt: string;
}

export interface AgentRiskResult {
  agent: 'risk_and_prioritization';
  applicationId: string;
  deterministicScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    factor: string;
    points: number;
    description: string;
  }[];
  qualitativeAnalysis: string;
  modelUsed: string;
  generatedAt: string;
}

export interface AgentRagResult {
  agent: 'regulatory_rag';
  query: string;
  answer: string;
  sources: {
    sourceTitle: string;
    section: string;
    passage: string;
    relevanceScore: number;
  }[];
  isInformationMissing: boolean;
  recommendation: string;
  modelUsed: string;
  generatedAt: string;
}

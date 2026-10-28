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
  AgentScrutinyResult,
  AgentComplianceResult,
  AgentWorkflowResult,
  AgentRiskResult,
  AgentRagResult,
  AicteCourse,
  AicteGuidelineChapter
} from '../types/index.js';

// Base API URL default to /api/v1 (or root fallback)
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('regulaflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error || errorJson.message) {
        errorMsg = errorJson.error || errorJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; database: any; ai: any }>('/health'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getMe: () => fetchJson<{ user: User }>('/auth/me'),

  // Institutions
  getInstitutions: (params?: { state?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<{ total: number; institutions: Institution[] }>(`/institutions${q ? `?${q}` : ''}`);
  },

  importInstitutions: (rows: any[]) =>
    fetchJson<{ success: boolean; importedCount: number; errorCount: number; errors: string[] }>(
      '/institutions/import',
      {
        method: 'POST',
        body: JSON.stringify({ rows })
      }
    ),

  // Applications
  getApplications: (params?: { stage?: string; status?: string; priority?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<{ total: number; applications: Application[] }>(`/applications${q ? `?${q}` : ''}`);
  },

  getApplication: (id: string) =>
    fetchJson<{
      application: Application;
      institution: Institution;
      documents: DocumentRecord[];
      history: ApplicationHistory[];
      evc?: EvcVisit;
    }>(`/applications/${id}`),

  createApplication: (payload: Partial<Application>) =>
    fetchJson<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  revertApplication: (id: string, reason: string, comments?: string) =>
    fetchJson<{ success: boolean; application: Application; history: ApplicationHistory }>(
      `/applications/${id}/revert`,
      {
        method: 'POST',
        body: JSON.stringify({ reason, comments })
      }
    ),

  resubmitApplication: (id: string, remarks: string) =>
    fetchJson<{ success: boolean; application: Application; history: ApplicationHistory }>(
      `/applications/${id}/resubmit`,
      {
        method: 'POST',
        body: JSON.stringify({ remarks })
      }
    ),

  completeStage: (id: string, nextStage: string, decision?: string, comments?: string) =>
    fetchJson<{ success: boolean; application: Application; history: ApplicationHistory }>(
      `/applications/${id}/complete-stage`,
      {
        method: 'POST',
        body: JSON.stringify({ nextStage, decision, comments })
      }
    ),

  getApplicationHistory: (id: string) =>
    fetchJson<{ applicationId: string; history: ApplicationHistory[] }>(`/applications/${id}/history`),

  // Compliance
  getCompliance: (params?: { status?: string; institutionId?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<{ total: number; items: ComplianceItem[] }>(`/compliance${q ? `?${q}` : ''}`);
  },

  createCompliance: (payload: Partial<ComplianceItem>) =>
    fetchJson<ComplianceItem>('/compliance', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyCompliance: (id: string, status: string, reviewerComments?: string) =>
    fetchJson<{ success: boolean; item: ComplianceItem }>(`/compliance/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status, reviewerComments })
    }),

  getExpiringDocuments: (days = 30) =>
    fetchJson<{ windowDays: number; totalExpiring: number; documents: DocumentRecord[] }>(
      `/documents/expiring?days=${days}`
    ),

  // EVC
  getEvcVisits: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return fetchJson<{ total: number; visits: EvcVisit[] }>(`/evc${q}`);
  },

  createEvcVisit: (payload: Partial<EvcVisit>) =>
    fetchJson<EvcVisit>('/evc', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  scheduleEvcVisit: (id: string, scheduledDate: string, scheduledTime?: string, locationOrMeetingLink?: string) =>
    fetchJson<{ success: boolean; visit: EvcVisit }>(`/evc/${id}/schedule`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduledDate, scheduledTime, locationOrMeetingLink })
    }),

  completeEvcVisit: (id: string, findingsSummary: string, checklistItems?: any[], evaluationNotes?: string) =>
    fetchJson<{ success: boolean; visit: EvcVisit }>(`/evc/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ findingsSummary, checklistItems, evaluationNotes })
    }),

  // Notifications
  getNotifications: () =>
    fetchJson<{ unreadCount: number; notifications: NotificationItem[] }>('/notifications'),

  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),

  // Dashboard
  getDashboardSummary: () =>
    fetchJson<{
      kpis: any;
      charts: any;
      recentActivity: ApplicationHistory[];
      upcomingVisits: EvcVisit[];
    }>('/dashboard/summary'),

  getDashboardAgeing: () =>
    fetchJson<{ ageing: any[] }>('/dashboard/ageing'),

  // Audit Logs
  getAuditLogs: (params?: { targetType?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<{ total: number; logs: AuditLogItem[] }>(`/audit-logs${q ? `?${q}` : ''}`);
  },

  // AI Agents
  runScrutinyAgent: (applicationId: string) =>
    fetchJson<AgentScrutinyResult>('/agents/scrutiny', {
      method: 'POST',
      body: JSON.stringify({ applicationId })
    }),

  runComplianceAgent: (institutionId: string) =>
    fetchJson<AgentComplianceResult>('/agents/compliance', {
      method: 'POST',
      body: JSON.stringify({ institutionId })
    }),

  runWorkflowAgent: (applicationId: string) =>
    fetchJson<AgentWorkflowResult>('/agents/workflow', {
      method: 'POST',
      body: JSON.stringify({ applicationId })
    }),

  runRiskAgent: (applicationId: string) =>
    fetchJson<AgentRiskResult>('/agents/risk', {
      method: 'POST',
      body: JSON.stringify({ applicationId })
    }),

  runRagAgent: (query: string) =>
    fetchJson<AgentRagResult>('/agents/rag', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),

  // Knowledge
  getKnowledgeSources: () =>
    fetchJson<{ total: number; sources: RegulatorySource[] }>('/knowledge'),

  addKnowledgeSource: (payload: Partial<RegulatorySource>) =>
    fetchJson<RegulatorySource>('/knowledge', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Settings
  getSettings: () => fetchJson<any>('/settings'),

  // AICTE Norms & Courses
  getCourses: (params?: { program?: string; level?: string; emerging?: boolean; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchJson<{ total: number; courses: AicteCourse[] }>(`/courses${q ? `?${q}` : ''}`);
  },

  getGuidelines: () =>
    fetchJson<{
      handbook: string;
      edition: string;
      chapters: AicteGuidelineChapter[];
      calculationNorms: any;
    }>('/guidelines'),

  // SIH Hackathon & AICTE Official Directorate API
  getSihSubmissionInfo: () =>
    fetchJson<{
      hackathon: string;
      problemStatementId: string;
      problemTitle: string;
      project: string;
      status: string;
      backendPort: number;
      dualInterfaces: Array<{ id: string; name: string; description: string; demoLogin: any }>;
      features: string[];
      verificationPassed: string;
    }>('/sih/submission-info'),

  getOfficialOverview: () =>
    fetchJson<{
      officerDesk: {
        totalApplicationsInQueue: number;
        pendingScrutinyCount: number;
        pendingEvcCount: number;
        pendingCaCount: number;
        deficiencyFlaggedCount: number;
        approvedCount: number;
      };
      urgentQueue: Array<{
        id: string;
        institutionName: string;
        officialId: string;
        state: string;
        type: string;
        stage: string;
        priority: string;
        submissionDate: string;
        deficiencyCount: number;
      }>;
    }>('/official/overview')
};

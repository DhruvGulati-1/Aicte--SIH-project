import { Router, Request, Response } from 'express';
import { store, isPostgresConnected, databaseMode, databaseMessage } from '../db/store.js';
import {
  runScrutinyAgent,
  runComplianceAgent,
  runWorkflowAgent,
  runRiskAgent,
  runRagAgent,
  isGeminiAvailable
} from '../services/aiAgents.js';
import { Application, ApplicationHistory, AuditLogItem, DocumentRecord, EvcVisit, ComplianceItem, UserRole } from '../../src/types/index.js';

export const apiRouter = Router();

// Helper to log audit event
function recordAuditLog(
  actorId: string,
  actorName: string,
  actorRole: string,
  action: string,
  targetType: AuditLogItem['targetType'],
  targetId: string,
  summary: string,
  metadata?: Record<string, any>
) {
  const newLog: AuditLogItem = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorName,
    actorRole,
    action,
    targetType,
    targetId,
    summary,
    metadata,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(newLog);
}

// Helper to extract actor from auth headers
function getActor(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = store.users.find(u => u.id === token || u.email === token);
    if (user) {
      return { id: user.id, name: user.name, role: user.role, institutionId: user.institutionId };
    }
  }
  // Default fallback for dev requests if no token
  return { id: 'usr-admin-1', name: 'Dr. Rajiv Malhotra', role: 'ADMIN' as UserRole, institutionId: undefined };
}

// 1. Health
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RegulaFlow AI Core Engine',
    version: '1.0.0',
    database: {
      mode: databaseMode,
      postgresConnected: isPostgresConnected,
      message: databaseMessage
    },
    ai: {
      geminiAvailable: isGeminiAvailable(),
      model: 'gemini-3.8-flash'
    }
  });
});

// 2. Auth Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  // Create JWT-like session token
  const token = user.id;
  const { passwordHash, ...safeUser } = user;

  recordAuditLog(user.id, user.name, user.role, 'USER_LOGIN', 'SYSTEM', user.id, `User ${user.name} logged into portal.`);

  res.json({
    success: true,
    token,
    user: safeUser
  });
});

// 3. Auth Me
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const actor = getActor(req);
  const user = store.users.find(u => u.id === actor.id);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// 4. Institutions List
apiRouter.get('/institutions', (req: Request, res: Response) => {
  const { state, type, search } = req.query;
  let list = [...store.institutions];

  if (state && typeof state === 'string') {
    list = list.filter(i => i.state.toLowerCase() === state.toLowerCase());
  }
  if (type && typeof type === 'string') {
    list = list.filter(i => i.institutionType.toLowerCase().includes(type.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.officialId.toLowerCase().includes(q) || i.district.toLowerCase().includes(q));
  }

  res.json({
    total: list.length,
    institutions: list
  });
});

// 5. Institutions Import (CSV)
apiRouter.post('/institutions/import', (req: Request, res: Response) => {
  const actor = getActor(req);
  if (actor.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can import institution records.' });
  }

  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Valid rows array required.' });
  }

  const imported: any[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.officialId || !row.name || !row.state || !row.district) {
      errors.push(`Row missing mandatory fields: ${JSON.stringify(row)}`);
      continue;
    }

    const exists = store.institutions.find(i => i.officialId === row.officialId);
    if (exists) {
      errors.push(`Official ID ${row.officialId} already exists in database.`);
      continue;
    }

    const newInst = {
      id: `inst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      officialId: row.officialId,
      name: row.name,
      state: row.state,
      district: row.district,
      address: row.address || `${row.district}, ${row.state}`,
      institutionType: row.institutionType || 'Engineering & Technology',
      sourceName: row.sourceName || 'CSV Verified Public Import',
      sourceUrl: row.sourceUrl || '',
      sourceSnapshotDate: new Date().toISOString().split('T')[0],
      contactEmail: row.contactEmail || '',
      contactPhone: row.contactPhone || '',
      headOfInstitution: row.headOfInstitution || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.institutions.push(newInst);
    imported.push(newInst);
  }

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'INSTITUTIONS_CSV_IMPORTED',
    'INSTITUTION',
    'BATCH',
    `Imported ${imported.length} institution records with ${errors.length} skipped errors.`
  );

  res.json({
    success: true,
    importedCount: imported.length,
    errorCount: errors.length,
    errors,
    sampleImported: imported.slice(0, 3)
  });
});

// 6. Applications Listing
apiRouter.get('/applications', (req: Request, res: Response) => {
  const actor = getActor(req);
  let list = [...store.applications];

  // Institution users can only view their own applications
  if (actor.role === 'INSTITUTION' && actor.institutionId) {
    list = list.filter(a => a.institutionId === actor.institutionId);
  }

  const { stage, status, priority, search } = req.query;
  if (stage && typeof stage === 'string') {
    list = list.filter(a => a.currentStage === stage);
  }
  if (status && typeof status === 'string') {
    list = list.filter(a => a.status === status);
  }
  if (priority && typeof priority === 'string') {
    list = list.filter(a => a.priority === priority);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(a => a.id.toLowerCase().includes(q) || a.institutionName.toLowerCase().includes(q));
  }

  res.json({
    total: list.length,
    applications: list
  });
});

// 7. Applications Create
apiRouter.post('/applications', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { institutionId, applicationType, academicYear, workflowPath, priority, details } = req.body;

  if (!institutionId || !applicationType) {
    return res.status(400).json({ error: 'institutionId and applicationType are required.' });
  }

  const inst = store.institutions.find(i => i.id === institutionId);
  if (!inst) {
    return res.status(404).json({ error: 'Institution not found.' });
  }

  const newApp: Application = {
    id: `app-2026-${String(store.applications.length + 1).padStart(3, '0')}`,
    institutionId: inst.id,
    institutionName: inst.name,
    applicationType: applicationType,
    academicYear: academicYear || '2026-2027',
    workflowPath: workflowPath || 'SCRUTINY_EVC',
    currentStage: 'SUBMITTED',
    status: 'IN_PROGRESS',
    priority: priority || 'NORMAL',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Dr. Ananya Sharma',
    submissionDate: new Date().toISOString(),
    targetSlaDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    details: details || {
      programsProposed: ['B.Tech Computer Science'],
      totalIntakeRequested: 60
    },
    scrutinyScore: 85,
    riskScore: 20,
    riskFactors: []
  };

  store.applications.unshift(newApp);

  // Add initial history
  store.applicationHistory.push({
    id: `hist-${Date.now()}`,
    applicationId: newApp.id,
    fromStage: 'DRAFT',
    toStage: 'SUBMITTED',
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'APPLICATION_SUBMITTED',
    reason: 'Application submitted for regulatory approval.',
    comments: `Intake requested: ${newApp.details.totalIntakeRequested}.`,
    timestamp: new Date().toISOString()
  });

  // Create standard document slots
  const standardDocs = [
    { type: 'LAND_TITLE_DEED', name: `${inst.officialId}_Land_Title_Deed.pdf` },
    { type: 'FIRE_SAFETY_NOC', name: `${inst.officialId}_Fire_Safety_NOC.pdf` },
    { type: 'FACULTY_CADRE_LIST', name: `${inst.officialId}_Faculty_Cadre_Roster.pdf` }
  ];

  standardDocs.forEach((d, idx) => {
    store.documents.push({
      id: `doc-${Date.now()}-${idx}`,
      applicationId: newApp.id,
      documentType: d.type,
      fileName: d.name,
      fileSize: 2048500,
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
      extractedText: `Standard AICTE Statutory Document for ${inst.name}.`
    });
  });

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'APPLICATION_CREATED',
    'APPLICATION',
    newApp.id,
    `New application ${newApp.id} submitted for ${inst.name}.`
  );

  res.status(201).json(newApp);
});

// 8. Application Detail
apiRouter.get('/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const app = store.applications.find(a => a.id === id);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const documents = store.documents.filter(d => d.applicationId === id);
  const history = store.applicationHistory.filter(h => h.applicationId === id);
  const evc = store.evcVisits.find(e => e.applicationId === id);
  const institution = store.institutions.find(i => i.id === app.institutionId);

  res.json({
    application: app,
    institution,
    documents,
    history,
    evc
  });
});

// 9. Revert Application (Scrutiny Deficiencies)
apiRouter.post('/applications/:id/revert', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { reason, comments } = req.body;

  const app = store.applications.find(a => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const prevStage = app.currentStage;
  app.currentStage = 'SCRUTINY_REVERTED';
  app.status = 'AWAITING_INSTITUTION';
  app.lastUpdated = new Date().toISOString();

  const historyEntry: ApplicationHistory = {
    id: `hist-${Date.now()}`,
    applicationId: app.id,
    fromStage: prevStage,
    toStage: 'SCRUTINY_REVERTED',
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'REVERT_DEFICIENCY',
    reason: reason || 'Deficiencies detected during scrutiny review.',
    comments: comments || 'Rectified documentation required within statutory period.',
    timestamp: new Date().toISOString()
  };
  store.applicationHistory.push(historyEntry);

  // Send Notification
  store.notifications.push({
    id: `notif-${Date.now()}`,
    institutionId: app.institutionId,
    role: 'INSTITUTION',
    title: `Action Required: Application ${app.id} Reverted`,
    message: `Deficiencies noted by scrutiny officer: ${reason || 'Document clarification needed'}.`,
    category: 'SCRUTINY',
    severity: 'WARNING',
    applicationId: app.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  recordAuditLog(actor.id, actor.name, actor.role, 'APPLICATION_REVERTED', 'APPLICATION', app.id, `Application reverted to institution. Reason: ${reason}`);

  res.json({ success: true, application: app, history: historyEntry });
});

// 10. Resubmit Application (Institution)
apiRouter.post('/applications/:id/resubmit', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { remarks } = req.body;

  const app = store.applications.find(a => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const prevStage = app.currentStage;
  app.currentStage = 'UNDER_SCRUTINY';
  app.status = 'IN_PROGRESS';
  app.lastUpdated = new Date().toISOString();

  const historyEntry: ApplicationHistory = {
    id: `hist-${Date.now()}`,
    applicationId: app.id,
    fromStage: prevStage,
    toStage: 'UNDER_SCRUTINY',
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'INSTITUTION_RESUBMISSION',
    reason: 'Institution uploaded corrected compliance evidence.',
    comments: remarks || 'Clarifications and renewed documentation provided.',
    timestamp: new Date().toISOString()
  };
  store.applicationHistory.push(historyEntry);

  recordAuditLog(actor.id, actor.name, actor.role, 'APPLICATION_RESUBMITTED', 'APPLICATION', app.id, `Institution resubmitted application with remarks: ${remarks}`);

  res.json({ success: true, application: app, history: historyEntry });
});

// 11. Complete Stage (Transition)
apiRouter.post('/applications/:id/complete-stage', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { nextStage, decision, comments } = req.body;

  const app = store.applications.find(a => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const prevStage = app.currentStage;
  app.currentStage = nextStage;
  app.lastUpdated = new Date().toISOString();

  if (nextStage === 'APPROVED') {
    app.status = 'APPROVED';
  } else if (nextStage === 'REJECTED') {
    app.status = 'REJECTED';
  }

  const historyEntry: ApplicationHistory = {
    id: `hist-${Date.now()}`,
    applicationId: app.id,
    fromStage: prevStage,
    toStage: nextStage,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: decision || 'ADVANCE_STAGE',
    reason: `Moved from ${prevStage} to ${nextStage}.`,
    comments: comments || 'Stage criteria satisfied.',
    timestamp: new Date().toISOString()
  };
  store.applicationHistory.push(historyEntry);

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'STAGE_TRANSITION_COMPLETED',
    'APPLICATION',
    app.id,
    `Stage advanced from ${prevStage} to ${nextStage}. Comments: ${comments || 'None'}`
  );

  res.json({ success: true, application: app, history: historyEntry });
});

// 12. Application History
apiRouter.get('/applications/:id/history', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = store.applicationHistory.filter(h => h.applicationId === id);
  res.json({ applicationId: id, history });
});

// 13. Compliance List
apiRouter.get('/compliance', (req: Request, res: Response) => {
  const { status, institutionId } = req.query;
  let items = [...store.complianceItems];

  if (status && typeof status === 'string') {
    items = items.filter(c => c.status === status);
  }
  if (institutionId && typeof institutionId === 'string') {
    items = items.filter(c => c.institutionId === institutionId);
  }

  res.json({ total: items.length, items });
});

// 14. Compliance Create
apiRouter.post('/compliance', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { institutionId, requirementCode, title, category, requiredEvidence, dueDate, expiryDate } = req.body;

  const inst = store.institutions.find(i => i.id === institutionId);
  const newItem: ComplianceItem = {
    id: `comp-${Date.now()}`,
    institutionId,
    institutionName: inst ? inst.name : 'Unknown Institution',
    requirementCode,
    title,
    category: category || 'INFRASTRUCTURE',
    requiredEvidence,
    dueDate,
    expiryDate,
    status: 'PENDING'
  };

  store.complianceItems.push(newItem);
  recordAuditLog(actor.id, actor.name, actor.role, 'COMPLIANCE_CREATED', 'COMPLIANCE', newItem.id, `Created compliance item ${title}`);

  res.status(201).json(newItem);
});

// 15. Compliance Verify
apiRouter.post('/compliance/:id/verify', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { status, reviewerComments } = req.body;

  const item = store.complianceItems.find(c => c.id === id);
  if (!item) return res.status(404).json({ error: 'Compliance item not found.' });

  item.status = status || 'COMPLIANT';
  item.reviewerComments = reviewerComments;
  item.verifiedBy = actor.name;
  item.verifiedAt = new Date().toISOString();

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'COMPLIANCE_VERIFIED',
    'COMPLIANCE',
    item.id,
    `Compliance requirement ${item.requirementCode} marked as ${item.status}`
  );

  res.json({ success: true, item });
});

// 16. Expiring Documents
apiRouter.get('/documents/expiring', (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const now = new Date('2026-10-26T23:38:00Z');
  const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const expiring = store.documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const exp = new Date(doc.expiryDate);
    return exp <= targetDate;
  });

  res.json({
    windowDays: days,
    totalExpiring: expiring.length,
    documents: expiring
  });
});

// 17. EVC List & Create
apiRouter.get('/evc', (req: Request, res: Response) => {
  const { status } = req.query;
  let visits = [...store.evcVisits];
  if (status && typeof status === 'string') {
    visits = visits.filter(v => v.status === status);
  }
  res.json({ total: visits.length, visits });
});

apiRouter.post('/evc', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { applicationId, scheduledDate, scheduledTime, leadEvaluator, evaluatorTeam, meetingMode, locationOrMeetingLink } = req.body;

  const app = store.applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const newVisit: EvcVisit = {
    id: `evc-2026-${String(store.evcVisits.length + 1).padStart(2, '0')}`,
    applicationId,
    institutionId: app.institutionId,
    institutionName: app.institutionName,
    scheduledDate,
    scheduledTime: scheduledTime || '10:00 AM IST',
    status: 'SCHEDULED',
    leadEvaluator: leadEvaluator || 'Dr. K. N. Rao',
    evaluatorTeam: evaluatorTeam || ['Dr. Meera Nambiar', 'Dr. Rajesh Deshmukh'],
    meetingMode: meetingMode || 'PHYSICAL_ONSITE',
    locationOrMeetingLink,
    checklistItems: [
      { item: 'Physical Land title & Contiguity verification', verified: false },
      { item: 'Instructional & Administrative Area Inspection', verified: false },
      { item: 'Laboratory Equipment & Safety Norms', verified: false },
      { item: 'Faculty Roster Biometric Verification', verified: false },
      { item: 'Library Books & International e-Journals', verified: false }
    ],
    evaluationNotes: 'Panel constituted.'
  };

  store.evcVisits.push(newVisit);
  app.currentStage = 'EVC_SCHEDULED';
  app.lastUpdated = new Date().toISOString();

  recordAuditLog(actor.id, actor.name, actor.role, 'EVC_SCHEDULED', 'EVC', newVisit.id, `Expert visit scheduled for ${app.institutionName} on ${scheduledDate}`);

  res.status(201).json(newVisit);
});

// 18. EVC Schedule update
apiRouter.patch('/evc/:id/schedule', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { scheduledDate, scheduledTime, locationOrMeetingLink } = req.body;

  const visit = store.evcVisits.find(v => v.id === id);
  if (!visit) return res.status(404).json({ error: 'EVC Visit not found.' });

  if (scheduledDate) visit.scheduledDate = scheduledDate;
  if (scheduledTime) visit.scheduledTime = scheduledTime;
  if (locationOrMeetingLink) visit.locationOrMeetingLink = locationOrMeetingLink;

  recordAuditLog(actor.id, actor.name, actor.role, 'EVC_RESCHEDULED', 'EVC', visit.id, `Visit rescheduled to ${scheduledDate} ${scheduledTime}`);

  res.json({ success: true, visit });
});

// 19. EVC Complete
apiRouter.post('/evc/:id/complete', (req: Request, res: Response) => {
  const actor = getActor(req);
  const { id } = req.params;
  const { findingsSummary, checklistItems, evaluationNotes } = req.body;

  const visit = store.evcVisits.find(v => v.id === id);
  if (!visit) return res.status(404).json({ error: 'EVC Visit not found.' });

  visit.status = 'COMPLETED';
  if (findingsSummary) visit.findingsSummary = findingsSummary;
  if (checklistItems) visit.checklistItems = checklistItems;
  if (evaluationNotes) visit.evaluationNotes = evaluationNotes;
  visit.reportSubmittedAt = new Date().toISOString();
  visit.completedAt = new Date().toISOString();

  // Update associated application
  const app = store.applications.find(a => a.id === visit.applicationId);
  if (app) {
    app.currentStage = 'EVC_COMPLETED';
    app.lastUpdated = new Date().toISOString();
    store.applicationHistory.push({
      id: `hist-${Date.now()}`,
      applicationId: app.id,
      fromStage: 'EVC_IN_PROGRESS',
      toStage: 'EVC_COMPLETED',
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'EVC_REPORT_SUBMITTED',
      reason: 'Expert evaluation report uploaded with recommendations.',
      comments: findingsSummary || 'Satisfies Chapter I criteria.',
      timestamp: new Date().toISOString()
    });
  }

  recordAuditLog(actor.id, actor.name, actor.role, 'EVC_COMPLETED', 'EVC', visit.id, `Expert visit report submitted by ${actor.name}`);

  res.json({ success: true, visit });
});

// 20. Notifications
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const actor = getActor(req);
  let notifs = [...store.notifications];
  if (actor.role === 'INSTITUTION' && actor.institutionId) {
    notifs = notifs.filter(n => n.institutionId === actor.institutionId || n.userId === actor.id);
  }
  res.json({
    unreadCount: notifs.filter(n => !n.read).length,
    notifications: notifs
  });
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = store.notifications.find(n => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

apiRouter.patch('/notifications/read-all', (req: Request, res: Response) => {
  store.notifications.forEach(n => { n.read = true; });
  res.json({ success: true });
});

// 21. Dashboard Summary
apiRouter.get('/dashboard/summary', (req: Request, res: Response) => {
  const apps = store.applications;
  const insts = store.institutions;
  const compliance = store.complianceItems;
  const evc = store.evcVisits;

  const totalInstitutions = insts.length;
  const applicationsReceived = apps.length;
  const underScrutiny = apps.filter(a => a.currentStage === 'UNDER_SCRUTINY').length;
  const awaitingInstitution = apps.filter(a => a.status === 'AWAITING_INSTITUTION').length;
  const pendingEvc = apps.filter(a => a.currentStage === 'EVC_SCHEDULED' || a.currentStage === 'EVC_IN_PROGRESS').length;
  const overdueApps = apps.filter(a => a.priority === 'URGENT' || a.currentStage === 'SCRUTINY_REVERTED').length;
  const complianceDueSoon = compliance.filter(c => c.status === 'EXPIRED' || c.status === 'OVERDUE' || c.status === 'UNDER_REVIEW').length;
  const applicationsCompleted = apps.filter(a => a.currentStage === 'APPROVED' || a.currentStage === 'REJECTED').length;

  // Status breakdown
  const statusDistribution = [
    { status: 'In Progress', count: apps.filter(a => a.status === 'IN_PROGRESS').length },
    { status: 'Awaiting Action', count: awaitingInstitution },
    { status: 'Approved', count: apps.filter(a => a.status === 'APPROVED').length },
    { status: 'Rejected', count: apps.filter(a => a.status === 'REJECTED').length }
  ];

  // Stage breakdown
  const stageDistribution = [
    { stage: 'Submitted', count: apps.filter(a => a.currentStage === 'SUBMITTED').length },
    { stage: 'Under Scrutiny', count: underScrutiny },
    { stage: 'Scrutiny Reverted', count: apps.filter(a => a.currentStage === 'SCRUTINY_REVERTED').length },
    { stage: 'EVC Stage', count: apps.filter(a => a.currentStage.startsWith('EVC')).length },
    { stage: 'Final Review', count: apps.filter(a => a.currentStage === 'FINAL_DECISION_PENDING').length }
  ];

  // State distribution
  const stateCounts: Record<string, number> = {};
  insts.forEach(i => {
    stateCounts[i.state] = (stateCounts[i.state] || 0) + 1;
  });
  const stateDistribution = Object.entries(stateCounts).map(([state, count]) => ({ state, count }));

  res.json({
    kpis: {
      totalInstitutions,
      applicationsReceived,
      underScrutiny,
      awaitingInstitution,
      pendingEvc,
      overdueApps,
      complianceDueSoon,
      applicationsCompleted
    },
    charts: {
      statusDistribution,
      stageDistribution,
      stateDistribution,
      averageProcessingDays: 19.4,
      complianceRate: 86
    },
    recentActivity: store.applicationHistory.slice(-5).reverse(),
    upcomingVisits: evc.filter(v => v.status === 'SCHEDULED')
  });
});

// 22. Dashboard Ageing
apiRouter.get('/dashboard/ageing', (req: Request, res: Response) => {
  const now = new Date('2026-10-26T23:38:00Z');
  const ageing = store.applications.map(app => {
    const sub = new Date(app.submissionDate);
    const ageDays = Math.ceil((now.getTime() - sub.getTime()) / (1000 * 60 * 60 * 24));
    return {
      applicationId: app.id,
      institutionName: app.institutionName,
      stage: app.currentStage,
      priority: app.priority,
      ageDays,
      slaTargetDays: 30,
      slaStatus: ageDays > 30 ? 'BREACHED' : ageDays > 20 ? 'WARNING' : 'ON_TRACK'
    };
  });

  res.json({ ageing });
});

// 23. Audit Logs
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const { targetType, search } = req.query;
  let logs = [...store.auditLogs];

  if (targetType && typeof targetType === 'string') {
    logs = logs.filter(l => l.targetType === targetType);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter(l => l.actorName.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q) || l.action.toLowerCase().includes(q));
  }

  res.json({ total: logs.length, logs });
});

// 24. AI Agent 1: Application Scrutiny Agent
apiRouter.post('/agents/scrutiny', async (req: Request, res: Response) => {
  const actor = getActor(req);
  const { applicationId } = req.body;
  const app = store.applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const docs = store.documents.filter(d => d.applicationId === applicationId);
  const result = await runScrutinyAgent(app, docs);

  // Update application scrutiny score
  app.scrutinyScore = result.scrutinyScore;

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'AI_SCRUTINY_EXECUTED',
    'AI_AGENT',
    applicationId,
    `AI Scrutiny Agent scored application at ${result.scrutinyScore}/100 with ${result.findings.length} findings.`
  );

  res.json(result);
});

// 25. AI Agent 2: Compliance Monitoring Agent
apiRouter.post('/agents/compliance', async (req: Request, res: Response) => {
  const actor = getActor(req);
  const { institutionId } = req.body;
  const inst = store.institutions.find(i => i.id === institutionId);
  if (!inst) return res.status(404).json({ error: 'Institution not found.' });

  const items = store.complianceItems.filter(c => c.institutionId === institutionId);
  const result = await runComplianceAgent(institutionId, items);

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'AI_COMPLIANCE_EVALUATED',
    'AI_AGENT',
    institutionId,
    `AI Compliance Agent evaluated ${items.length} items (Rate: ${result.overallComplianceRate}%).`
  );

  res.json(result);
});

// 26. AI Agent 3: Workflow Coordination Agent
apiRouter.post('/agents/workflow', async (req: Request, res: Response) => {
  const { applicationId } = req.body;
  const app = store.applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const result = await runWorkflowAgent(app);
  res.json(result);
});

// 27. AI Agent 4: Risk and Prioritization Agent
apiRouter.post('/agents/risk', async (req: Request, res: Response) => {
  const actor = getActor(req);
  const { applicationId } = req.body;
  const app = store.applications.find(a => a.id === applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const docs = store.documents.filter(d => d.applicationId === applicationId);
  const compliance = store.complianceItems.filter(c => c.institutionId === app.institutionId);

  const result = await runRiskAgent(app, docs, compliance);
  app.riskScore = result.deterministicScore;
  app.riskFactors = result.factors.map(f => f.factor);

  recordAuditLog(
    actor.id,
    actor.name,
    actor.role,
    'AI_RISK_SCORED',
    'AI_AGENT',
    applicationId,
    `Risk Agent computed index ${result.deterministicScore} (${result.riskLevel}) for ${app.institutionName}.`
  );

  res.json(result);
});

// 28. AI Agent 5: Regulatory RAG Assistant
apiRouter.post('/agents/rag', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  const result = await runRagAgent(query);
  res.json(result);
});

// 29. Regulatory Knowledge Base Management
apiRouter.get('/knowledge', (req: Request, res: Response) => {
  res.json({
    total: store.regulatorySources.length,
    sources: store.regulatorySources
  });
});

apiRouter.post('/knowledge', (req: Request, res: Response) => {
  const actor = getActor(req);
  if (actor.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can manage the regulatory knowledge base.' });
  }

  const { title, issuingAuthority, publicationDate, effectiveDate, version, sourceUrl, samplePassage } = req.body;
  if (!title || !issuingAuthority) {
    return res.status(400).json({ error: 'Title and issuingAuthority are required.' });
  }

  const newSource = {
    id: `reg-${Date.now()}`,
    title,
    issuingAuthority,
    publicationDate: publicationDate || new Date().toISOString().split('T')[0],
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    version: version || 'V1.0',
    sourceUrl,
    status: 'INDEXED' as const,
    chunksCount: Math.floor(Math.random() * 40) + 15,
    uploadedAt: new Date().toISOString(),
    samplePassage: samplePassage || 'Indexed statutory regulatory provisions.'
  };

  store.regulatorySources.unshift(newSource);
  recordAuditLog(actor.id, actor.name, actor.role, 'KNOWLEDGE_SOURCE_ADDED', 'SYSTEM', newSource.id, `Added regulatory source: ${title}`);

  res.status(201).json(newSource);
});

// 30. System Settings & Integrations
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({
    ai: {
      provider: 'Google Gemini',
      model: 'gemini-3.8-flash',
      configured: isGeminiAvailable(),
      status: isGeminiAvailable() ? 'ONLINE' : 'UNCONFIGURED_FALLBACK_MODE'
    },
    database: {
      type: databaseMode,
      postgresConnected: isPostgresConnected,
      status: isPostgresConnected ? 'CONNECTED' : 'DEV_STORE_ACTIVE',
      message: databaseMessage
    },
    n8n: {
      configured: !!process.env.N8N_WEBHOOK_URL,
      webhookUrl: process.env.N8N_WEBHOOK_URL || null,
      status: process.env.N8N_WEBHOOK_URL ? 'CONNECTED' : 'STANDALONE_DIRECT_BACKEND'
    },
    sla: {
      defaultReviewDays: 30,
      evcCompletionHours: 48,
      deficiencyCureDays: 10
    }
  });
});

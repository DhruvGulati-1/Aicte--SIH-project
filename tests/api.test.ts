import assert from 'assert';
import {
  runScrutinyAgent,
  runComplianceAgent,
  runWorkflowAgent,
  runRiskAgent,
  runRagAgent
} from '../server/services/aiAgents.js';
import { store } from '../server/db/store.js';

async function runTests() {
  console.log('🧪 Starting RegulaFlow AI Automated Test Suite...\n');

  // Test 1: Health & Database Seed State
  console.log('▶ Test 1: Verifying Seed Data Invariants...');
  assert(store.users.length >= 5, 'Must have at least 5 seeded users across all roles');
  assert(store.institutions.length >= 5, 'Must have at least 5 AICTE institutions');
  assert(store.applications.length >= 5, 'Must have seeded applications');
  assert(store.regulatorySources.length >= 4, 'Must have indexed regulatory sources');
  console.log('  ✔ Seed Data verification passed.');

  // Test 2: Role Authentication Invariants
  console.log('▶ Test 2: User Role Permissions...');
  const admin = store.users.find(u => u.role === 'ADMIN');
  const officer = store.users.find(u => u.role === 'OFFICER');
  const inst = store.users.find(u => u.role === 'INSTITUTION');
  assert(admin?.passwordHash === 'admin123', 'Admin credentials verified');
  assert(officer?.passwordHash === 'officer123', 'Officer credentials verified');
  assert(inst?.institutionId === 'inst-001', 'Institution role bound to specific campus');
  console.log('  ✔ Role invariants verified.');

  // Test 3: Agent 1 (Application Scrutiny) Output Schema
  console.log('▶ Test 3: Agent 1 - Application Scrutiny Output Schema...');
  const app1 = store.applications[0];
  const docs1 = store.documents.filter(d => d.applicationId === app1.id);
  const scrutinyRes = await runScrutinyAgent(app1, docs1);
  assert.strictEqual(scrutinyRes.agent, 'application_scrutiny');
  assert(typeof scrutinyRes.scrutinyScore === 'number', 'Scrutiny score must be a number');
  assert(Array.isArray(scrutinyRes.findings), 'Findings must be an array');
  assert.strictEqual(scrutinyRes.requires_human_review, true, 'Human review boundary must be enforced');
  console.log(`  ✔ Scrutiny Agent verified (Score: ${scrutinyRes.scrutinyScore}/100, Findings: ${scrutinyRes.findings.length}).`);

  // Test 4: Agent 2 (Compliance Monitoring) Output Schema
  console.log('▶ Test 4: Agent 2 - Compliance Monitoring Output Schema...');
  const compItems = store.complianceItems.filter(c => c.institutionId === 'inst-001');
  const compRes = await runComplianceAgent('inst-001', compItems);
  assert.strictEqual(compRes.agent, 'compliance_monitoring');
  assert(typeof compRes.overallComplianceRate === 'number', 'Compliance rate must be a number');
  assert(Array.isArray(compRes.findings), 'Compliance findings must be an array');
  assert(Array.isArray(compRes.suggestedNotifications), 'Suggested notifications must be an array');
  console.log(`  ✔ Compliance Agent verified (Adherence: ${compRes.overallComplianceRate}%).`);

  // Test 5: Agent 3 (Workflow Coordination) Output Schema
  console.log('▶ Test 5: Agent 3 - Workflow Coordination Output Schema...');
  const workflowRes = await runWorkflowAgent(app1);
  assert.strictEqual(workflowRes.agent, 'workflow_coordination');
  assert(Array.isArray(workflowRes.nextPermittedActions), 'Must return next permitted actions');
  assert(typeof workflowRes.isStalled === 'boolean', 'Stalled flag must be boolean');
  assert(typeof workflowRes.suggestedAction === 'string', 'Suggested action must be a string');
  console.log(`  ✔ Workflow Coordination Agent verified (Next: ${workflowRes.nextPermittedActions.join(', ')}).`);

  // Test 6: Agent 4 (Risk and Prioritization) Output Schema
  console.log('▶ Test 6: Agent 4 - Risk and Prioritization Output Schema...');
  const riskRes = await runRiskAgent(app1, docs1, compItems);
  assert.strictEqual(riskRes.agent, 'risk_and_prioritization');
  assert(typeof riskRes.deterministicScore === 'number', 'Score must be deterministic number');
  assert(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskRes.riskLevel), 'Valid risk level');
  assert(Array.isArray(riskRes.factors), 'Factors breakdown must be present');
  console.log(`  ✔ Risk Agent verified (Index: ${riskRes.deterministicScore}/100 [${riskRes.riskLevel}]).`);

  // Test 7: Agent 5 (Regulatory RAG) Output Schema
  console.log('▶ Test 7: Agent 5 - Regulatory RAG Grounded Output Schema...');
  const ragRes = await runRagAgent('What are the faculty cadre ratio norms for engineering?');
  assert.strictEqual(ragRes.agent, 'regulatory_rag');
  assert(typeof ragRes.answer === 'string' && ragRes.answer.length > 0, 'Answer must not be empty');
  assert(Array.isArray(ragRes.sources), 'Sources must be returned');
  assert(ragRes.sources.length > 0, 'Must retrieve matching regulatory sources from corpus');
  assert(ragRes.sources[0].sourceTitle.includes('Faculty Cadre Ratio'), 'Must cite correct regulation');
  console.log(`  ✔ Regulatory RAG verified (Cited: ${ragRes.sources[0].sourceTitle}).`);

  // Test 8: AICTE Courses & Nomenclature Catalog
  console.log('▶ Test 8: AICTE Approved Courses & Nomenclature Catalog...');
  const { AICTE_COURSES } = await import('../src/data/aicteCoursesData.js');
  assert(AICTE_COURSES.length >= 20, 'Must have at least 20 official AICTE courses cataloged');
  const aiml = AICTE_COURSES.find(c => c.id === 'course-ug-ai-ml');
  assert(aiml !== undefined, 'Artificial Intelligence & Machine Learning course must be present');
  assert.strictEqual(aiml?.nomenclatureCode, 'AICTE-ENG-UG-101');
  assert(aiml?.cadreRatioNorm.includes('1:15'), 'Cadre ratio must specify 1:15');
  assert(aiml?.mandatoryLabs.length > 0, 'Mandatory labs must be specified');
  console.log(`  ✔ AICTE Courses catalog verified (${AICTE_COURSES.length} courses loaded across disciplines).`);

  // Test 9: AICTE Guidelines & Statutory Norms
  console.log('▶ Test 9: AICTE Approval Process Handbook (APH) Guidelines...');
  const { AICTE_GUIDELINE_CHAPTERS, AICTE_CALCULATION_NORMS } = await import('../src/data/aicteGuidelinesData.js');
  assert(AICTE_GUIDELINE_CHAPTERS.length >= 5, 'Must have at least 5 chapters of APH guidelines');
  assert(AICTE_CALCULATION_NORMS.landRequirements.metro.minAcres >= 2.5, 'Mega Metro land norm must be >= 2.50 acres');
  assert.strictEqual(AICTE_CALCULATION_NORMS.cadreRatioEngineeringUG.cadreRatio, '1:2:6');
  console.log(`  ✔ AICTE Guidelines & Norms verified (${AICTE_GUIDELINE_CHAPTERS.length} chapters, Cadre 1:2:6 & STR 1:15).`);

  // Test 10: SIH26262 Dual Interfaces & Official Desk Metadata
  console.log('▶ Test 10: SIH26262 Dual Interfaces (Institution & AICTE Official)...');
  const institutionUser = store.users.find(u => u.role === 'INSTITUTION');
  const officialUser = store.users.find(u => u.role === 'OFFICER');
  assert(institutionUser && institutionUser.institutionId === 'inst-001', 'Interface 1: Institution portal user verified');
  assert(officialUser && officialUser.email === 'officer.sharma@aicte-india.org', 'Interface 2: AICTE Official portal user verified');
  console.log('  ✔ Dual Interfaces verified (1. Institution Portal, 2. AICTE Official Directorate).');

  console.log('\n✅ ALL 10 AUTOMATED REGULATORY & SIH TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failure:', err);
  process.exit(1);
});

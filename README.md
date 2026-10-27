# RegulaFlow AI (SIH26262)
### AI-Powered AICTE Approval Workflow Automation & Compliance Monitoring Platform

**Smart India Hackathon Problem Statement:** SIH26262  
**Domain:** Regulatory Technology, Higher Education Governance, Workflow Automation, AI Compliance  

RegulaFlow AI is an integrated, production-minded regulatory automation and compliance platform designed for technical education authorities (such as AICTE) and affiliated institutions. It digitizes application pipelines, automates document scrutiny, coordinates Expert Visit Committees (EVC), monitors statutory compliance deadlines (fire safety, land titles, faculty cadre ratios), and assists authorized human evaluators through five specialized AI agents with deterministic safeguards.

---

## 1. System Architecture

```
regulaflow-ai/
├── index.html                 # HTML Entry point with synced metadata
├── metadata.json              # Platform metadata & permissions
├── package.json               # Dependencies & full-stack scripts
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite plugin configuration
├── server.ts                  # Full-stack Node.js / Express entry point
├── server/
│   ├── db/
│   │   ├── schema.sql         # Production PostgreSQL schema
│   │   └── store.ts           # Unified data store (PostgreSQL + DevStore fallback)
│   ├── routes/
│   │   └── api.ts             # Express router implementing all 30 REST endpoints
│   └── services/
│       └── aiAgents.ts        # 5 AI Agents with Gemini API & deterministic logic
├── src/
│   ├── main.tsx               # Client entry point
│   ├── App.tsx                # App routing & protected layout
│   ├── index.css              # Global styles with Tailwind CSS
│   ├── types/
│   │   └── index.ts           # Complete shared TypeScript entity types
│   ├── context/
│   │   └── AuthContext.tsx    # JWT-based session & 1-click persona switcher
│   ├── services/
│   │   └── api.ts             # Centralized typed frontend API client
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx  # Responsive shell with transparency banner
│   │   │   ├── Header.tsx     # Global search, notification bell, role badge
│   │   │   └── Sidebar.tsx    # Deep navy collapsible sidebar
│   │   └── common/
│   │       └── StatusBadge.tsx# Anti-slop domain-native status chips
│   └── pages/
│       ├── Dashboard.tsx      # 8 clickable KPIs, Recharts charts, ageing table
│       ├── Applications.tsx   # Search, filters, presets, application registry
│       ├── ApplicationDetail.tsx # 8 comprehensive tabs, transitions, and AI triggers
│       ├── NewApplicationWizard.tsx # 7-step submission wizard with validation
│       ├── ScrutinyWorkspace.tsx # Officer scrutiny desk, OCR inspector, Agent 1
│       ├── Institutions.tsx   # Verified public directory with CSV importer
│       ├── Compliance.tsx     # Requirement catalog, 30-day expiry monitor
│       ├── EvcManagement.tsx  # Expert evaluation visits and report submission
│       ├── AgentCenter.tsx    # Interactive testing hub for all 5 AI agents
│       ├── RegulatoryKnowledge.tsx # AICTE Approval Handbook & RAG search
│       ├── Reports.tsx        # Analytics throughput & CSV data export
│       ├── AuditLogs.tsx      # Immutable tamper-evident audit trail
│       ├── Settings.tsx       # System health, PostgreSQL, and SLA rules
│       └── Login.tsx          # Official government portal login with demo personas
└── tests/
    └── api.test.ts            # Automated test suite for data, roles, and AI agents
```

---

## 2. Five Autonomous AI Agents

1. **Agent 1: Application Scrutiny Agent** (`POST /api/v1/agents/scrutiny`)
   - Cross-references submitted document metadata and extracted text with application parameters.
   - Detects missing statutory NOCs, expiring certifications, and computes student-teacher ratio (STR) under AICTE Cadre 1:2:6 norms.
   - Strictly outputs `requires_human_review: true` with confidence ratings and recommendations.

2. **Agent 2: Compliance Monitoring Agent** (`POST /api/v1/agents/compliance`)
   - Deterministic temporal calculation engine assessing upcoming deadlines (&le; 30 days) and expired credentials.
   - Generates automated in-app reminder notifications for institution coordinators and regional desks.

3. **Agent 3: Workflow Coordination Agent** (`POST /api/v1/agents/workflow`)
   - Inspects application lifecycle states (`SUBMITTED`, `UNDER_SCRUTINY`, `SCRUTINY_REVERTED`, `EVC_SCHEDULED`, etc.).
   - Detects stalled stages (> 14 days) and suggests the next legally permitted action and recommended actor role.

4. **Agent 4: Risk and Prioritization Agent** (`POST /api/v1/agents/risk`)
   - Transparent, deterministic multi-factor scoring (0 to 100) assessing application age, high intake expansions, open document deficiencies, and overdue compliance items.
   - Combines transparent numerical factors with qualitative AI evaluation.

5. **Agent 5: Regulatory RAG Assistant** (`POST /api/v1/agents/rag`)
   - Grounded Q&A assistant retrieving passages from verified AICTE Approval Process Handbooks (APH 2026-27), faculty cadre regulations, and land norms.
   - Employs exact section citations and explicitly alerts users if requested guidance is absent from the indexed corpus.

---

## 3. Five User Roles & Demo Credentials

| Role | Email | Password | Primary Purpose |
|------|-------|----------|-----------------|
| **ADMIN** | `admin@regulaflow.gov.in` | `admin123` | System management, audit logs, regulatory knowledge base |
| **COMPETENT_AUTHORITY** | `ca@aicte-india.org` | `ca123` | Final review, issuing Letter of Approval (LoA) or Rejection |
| **OFFICER** | `officer.sharma@aicte-india.org` | `officer123` | Document scrutiny, deficiency reverts, advancing stages |
| **INSTITUTION** | `principal@iitdelhi.ac.in` | `inst123` | Track campus applications, submit rectifications, view compliance |
| **EVC** | `evaluator.rao@aicte-evc.org` | `evc123` | Conduct on-site inspections, verify checklists, submit reports |

*Note: Single-click demo role switching is available on the Login screen and top navigation bar.*

---

## 4. Local Installation & Running

### Prerequisites
- Node.js 20+
- npm or pnpm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (`.env`)
```bash
cp .env.example .env
```
Key variables:
- `PORT=3000`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://user:password@localhost:5432/regulaflow` *(Optional: DevStore runs automatically if omitted)*
- `GEMINI_API_KEY=YOUR_GEMINI_API_KEY` *(Injected automatically in Google AI Studio)*

### Step 3: Run the Full-Stack Application
```bash
npm run dev
```
The server starts at `http://localhost:3000`, mounting the API at `/api/v1` and Vite client.

### Step 4: Run Automated Tests
```bash
npm test
```

---

## 5. Deployment Guide

### Deploying Backend to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository.
3. Configure settings:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.ts` (or `npm start`)
4. Set Environment Variables:
   - `NODE_ENV=production`
   - `PORT=4000` (or leave default assigned by Render)
   - `DATABASE_URL=postgres://...` (from Render PostgreSQL instance)
   - `GEMINI_API_KEY=...`
   - `JWT_SECRET=your-random-32-char-secret`

### Deploying PostgreSQL Database
1. Provision a PostgreSQL 15+ database on Render or Neon.
2. Execute `/server/db/schema.sql` to initialize tables and indexes.
3. Supply the database connection string in `DATABASE_URL`.

### Deploying Frontend to Vercel
1. If deployed as a decoupled static frontend on Vercel:
   - Set **Build Command:** `npm run build`
   - Set **Output Directory:** `dist`
   - Set Environment Variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api/v1`

---

## 6. Regulatory & Ethical Disclaimer

RegulaFlow AI is built for hackathon evaluation (SIH26262). It is not an official government portal of the All India Council for Technical Education (AICTE) or Ministry of Education. Artificial intelligence outputs are advisory recommendations; statutory decrees remain strictly within the purview of authorized human decision-makers.

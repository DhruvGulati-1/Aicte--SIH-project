# RegulaFlow AI (SIH26262)
### Autonomous AICTE Approval Workflow Automation & Statutory Compliance Platform

**Smart India Hackathon Problem Statement:** SIH26262  
**Domain:** Higher Education Governance, Regulatory Technology, Workflow Automation, AI Compliance Engine  
**Live Production URL:** Dynamic deployment on Render (e.g., `https://regulaflow-aicte.onrender.com`)

RegulaFlow AI is an integrated, production-ready regulatory automation and compliance platform designed for the All India Council for Technical Education (AICTE), regulatory directorates, and affiliated technical institutions across India. It digitizes the complete application approval lifecycle, automates document scrutiny against AICTE Approval Process Handbook (APH 2026-27) norms, coordinates Expert Visit Committees (EVC), monitors statutory compliance deadlines (faculty cadre ratios 1:2:6, student-faculty ratios 1:15/1:20, land area requirements, fire safety NOCs), and provides authorized government officials with deterministic decision-support workflows.

---

## 1. Dual Portal Architecture

The platform provides two distinct, role-separated portals:

### Portal 1: Technical Institution Portal (`/login`)
- **Target Users:** Principals, Deans, Directors, and Authorized Nodal Officers of Technical Colleges/Universities.
- **Features:**
  - AICTE Permanent Institute ID (PID) or official institutional email authentication.
  - Multi-step Approval Application Submission Wizard (New Technical Institute, Extension of Approval / EoA, Increase in Intake, Introduction of Emerging Tech Supernumerary Seats).
  - Real-time statutory compliance tracker (Fire Safety, Land Title, Building Plan, NBA Accreditation, AISHE Certificate).
  - Deficiency rectification & response filing with official audit trail.

### Portal 2: AICTE Official Directorate Desk (`/official`)
- **Target Users:** AICTE Regional Officers, Scrutiny Committee Members, Expert Visit Committee (EVC) Evaluators, and Competent Approval Authorities.
- **Features:**
  - Complete national and regional application oversight dashboard (NRO, WRO, SWRO, SRO, NWRO, ERO, CRO).
  - Statutory norm automated verification (Faculty Cadre 1:2:6 validator, Student-Faculty Ratio 1:15/1:20 check, Land norms).
  - One-click Official Regulatory Actions:
    * **Grant Extension of Approval (EoA) / Approval** with digital seal.
    * **Issue AICTE Deficiency Memo** citing specific APH chapters with 15-day compliance notice.
    * **Order Expert Visit Committee (EVC)** inspection with designated chairperson and panel.
  - Real-time SIH Evaluator quick switch and live endpoint health inspector.

---

## 2. Five Autonomous AI Agents

1. **Agent 1: Application Scrutiny Agent** (`POST /api/v1/agents/scrutiny`)
   - Cross-references submitted document metadata and extracted text against application parameters.
   - Detects missing statutory NOCs, expiring certifications, and computes student-teacher ratio (STR) under AICTE Cadre 1:2:6 norms.
   - Deterministically flags anomalies while requiring human review for compliance.

2. **Agent 2: Compliance Monitoring Agent** (`POST /api/v1/agents/compliance`)
   - Deterministic temporal calculation engine assessing upcoming deadlines (≤ 30 days) and expired credentials.
   - Generates automated alert notices for institution coordinators and regional desks.

3. **Agent 3: Workflow Coordination Agent** (`POST /api/v1/agents/workflow`)
   - Inspects application lifecycle states (`SUBMITTED`, `UNDER_SCRUTINY`, `SCRUTINY_REVERTED`, `EVC_SCHEDULED`, etc.).
   - Detects stalled stages (> 14 days) and suggests the next legally permitted action and recommended actor role.

4. **Agent 4: Risk and Prioritization Agent** (`POST /api/v1/agents/risk`)
   - Transparent, deterministic multi-factor scoring (0 to 100) assessing application age, high intake expansions, open document deficiencies, and overdue compliance items.
   - Combines transparent numerical factors with qualitative evaluation.

5. **Agent 5: Regulatory RAG Assistant** (`POST /api/v1/agents/rag`)
   - Grounded Q&A assistant retrieving passages from verified AICTE Approval Process Handbooks (APH 2026-27), faculty cadre regulations, and land norms.
   - Employs exact handbook citations and alerts users if requested guidance is outside the indexed corpus.

---

## 3. Five User Roles & Test Credentials

| Role | Identifier / Email | Password | Primary Purpose |
|------|--------------------|----------|-----------------|
| **INSTITUTION** | `principal@iitdelhi.ac.in` (PID: `1-10928374`) | `inst123` | Institutional dashboard, submit applications, view compliance |
| **OFFICER** | `officer.sharma@aicte-india.org` (ID: `OFFICER-NORTH-01`) | `officer123` | Scrutiny desk, issue deficiency memos, verify cadre ratios |
| **COMPETENT_AUTHORITY** | `ca@aicte-india.org` | `ca123` | Final approval, granting EoA, official orders |
| **EVC** | `evaluator.rao@aicte-evc.org` | `evc123` | On-site inspections, physical verification checklist |
| **ADMIN** | `admin@regulaflow.gov.in` | `admin123` | National governance, audit trail, regulatory handbook management |

*Note: The login screen includes a 1-click SIH Evaluator Direct Access button for instant testing.*

---

## 4. How to Deploy Live on Render (Step-by-Step)

The project is pre-configured for deployment on [Render](https://render.com) using either the included `render.yaml` Blueprint or manual Web Service creation.

### Option A: 1-Click Blueprint (Recommended)
1. Push this repository to your **GitHub** account.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml` and configure the build and start commands.
5. Click **Apply**. Your app will build and deploy live with a free SSL certificate!

### Option B: Manual Web Service Setup
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Select your GitHub repository.
4. Configure the settings:
   - **Name:** `regulaflow-aicte-portal` (or any custom name)
   - **Language / Environment:** `Node`
   - **Region:** Any (e.g., Singapore, Oregon, Frankfurt)
   - **Branch:** `main`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. In **Advanced > Health Check Path**, enter: `/api/v1/health`
6. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `ENABLE_DEMO_SEED`: `true`
   - `GEMINI_API_KEY`: *(Optional: your Gemini API key)*
   - `DATABASE_URL`: *(Optional: PostgreSQL connection string if using external DB)*
7. Click **Create Web Service**.
8. Once the build finishes (takes ~1-2 minutes), Render will assign a live URL:
   `https://<your-service-name>.onrender.com`
9. Copy this live link and paste it into the SIH Submission portal.

---

## 5. Local Development Setup

### Prerequisites
- Node.js 20+
- npm (v10+)

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/regulaflow-aicte.git
cd regulaflow-aicte

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start local development server
npm run dev
# The full-stack server starts at http://localhost:3000

# 5. Run automated compliance & API tests
npm test
```

---

## 6. Regulatory & Ethical Notice

RegulaFlow AI is developed for the Smart India Hackathon (Problem Statement SIH26262). Artificial intelligence agent recommendations are advisory; statutory regulatory decisions remain strictly under human authority in compliance with AICTE regulations.

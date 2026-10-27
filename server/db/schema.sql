-- RegulaFlow AI PostgreSQL Schema
-- AI-Powered AICTE Approval Workflow Automation & Compliance Monitoring Platform

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    institution_id VARCHAR(64),
    designation VARCHAR(128),
    department VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(64) PRIMARY KEY,
    official_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    institution_type VARCHAR(128) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    source_snapshot_date DATE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(64),
    head_of_institution VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) REFERENCES institutions(id),
    institution_name VARCHAR(255) NOT NULL,
    application_type VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    workflow_path VARCHAR(32) NOT NULL,
    current_stage VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    assigned_officer_id VARCHAR(64),
    assigned_officer_name VARCHAR(255),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    target_sla_date TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    scrutiny_score NUMERIC,
    risk_score NUMERIC,
    risk_factors JSONB
);

CREATE TABLE IF NOT EXISTS application_history (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES applications(id),
    from_stage VARCHAR(64),
    to_stage VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    reason TEXT,
    comments TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES applications(id),
    document_type VARCHAR(128) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    status VARCHAR(32) NOT NULL,
    verifier_notes TEXT,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    extracted_text TEXT,
    ocr_confidence NUMERIC
);

CREATE TABLE IF NOT EXISTS compliance_items (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) REFERENCES institutions(id),
    institution_name VARCHAR(255) NOT NULL,
    requirement_code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    required_evidence TEXT NOT NULL,
    submission_date DATE,
    due_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(32) NOT NULL,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    reviewer_comments TEXT,
    evidence_document_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS evc_visits (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES applications(id),
    institution_id VARCHAR(64) REFERENCES institutions(id),
    institution_name VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time VARCHAR(32),
    status VARCHAR(32) NOT NULL,
    lead_evaluator VARCHAR(255) NOT NULL,
    evaluator_team JSONB,
    meeting_mode VARCHAR(64) NOT NULL,
    location_or_meeting_link TEXT,
    checklist_items JSONB,
    evaluation_notes TEXT,
    findings_summary TEXT,
    report_submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    role VARCHAR(32),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    application_id VARCHAR(64),
    institution_id VARCHAR(64),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS regulatory_sources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    publication_date DATE NOT NULL,
    effective_date DATE NOT NULL,
    version VARCHAR(64) NOT NULL,
    source_url TEXT,
    status VARCHAR(32) NOT NULL,
    chunks_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sample_passage TEXT
);

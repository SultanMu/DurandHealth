-- Initialize DurandHealth database with default users and data

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table for user sessions
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR NOT NULL DEFAULT 'patient',
    department VARCHAR,
    employee_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default test users
INSERT INTO users (username, password, email, first_name, last_name, role, department, employee_id) VALUES
('patient1', 'password123', 'patient@durandhealth.com', 'John', 'Doe', 'patient', NULL, NULL),
('hr1', 'password123', 'hr@durandhealth.com', 'Sarah', 'Wilson', 'hr', 'Human Resources', 'HR001'),
('corporate1', 'password123', 'corporate@durandhealth.com', 'Michael', 'Chen', 'corporate', 'Operations', 'CORP001'),
('admin1', 'password123', 'admin@durandhealth.com', 'Emily', 'Rodriguez', 'admin', 'IT', 'ADMIN001')
ON CONFLICT (username) DO NOTHING;

-- Create health assessments table
CREATE TABLE IF NOT EXISTS health_assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assessment_data JSONB NOT NULL,
    risk_score INTEGER,
    completed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    service_type VARCHAR NOT NULL,
    provider VARCHAR,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create consents table
CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    consent_type VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    expires_at TIMESTAMP,
    audit_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create health goals table
CREATE TABLE IF NOT EXISTS health_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    goal_type VARCHAR NOT NULL,
    target INTEGER,
    current INTEGER DEFAULT 0,
    unit VARCHAR,
    status VARCHAR NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create health activities table
CREATE TABLE IF NOT EXISTS health_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    activity_type VARCHAR NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create incentive programs table
CREATE TABLE IF NOT EXISTS incentive_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    requirements JSONB,
    rewards JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user incentives table
CREATE TABLE IF NOT EXISTS user_incentives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    program_id INTEGER NOT NULL REFERENCES incentive_programs(id),
    status VARCHAR NOT NULL DEFAULT 'enrolled',
    progress JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    parameters JSONB,
    data JSONB,
    generated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR NOT NULL,
    entity_type VARCHAR,
    entity_id VARCHAR,
    changes JSONB,
    ip_address VARCHAR,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
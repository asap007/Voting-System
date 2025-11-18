-- VoteHub Database Schema
-- Migration: 001_initial_schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ai_prompt TEXT, -- Original AI prompt used to generate the form
    is_anonymous INTEGER DEFAULT 1, -- 1 for anonymous, 0 for identified
    is_published INTEGER DEFAULT 0, -- 1 for published, 0 for draft
    one_response_per_person INTEGER DEFAULT 1, -- Enforce single response
    estimated_time INTEGER, -- Estimated completion time in seconds
    response_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN ('text', 'textarea', 'likert', 'multiple_choice', 'checkboxes', 'rating', 'yes_no')),
    options TEXT, -- JSON array of options for multiple choice/checkboxes
    is_required INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    conditional_logic TEXT, -- JSON for conditional display rules
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Responses table (encrypted)
CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    response_token TEXT UNIQUE, -- Bcrypt token for one-response-per-person
    encrypted_data TEXT NOT NULL, -- AES-256 encrypted JSON of all answers
    user_fingerprint TEXT, -- Optional: browser fingerprint for anonymous tracking
    submitted_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Individual answers (for analytics, encrypted)
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    response_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    encrypted_answer TEXT NOT NULL, -- AES-256 encrypted answer
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Analytics cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL,
    analytics_data TEXT NOT NULL, -- JSON of computed analytics
    ai_insights TEXT, -- AI-generated insights from Gemini
    generated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Session tokens for authenticated users
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);
CREATE INDEX IF NOT EXISTS idx_responses_token ON responses(response_token);
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

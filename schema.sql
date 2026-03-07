-- QuizForge AI Platform - Database Schema
-- Compatible with PostgreSQL 14+

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(36) PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50),
    education_level VARCHAR(50),
    timer_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    allow_multiple_attempts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_creator ON quizzes(creator_id);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(36) REFERENCES quizzes(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    options_json JSONB,
    correct_answer TEXT,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    points INTEGER DEFAULT 1
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(36) REFERENCES quizzes(id) ON DELETE CASCADE,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    score FLOAT DEFAULT 0,
    max_score FLOAT DEFAULT 0,
    percentage FLOAT DEFAULT 0,
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(50)
);

CREATE INDEX idx_responses_quiz ON responses(quiz_id);
CREATE INDEX idx_responses_email ON responses(quiz_id, participant_email);

CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES responses(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN,
    points_earned FLOAT DEFAULT 0
);

CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_answers_question ON answers(question_id);

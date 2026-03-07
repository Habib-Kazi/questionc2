# 🎓 QuizForge AI — Source-to-Quiz SaaS Platform

> Turn any document, URL, or image into an intelligent quiz using GPT-4. Host, share, and analyze quiz results — all in one platform.

---

## ✨ Features

| Feature | Details |
|--------|---------|
| **Source Ingestion** | PDF, DOCX, TXT, Image (OCR), Web URL |
| **AI Question Generation** | GPT-4 powered, 5 question types |
| **Quiz Types** | MCQ, True/False, Fill-in-Blank, Short Answer, Long Answer |
| **Difficulty Levels** | Easy, Medium, Hard, Analytical, Creative, IQ-based |
| **Education Levels** | School → Research |
| **Quiz Hosting** | Public URL `/quiz/{id}`, no login required |
| **Timer** | Configurable per-quiz countdown |
| **Auto Grading** | Instant grading with AI-assisted open answer scoring |
| **Analytics** | Score distribution, pass rate, hardest questions |
| **CSV Export** | Export participant data |
| **Auth** | JWT-based user authentication |

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  FastAPI Backend │◄──►│   PostgreSQL DB  │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 5432)   │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │     OpenAI GPT-4      │
                    │  (Question Generation) │
                    └───────────────────────┘
```

## 📁 Project Structure

```
ai-quiz-platform/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLAlchemy DB config
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── models/
│   │   └── __init__.py         # User, Quiz, Question, Response, Answer
│   ├── routes/
│   │   ├── auth.py             # POST /register, POST /login
│   │   ├── quiz.py             # Upload, generate, create, update
│   │   ├── participation.py    # GET /quiz/{id}, POST submit
│   │   └── dashboard.py        # Creator analytics, CSV export
│   └── services/
│       ├── ai_engine.py        # GPT-4 question generation + grading
│       ├── extraction_engine.py # PDF/DOCX/Image/URL extraction
│       └── auth_service.py     # JWT, password hashing
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── LandingPage.js   # NotebookLM-inspired dark editorial
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── UploadPage.js    # 3-step source upload + config
│   │   │   ├── QuizEditor.js    # Full CRUD question editor
│   │   │   ├── QuizPlayer.js    # Public quiz experience + results
│   │   │   ├── Dashboard.js     # Creator quiz management
│   │   │   └── AnalyticsPage.js # Charts, participants, export
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── utils/
│   │       └── api.js           # Axios with JWT interceptor
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── schema.sql
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- OpenAI API key

### 1. Clone and configure

```bash
git clone <your-repo>
cd ai-quiz-platform

# Create environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://quiz_user:quiz_pass@localhost:5432/quiz_db
SECRET_KEY=your-super-secret-key-min-32-characters-long
OPENAI_API_KEY=sk-your-openai-api-key-here
FRONTEND_URL=http://localhost:3000
```

### 2. Start with Docker (Recommended)

```bash
# Set your OpenAI key
export OPENAI_API_KEY=sk-your-key-here

# Start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# API:      http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 3. Local Development (No Docker)

**Backend:**
```bash
cd backend

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install tesseract-ocr poppler-utils

# Python setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
createdb quiz_db
cp .env.example .env  # Edit with your values

# Run server
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Current user |

### Quiz Creation (Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/upload-source` | Upload file or URL |
| POST | `/api/quiz/generate-questions` | AI question generation |
| POST | `/api/quiz/create-quiz` | Publish quiz |
| PUT | `/api/quiz/quiz/{id}` | Update quiz |
| DELETE | `/api/quiz/quiz/{id}` | Delete quiz |

### Participation (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/{quiz_id}` | Get quiz (no answers) |
| POST | `/api/quiz/{quiz_id}/submit` | Submit answers |

### Dashboard (Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/creator/quizzes` | List creator's quizzes |
| GET | `/api/creator/results/{quiz_id}` | Analytics |
| GET | `/api/creator/results/{quiz_id}/export` | CSV download |

---

## 🤖 AI Question Generation

The platform uses GPT-4 with structured prompting:

- **MCQ**: 4 options (A-D), one correct answer
- **True/False**: Binary judgment questions
- **Fill-in-Blank**: Single word/phrase answer
- **Short Answer**: 1-3 sentence AI-graded response
- **Long Answer**: Essay response with AI rubric scoring

Open-ended answers (short/long) are graded by GPT-4-mini on a 0.0–1.0 scale.

---

## 📊 Database Schema

See `schema.sql` for complete DDL. Key tables:
- `users` — Creator accounts
- `quizzes` — Quiz metadata + settings
- `questions` — Questions with options and answers
- `responses` — Participant submission records
- `answers` — Individual answer records with grading

---

## 🌐 Production Deployment

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@your-db-host:5432/quiz_db
SECRET_KEY=minimum-32-character-random-string
OPENAI_API_KEY=sk-your-production-key
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### Deploy to a VPS (Ubuntu)
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone <your-repo> && cd ai-quiz-platform

# Set production env vars
export OPENAI_API_KEY=sk-...
export SECRET_KEY=$(openssl rand -hex 32)
export FRONTEND_URL=https://yourdomain.com
export REACT_APP_API_URL=https://api.yourdomain.com/api

# Launch
docker-compose up -d --build
```

### Reverse Proxy (Nginx)
```nginx
server {
    server_name yourdomain.com;
    location / { proxy_pass http://localhost:3000; }
}
server {
    server_name api.yourdomain.com;
    location / { proxy_pass http://localhost:8000; }
}
```

---

## 🔧 Configuration

### Supported File Types
| Format | Library | Notes |
|--------|---------|-------|
| PDF | pdfplumber | Text extraction |
| DOCX | python-docx | Text + tables |
| TXT | Built-in | Direct read |
| PNG/JPG/WEBP | pytesseract | OCR via Tesseract |
| URL | BeautifulSoup4 | Main content extraction |

### Quiz Settings
- **Timer**: 0 = unlimited, otherwise countdown in minutes
- **Multiple attempts**: Allow same email to submit again
- **Difficulty**: Passed to GPT-4 as context for question generation
- **Education level**: Calibrates complexity and vocabulary

---

## 📝 License

MIT License — Free for personal and commercial use.

---

## 🙋 Support

- Open an issue for bugs
- PRs welcome for new features
- API docs at `/docs` when backend is running

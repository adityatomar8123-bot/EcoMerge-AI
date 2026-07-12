# 🌱 EcoSphere: ESG Enterprise Management Platform

EcoSphere is a state-of-the-art, enterprise-grade Environmental, Social, and Governance (ESG) management platform designed to integrate directly into day-to-day ERP operations. Built for the hackathon, EcoSphere enables real-time sustainability indicators, automated carbon ledger auditing, CSR volunteer engagement tracking, and centralized governance compliance.

## 🚀 Live Deployment
- **Live URL**: [https://eco-merge-ai.vercel.app](https://eco-merge-ai.vercel.app)
- **Frameworks**: Next.js 15 (Frontend) + FastAPI Python (Serverless Backend API)

---

## 🏛️ Platform Architecture

EcoSphere is built using a modern decoupled architecture optimized for both high-performance local execution and serverless cloud deployment:

```mermaid
graph TD
    A[Next.js 15 Frontend] -->|Relative API Calls /api/*| B[FastAPI Backend]
    B -->|Automatic Detection| C{Database Router}
    C -->|If DATABASE_URL set| D[(PostgreSQL / MySQL)]
    C -->|Zero-Config Fallback| E[(SQLite: backend/app/db/ecosphere.db)]
    E -->|Container Sync| F[/tmp/ecosphere.db Serverless /tmp]
```

### 1. Database & Seeding Strategy
- **Dialect Auto-Detection**: Refactored [session.py](backend/app/db/session.py) to automatically connect to high-availability PostgreSQL or MySQL when configured.
- **Zero-Config Fallback**: Falls back to a local SQLite database if no server connection is specified, making it fully self-contained.
- **IEEE Carbon Dataset**: Pre-seeded with real-world 2022 and 2023 monthly carbon emissions datasets from IEEE, dynamically mapped relative to the current active year (**2026**) so trendline graphs plot correctly.
- **Sandbox Role Data Separation**: Data is distributed among the four sandbox roles (`Admin`, `Manager`, `Employee`, `Auditor`) so that logging in as different users renders personalized department-specific metrics (Operations, Administration, People/HR) while matching global IEEE totals.

### 2. Vercel Cloud Serverless Optimizations
- **Function Size Optimization**: Uses a customized `.vercelignore` file to exclude large CSV datasets (e.g. 450+ MB of raw IEEE CSV wave datasets) from Vercel's serverless function packaging. This ensures the live bundle stays well under Vercel's 500MB function limit while retaining the full dataset on GitHub.
- **Container Cache Invalidation**: Copies the packaged database directly to `/tmp/ecosphere.db` on container spin-up, ensuring that new git pushes immediately overwrite old container databases.
- **CORS Support**: Permissive regex-based CORS middleware allowing preview deployments from any `*.vercel.app` domain.

---

## 🔐 Auth & Sandbox Roles

EcoSphere includes a beautiful, premium login layout containing **Google** and **Microsoft** SSO OAuth buttons, a **Sign In / Create Account** tab system, and **Quick Sandbox Logins**:

- **Admin** (`admin@ecosphere.local` / `admin123`): Complete oversight of ESG weighting parameters, notifications, and departments.
- **Manager** (`manager@ecosphere.local` / `manager123`): Scoped to Operations; handles fleet logs, purchase records, and social volunteer approvals.
- **Employee** (`employee@ecosphere.local` / `employee123`): Scoped to Operations; logs personal commute data and participates in gamified sustainability challenges.
- **Auditor** (`auditor@ecosphere.local` / `auditor123`): Scoped to People / HR; registers policy guidelines, reviews compliance violations, and issues audits.

---

## 🤖 AI Advisor Integration

EcoSphere contains a premium **AI Advisor** tab that analyzes corporate database metrics to generate actionable insights:

1. **Active LLM Mode**: Set the `AI_API_KEY` environment variable in Vercel to connect to an OpenAI-compatible endpoint (such as Groq, Llama, or Ollama). The backend automatically feeds real-time carbon, CSR, and audit records as system prompt context to the model.
2. **Context-Aware Fallback**: If no API key is provided, the AI Advisor defaults to contextual, data-driven ESG recommendations calculated dynamically from actual database records (e.g. highlighting diesel fleet offsets or electricity consumption metrics).

---

## 💻 Local Development Setup

To run the entire suite locally:

### 1. Backend API (FastAPI)
```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate | Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Local API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Dashboard (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Local Frontend URL: [http://localhost:3000](http://localhost:3000)

---

## 📄 License & Dataset Attribution
- **IEEE Datasets**: IEEE Carbon Emissions Wave Data & recipe footprints parsed and imported into the core db schema.
- **Licensing**: Open-source for Hackathon evaluation.

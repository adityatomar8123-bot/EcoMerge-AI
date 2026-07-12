# EcoSphere Setup Guide

## Required local environment

- Python
- Node.js
- Docker Compose
- PostgreSQL container runtime

## Backend startup

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database startup

```bash
docker compose -f backend/docker-compose.yml up -d
```

## Frontend startup

```bash
cd ESG-demo-main/frontend
npm install
npm run dev -- --port 3001
```

## Default local credentials

- admin@ecomerge.local / admin123
- manager@ecomerge.local / manager123
- employee@ecomerge.local / employee123
- auditor@ecomerge.local / auditor123

## Expected local endpoints

- frontend: http://localhost:3001
- backend: http://localhost:8000
- docs: http://localhost:8000/docs

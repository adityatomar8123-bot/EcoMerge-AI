# EcoSphere Backend

The backend is the operational spine of EcoSphere. It exposes a FastAPI API for authentication, dashboarding, ESG transactions, governance workflows, reports, notifications, and lightweight AI advisory services.

## Architecture direction

The backend is organized into a practical controller/service/repository structure:
- app/api/routes — HTTP endpoints
- app/controllers — request orchestration
- app/services — business logic
- app/repositories — persistence access
- app/models — SQLAlchemy models
- app/core — security, config, and RBAC

## Local-first database

EcoSphere uses PostgreSQL locally through Docker Compose as the default database runtime.

```bash
docker compose -f backend/docker-compose.yml up -d
```

## Run the API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Auth and roles

The platform uses JWT authentication with role-based access control.

Roles:
- admin
- manager
- employee
- auditor

Seed users:
- admin@ecomerge.local / admin123
- manager@ecomerge.local / manager123
- employee@ecomerge.local / employee123
- auditor@ecomerge.local / auditor123

## API clusters

- auth — login and token issuance
- dashboard — overview KPIs and role-aware summaries
- departments — department master data
- carbon — emissions entries and carbon scoring
- governance — policies, audits, and compliance issues
- notifications — operational alerts and reminders
- reports — report generation and export metadata
- ai — advisory recommendations layered on top of ERP data

## Database baseline

The PostgreSQL schema baseline and seed assets live under:
- backend/migrations/001_create_erp_schema.sql
- backend/seeds/seed_erp.py

## Verification

A focused regression test file ensures the foundation remains stable:
- backend/tests/test_erp_foundation.py

The expected authentication and RBAC foundation is intentionally lightweight and business-oriented, with AI kept secondary.

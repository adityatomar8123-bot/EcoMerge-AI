# EcoSphere

EcoSphere is a local-first ERP-style ESG operations platform built for the Odoo Hackathon. The repository now centers a structured FastAPI backend, a PostgreSQL foundation, JWT authentication, role-based access control, and a Next.js dashboard that presents business workflows instead of a research-only document-analysis demo.

## Product story

EcoSphere turns ESG management into an operational system:
- departments and user roles are first-class master data
- carbon and governance actions are recorded as business transactions
- auditors review policies and compliance issues through a clear workflow
- notifications, challenges, and reports keep teams aligned
- AI remains an advisor layer that reads operational data and returns recommendations, rather than becoming the product itself

## Core modules

- Dashboard overview and KPI monitoring
- Department management
- Carbon tracking and emissions summaries
- Governance policies and acknowledgements
- Audit and compliance issue workflows
- Notifications, rewards, and challenge-based engagement
- Report generation and export

## Stack

Frontend
- Next.js 15 + TypeScript
- Tailwind CSS
- shadcn-style UI foundations
- Recharts-ready dashboard surface

Backend
- FastAPI
- SQLAlchemy + Pydantic
- JWT authentication
- RBAC for admin, manager, employee, and auditor roles
- PostgreSQL via Docker Compose

## Local development

1. Install Python dependencies.
2. Start PostgreSQL locally:

```bash
docker compose -f backend/docker-compose.yml up -d
```

3. Run the API:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. Start the frontend:

```bash
cd ESG-demo-main/frontend
npm install
npm run dev -- --port 3001
```

## Demo identities

Seeded local users:
- admin@ecomerge.local / admin123
- manager@ecomerge.local / manager123
- employee@ecomerge.local / employee123
- auditor@ecomerge.local / auditor123

## Repository layout

- backend/app — FastAPI application, routes, controllers, services, and models
- backend/migrations — PostgreSQL schema baseline
- backend/seeds — seeded ERP data and role examples
- ESG-demo-main/frontend — dashboard and workflow UI shell
- docs — product documentation and implementation brief

## Documentation index

- docs/architecture.md — system architecture
- docs/database.md — data model and PostgreSQL schema
- docs/api.md — API surface and roles
- docs/feature-mapping.md — operational module alignment
- docs/ui-screens.md — dashboard and workflow screens
- docs/roadmap.md — implementation phases
- docs/setup.md — environment and startup instructions
- docs/legacy.md — historical research notes preserved for context

## Product principle

EcoSphere is intentionally not positioned as a chatbot or research pipeline demo. The user experience is an enterprise-ready, role-aware ESG management workflow with local data ownership and clean operational dashboards.


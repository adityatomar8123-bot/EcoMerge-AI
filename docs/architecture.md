# EcoSphere Architecture

EcoSphere is structured as a local-first ERP-style ESG platform with a clean separation between presentation, API, business logic, and persistence.

## System shape

- Frontend: Next.js + TypeScript + Tailwind + shadcn-style UI primitives
- Backend: FastAPI with modular routes, controllers, services, and repositories
- Database: PostgreSQL running locally via Docker Compose
- Security: JWT authentication with role-based access control
- AI: advisory only, layered over ERP records and business workflows

## Runtime layers

### Frontend
The frontend acts as the operational workspace for people, departments, carbon tracking, governance, reports, and alerts. It is designed to present business-ready KPIs and task flows rather than a research pipeline.

### Backend API
The backend hosts a FastAPI application that exposes role-aware endpoints for login, dashboard summaries, governance, reports, and AI guidance. It is intentionally modular so the ERP foundation can grow without becoming monolithic.

### Data layer
The application relies on PostgreSQL for master data, ESG transactions, audit records, notifications, and report metadata. The schema baseline is stored under the migrations folder and seeded for demo usage.

## Security model

The platform uses JWT tokens and an RBAC guard. Supported roles:
- admin
- manager
- employee
- auditor

This allows the app to separate operational control, department oversight, employee data entry, and auditor review.

## AI role

AI is kept secondary. It is used to provide recommendations based on existing ERP data so the platform remains grounded in recorded business activity instead of becoming a pure document intelligence product.

## Delivery principle

EcoSphere should feel like a lightweight ESG ERP suite for hackathon evaluation: local-first, role-aware, operational, and easy to explain in product terms.

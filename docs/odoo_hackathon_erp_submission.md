# EcoSphere — Odoo Hackathon 2026 Submission Brief

EcoSphere is the repository’s rewritten product identity: a local-first ERP-style ESG management platform designed to feel like a credible operational product for the Odoo Hackathon, not a research-only report-analysis demo.

## Product positioning

EcoSphere focuses on the business workflows that an ESG operations team needs every day:
- department and user governance
- carbon and operational ESG recording
- policy and compliance management
- audit workflows and issue ownership
- report generation and dashboard visibility
- lightweight AI advisory layered on top of the business data

## Why this submission fits

- The frontend already uses Next.js, TypeScript, Tailwind, and a dashboard-driven UI pattern.
- The backend already uses FastAPI and a modular route structure.
- PostgreSQL is the default local database runtime through Docker Compose.
- Authentication and RBAC are already defined for admin, manager, employee, and auditor roles.
- AI remains optional and supportive, rather than the center of the product.

## Reference docs

This submission is supported by the following documentation set:
- architecture.md — system architecture and deployment shape
- database.md — relational model and PostgreSQL schema
- api.md — endpoint map and role boundaries
- feature-mapping.md — module-to-business-flow alignment
- ui-screens.md — dashboard and workflow screens
- roadmap.md — implementation phases
- setup.md — runbook for local development
- legacy.md — historical notes preserved for traceability

## MVP flow

1. Admin or manager creates departments and users.
2. Employees log ESG actions and evidence.
3. The system aggregates carbon, governance, and performance metrics.
4. Auditors review issues and policy acknowledgements.
5. Dashboards and exports surface business status for stakeholders.
6. AI suggestions are advisory, not the main decision engine.

## Deliverable goal

The Odoo submission should read as an ergonomic, real-world ESG ERP product with strong local-data ownership, clean role separation, and a business-ready dashboard story.

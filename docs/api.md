# EcoSphere API Overview

The FastAPI backend exposes a lean local API for the EcoSphere frontend and hackathon demo.

## Authentication

`POST /api/auth/login`

Returns a JWT for seeded local users. Roles are `admin`, `manager`, `employee`, and `auditor`.

## Dashboard

`GET /api/dashboard/overview`

Returns ESG score, department scores, carbon trend data, notification count, active challenge count, and leaderboard entries.

## Departments

`GET /api/departments`

Returns department master data used by workflow and reporting screens.

## Carbon

`GET /api/carbon/summary`

Returns total emissions, scope 1/2/3 values, and target progress.

## Governance

`GET /api/governance/policies`

Returns active policy records and governance metadata for acknowledgements and audits.

## Notifications

`GET /api/notifications`

Returns operational alerts for policy, audit, carbon, and workflow reminders.

## Reports

`GET /api/reports/esg`

Returns report metadata and export format availability.

## AI Advisory

`POST /api/ai/advisor`

Reserved for lightweight ESG recommendations based on ERP records. This is not the primary workflow.

## Health

`GET /health`

Returns service status and version metadata.

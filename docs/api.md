# EcoSphere API Overview

The API is the operational gateway for the EcoSphere platform. It is intentionally lean and business-focused.

## Authentication

### POST /api/auth/login
Log in with a seeded local account and receive a JWT access token.

Roles supported by the foundation:
- admin
- manager
- employee
- auditor

## Dashboard endpoints

- GET /api/dashboard/overview
- Returns high-level ESG score, department scores, carbon trend, notifications, and active challenge data.

## Department endpoints

- GET /api/departments
- Returns department master data for the current organization structure.

## Carbon endpoints

- GET /api/carbon/summary
- Returns emissions totals and scope-based summary values.

## Governance endpoints

- GET /api/governance/policies
- Returns active policy records and governance metadata.

## Notifications and reports

- GET /api/notifications
- GET /api/reports/esg

These endpoints are intended to support day-to-day operational visibility and reporting.

## AI advisory endpoints

- POST /api/ai/advisor

This endpoint is treated as a lightweight advisory layer, not the central product workflow.

## Health check

- GET /health
- Returns a service status payload for the live FastAPI instance.

## Product expectation

The API should remain clear, secure, and role-aware. The product story is operational ERP behavior, not a heavy research-agent surface.

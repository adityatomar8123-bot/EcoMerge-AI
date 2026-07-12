# EcoSphere Database Guide

EcoSphere uses local PostgreSQL as the authoritative store for ERP-style ESG records.

## Local Database

- Host: `localhost`
- Port: `5432`
- Database: `ecosphere`
- User: `postgres`
- Password: `postgres`
- SQLAlchemy URL: `postgresql+psycopg2://postgres:postgres@localhost:5432/ecosphere`

Start it from the repository root:

```bash
docker compose up -d
```

## Core Tables

The baseline schema covers:

- departments
- users
- policies
- policy acknowledgements
- carbon entries
- audits
- compliance issues
- notifications
- reports
- badges
- rewards
- challenges
- challenge completions

## Schema Assets

- `backend/migrations/001_create_erp_schema.sql`
- `backend/seeds/seed_erp.py`

## Data Model Principle

ESG activity is treated as operational data. Departments own work, users act within roles, carbon entries capture environmental transactions, policies and audits capture governance controls, and rewards/challenges support employee engagement.

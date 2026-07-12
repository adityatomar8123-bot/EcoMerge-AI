# ERP Schema Migrations

Use the SQL file in this directory as the initial local PostgreSQL schema baseline for the EcoMerge ERP ESG platform.

## Apply schema

```bash
docker compose -f backend/docker-compose.yml up -d
psql postgresql://postgres:postgres@localhost:5432/ecomerge -f backend/migrations/001_create_erp_schema.sql
```

## Seed data

```bash
cd backend
python -m seeds.seed_erp
```

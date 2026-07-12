# EcoSphere Schema Migrations

Use the SQL file in this directory as the initial local PostgreSQL schema baseline for EcoSphere.

## Apply Schema

```bash
docker compose up -d
psql postgresql://postgres:postgres@localhost:5432/ecosphere -f backend/migrations/001_create_erp_schema.sql
```

## Seed Data

```bash
cd backend
python -m seeds.seed_erp
```

# EcoSphere Database Guide

EcoSphere uses PostgreSQL locally as the authoritative relational data store.

## Database strategy

- Local containerized PostgreSQL via Docker Compose
- SQLAlchemy ORM models for the backend foundation
- UUID primary keys for entity identity
- Role and department-based data ownership

## Core entities

The initial schema baseline supports the following business objects:
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

## Rationale

The schema is intentionally organized around ERP-style operational records:
- departments act as organizational units
- users hold business roles and accountability
- carbon entries represent environmental transactions
- policies and audits support governance control
- rewards and challenges enable engagement and motivation

## Startup command

```bash
docker compose -f backend/docker-compose.yml up -d
```

## Schema baseline

The current initial baseline is:
- backend/migrations/001_create_erp_schema.sql

## Seed data

A seed script creates the default role hierarchy and sample organization records:
- backend/seeds/seed_erp.py

## Local access

The default local PostgreSQL connection target is:
- host: localhost
- port: 5432
- database: ecomerge
- user: postgres
- password: postgres

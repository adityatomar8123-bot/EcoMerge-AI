# EcoSphere Frontend

Next.js frontend for the EcoSphere ESG Management Platform.

## Run

```bash
npm install
npm run dev
```

The app runs at http://localhost:3001.

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The dashboard reads from the local FastAPI API and falls back to demo data if the backend is offline.

## Included Surfaces

- login shell
- dashboard KPIs
- department performance
- carbon tracking
- CSR activity
- governance/compliance
- rewards
- reports
- notifications
- admin/RBAC settings

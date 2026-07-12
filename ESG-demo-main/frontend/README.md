# EcoSphere Frontend

This frontend shell is the user-facing ERP dashboard for EcoSphere. It presents a role-aware enterprise experience with KPI cards, tables, dashboards, and workflow screens for ESG operations.

## Product role

The frontend is not a RAG chat demo. It is the operational workspace for:
- people and department management
- carbon tracking
- governance and policy workflows
- compliance visibility
- notifications and rewards
- ESG report views and exports

## Local development

From the frontend folder:

```bash
npm install
npm run dev -- --port 3001
```

Open the app at:
- http://localhost:3001

## Expected stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Recharts and component-driven visual analytics

## Backend dependency

The frontend is expected to work with the FastAPI backend exposed at:
- http://localhost:8000

## Delivery goal

This UI layer should read like an ERP dashboard rather than a document-analysis or chatbot portal. It should support quick operational decisions and concise role-based views.

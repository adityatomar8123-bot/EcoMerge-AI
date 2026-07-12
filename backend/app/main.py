from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.ai import router as ai_router
from app.api.routes.auth import router as auth_router
from app.api.routes.carbon import router as carbon_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.department import router as department_router
from app.api.routes.governance import router as governance_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.reports import router as reports_router
from app.core.config import settings

app = FastAPI(title="EcoSphere ESG Management Platform", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(department_router, prefix="/api")
app.include_router(carbon_router, prefix="/api")
app.include_router(governance_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(ai_router, prefix="/api")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "EcoSphere ESG Management Platform",
        "version": "0.1.0",
    }

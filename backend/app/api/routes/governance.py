from fastapi import APIRouter

router = APIRouter(prefix="/governance", tags=["governance"])


@router.get("/policies")
def list_policies():
    return [
        {"id": "p1", "title": "ESG Code of Conduct", "version": "v1", "status": "active"},
        {"id": "p2", "title": "Carbon Reporting Standard", "version": "v1", "status": "active"},
    ]

from fastapi import APIRouter

router = APIRouter(prefix="/carbon", tags=["carbon"])


@router.get("/summary")
def carbon_summary():
    return {
        "total_kgco2e": 1280.5,
        "scope_1": 320.4,
        "scope_2": 410.8,
        "scope_3": 549.3,
        "target_progress": 74,
    }

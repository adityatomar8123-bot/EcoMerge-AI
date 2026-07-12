from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_dashboard_overview():
    return {
        "overall_esg_score": 81.4,
        "department_scores": [
            {"department": "Administration", "score": 84},
            {"department": "Operations", "score": 79},
            {"department": "People", "score": 86},
        ],
        "carbon_trend": [
            {"month": "Jan", "kgco2e": 420},
            {"month": "Feb", "kgco2e": 390},
            {"month": "Mar", "kgco2e": 360},
        ],
        "notifications": 4,
        "active_challenges": 3,
        "leaderboard": [
            {"name": "Ava", "xp": 950},
            {"name": "Noah", "xp": 830},
            {"name": "Liam", "xp": 780},
        ],
    }

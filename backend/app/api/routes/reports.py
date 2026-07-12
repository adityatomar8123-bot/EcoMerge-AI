from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/esg")
def get_esg_report():
    return {
        "report_type": "esg",
        "status": "ready",
        "download_formats": ["pdf", "csv", "excel"],
        "summary": "Overall ESG performance is stable with strong governance oversight.",
    }

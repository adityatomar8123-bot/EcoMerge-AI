from fastapi import APIRouter

router = APIRouter(prefix="/ai", tags=["ai"]) 


@router.post("/advisor")
def ai_advisor():
    return {
        "insight": "Reduce high-impact travel emissions by shifting to video-first review workflows.",
        "confidence": 0.84,
    }

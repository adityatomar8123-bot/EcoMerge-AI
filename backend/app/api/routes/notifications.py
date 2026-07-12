from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications():
    return [
        {"id": "n1", "type": "policy_reminder", "message": "Annual ESG policy acknowledgement due in 2 days", "is_read": False},
        {"id": "n2", "type": "compliance", "message": "Audit evidence pending for Operations", "is_read": False},
    ]

from fastapi import APIRouter

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("")
def list_departments():
    return [
        {"id": "1", "name": "Administration", "code": "ADM"},
        {"id": "2", "name": "Operations", "code": "OPS"},
        {"id": "3", "name": "People", "code": "HR"},
    ]

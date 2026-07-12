from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.erp_models import Notification, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()


@router.put("/{notif_id}/read")
def mark_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == UUID(notif_id)).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "success"}


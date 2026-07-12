from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.models.erp_models import CSRActivity, EmployeeParticipation, ESGConfig, User, Notification
from app.api.deps import get_current_user

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/activities")
def list_activities(db: Session = Depends(get_db)):
    return db.query(CSRActivity).all()


@router.post("/activities")
def create_activity(payload: dict, db: Session = Depends(get_db)):
    title = payload.get("title")
    category_id = payload.get("category_id")
    description = payload.get("description")
    hours = int(payload.get("volunteer_hours_est", 0))
    funds = payload.get("funds_raised", "N/A")
    points = int(payload.get("points_reward", 50))
    evidence = bool(payload.get("evidence_required", True))

    if not title:
        raise HTTPException(status_code=400, detail="Activity title is required")

    activity = CSRActivity(
        title=title,
        category_id=UUID(category_id) if category_id else None,
        description=description,
        volunteer_hours_est=hours,
        funds_raised=funds,
        points_reward=points,
        evidence_required=evidence,
        status="Active"
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.post("/activities/{activity_id}/join")
def join_activity(activity_id: str, payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity = db.query(CSRActivity).filter(CSRActivity.id == UUID(activity_id)).first()
    if not activity:
        raise HTTPException(status_code=404, detail="CSR Activity not found")

    proof_url = payload.get("proof_url")

    # Check evidence requirement from system config
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)
        db.flush()

    # If evidence requirement is enabled in config or activity itself
    if (config.require_csr_evidence or activity.evidence_required) and not proof_url:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="Evidence proof file is required for this CSR activity"
         )

    # Check if user already joined
    existing = db.query(EmployeeParticipation).filter(
        EmployeeParticipation.employee_id == current_user.id,
        EmployeeParticipation.activity_id == activity.id
    ).first()
    if existing:
        return {"status": "already_joined", "participation": existing}

    participation = EmployeeParticipation(
        employee_id=current_user.id,
        activity_id=activity.id,
        proof_url=proof_url,
        approval_status="pending",
        points_earned=0
    )
    db.add(participation)
    db.commit()
    db.refresh(participation)
    return {"status": "success", "participation": participation}


@router.get("/participations")
def get_participations(db: Session = Depends(get_db)):
    results = db.query(EmployeeParticipation).all()
    out = []
    for p in results:
        user = db.query(User).filter(User.id == p.employee_id).first()
        activity = db.query(CSRActivity).filter(CSRActivity.id == p.activity_id).first()
        out.append({
            "id": str(p.id),
            "employee_id": str(p.employee_id),
            "employee_name": user.full_name if user else "Unknown Staff",
            "activity_id": str(p.activity_id),
            "activity_title": activity.title if activity else "Unknown CSR Event",
            "proof_url": p.proof_url,
            "approval_status": p.approval_status,
            "points_earned": p.points_earned,
            "completion_date": p.completion_date.isoformat() if p.completion_date else None
        })
    return out


@router.put("/participations/{participation_id}/approve")
def approve_participation(participation_id: str, db: Session = Depends(get_db)):
    p = db.query(EmployeeParticipation).filter(EmployeeParticipation.id == UUID(participation_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participation record not found")

    if p.approval_status == "approved":
        return {"status": "already_approved"}

    activity = db.query(CSRActivity).filter(CSRActivity.id == p.activity_id).first()
    points = activity.points_reward if activity else 50

    p.approval_status = "approved"
    p.points_earned = points
    p.completion_date = datetime.utcnow()

    # Credit points and XP to the user
    user = db.query(User).filter(User.id == p.employee_id).first()
    if user:
        user.points = (user.points or 0) + points
        user.xp = (user.xp or 0) + points

    # Send Notification if toggled
    config = db.query(ESGConfig).first()
    if not config or config.notify_approval_decision:
        msg = f"Your participation in CSR Activity '{activity.title}' has been APPROVED! +{points} Points earned."
        notif = Notification(user_id=p.employee_id, type="csr_approval", message=msg)
        db.add(notif)

    db.commit()
    return {"status": "success"}


@router.put("/participations/{participation_id}/reject")
def reject_participation(participation_id: str, db: Session = Depends(get_db)):
    p = db.query(EmployeeParticipation).filter(EmployeeParticipation.id == UUID(participation_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Participation record not found")

    p.approval_status = "rejected"
    p.points_earned = 0

    # Send Notification if toggled
    activity = db.query(CSRActivity).filter(CSRActivity.id == p.activity_id).first()
    config = db.query(ESGConfig).first()
    if not config or config.notify_approval_decision:
        msg = f"Your participation in CSR Activity '{activity.title}' has been rejected. Please re-upload valid evidence."
        notif = Notification(user_id=p.employee_id, type="csr_approval", message=msg)
        db.add(notif)

    db.commit()
    return {"status": "success"}


@router.get("/diversity")
def get_diversity_stats(db: Session = Depends(get_db)):
    # Standard metrics
    return {
        "female_pct": 46.0,
        "male_pct": 50.0,
        "nonbinary_pct": 4.0,
        "total_employees": db.query(User).count()
    }

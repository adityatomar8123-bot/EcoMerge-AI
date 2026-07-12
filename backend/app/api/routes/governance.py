from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.erp_models import Policy, PolicyAcknowledgement, Audit, ComplianceIssue, ESGConfig, Notification, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/governance", tags=["governance"])


@router.get("/policies")
def list_policies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policies = db.query(Policy).all()
    out = []
    for p in policies:
        # Check if acknowledged by current user
        ack = db.query(PolicyAcknowledgement).filter(
            PolicyAcknowledgement.policy_id == p.id,
            PolicyAcknowledgement.user_id == current_user.id
        ).first()
        out.append({
            "id": str(p.id),
            "title": p.title,
            "category": p.category,
            "version": p.version,
            "status": p.status,
            "acknowledged": ack is not None,
            "acknowledged_at": ack.acknowledged_at.isoformat() if ack else None
        })
    return out


@router.post("/policies")
def create_policy(payload: dict, db: Session = Depends(get_db)):
    title = payload.get("title")
    category = payload.get("category", "governance")
    version = payload.get("version", "v1")
    status_val = payload.get("status", "draft")
    dept_id = payload.get("department_id")

    if not title:
        raise HTTPException(status_code=400, detail="Policy title is required")

    policy = Policy(
        title=title,
        category=category,
        version=version,
        status=status_val,
        department_id=UUID(dept_id) if dept_id else None
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.post("/policies/{policy_id}/acknowledge")
def acknowledge_policy(policy_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = db.query(Policy).filter(Policy.id == UUID(policy_id)).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    existing = db.query(PolicyAcknowledgement).filter(
        PolicyAcknowledgement.policy_id == policy.id,
        PolicyAcknowledgement.user_id == current_user.id
    ).first()
    if existing:
        return {"status": "already_acknowledged"}

    ack = PolicyAcknowledgement(
        user_id=current_user.id,
        policy_id=policy.id
    )
    db.add(ack)
    db.commit()
    return {"status": "success"}


@router.get("/audits")
def list_audits(db: Session = Depends(get_db)):
    audits = db.query(Audit).all()
    out = []
    for a in audits:
        auditor = db.query(User).filter(User.id == a.auditor_id).first()
        out.append({
            "id": str(a.id),
            "department_id": str(a.department_id),
            "auditor_name": auditor.full_name if auditor else "Auditor",
            "status": a.status,
            "score": float(a.score) if a.score else None,
            "notes": a.notes,
            "created_at": a.created_at.isoformat()
        })
    return out


@router.post("/audits")
def create_audit(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dept_id = payload.get("department_id")
    score = float(payload.get("score")) if payload.get("score") else None
    notes = payload.get("notes")
    status_val = payload.get("status", "open")

    if not dept_id:
        raise HTTPException(status_code=400, detail="Department ID is required")

    audit = Audit(
        department_id=UUID(dept_id),
        auditor_id=current_user.id,
        status=status_val,
        score=score,
        notes=notes
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


@router.get("/compliance")
def list_compliance_issues(db: Session = Depends(get_db)):
    issues = db.query(ComplianceIssue).all()
    
    # Check for overdue issues and flag them
    now = datetime.now(timezone.utc)
    out = []
    for issue in issues:
        is_overdue = False
        if issue.status == "open" and issue.due_date:
            # handle timezone aware comparisons
            due = issue.due_date
            if due.tzinfo is None:
                due = due.replace(tzinfo=timezone.utc)
            if now > due:
                is_overdue = True
        
        owner = db.query(User).filter(User.id == issue.owner_user_id).first()
        out.append({
            "id": str(issue.id),
            "department_id": str(issue.department_id),
            "title": issue.title,
            "severity": issue.severity,
            "status": issue.status,
            "evidence_required": issue.evidence_required,
            "due_date": issue.due_date.isoformat() if issue.due_date else None,
            "is_overdue": is_overdue,
            "owner_name": owner.full_name if owner else "Unassigned",
            "owner_email": owner.email if owner else ""
        })
    return out


@router.post("/compliance")
def create_compliance_issue(payload: dict, db: Session = Depends(get_db)):
    dept_id = payload.get("department_id")
    owner_email = payload.get("owner_email")
    title = payload.get("title")
    severity = payload.get("severity", "Medium")
    due_date_str = payload.get("due_date")

    if not dept_id or not owner_email or not title:
        raise HTTPException(status_code=400, detail="Missing required parameters")

    owner = db.query(User).filter(User.email == owner_email.lower()).first()
    if not owner:
         raise HTTPException(status_code=400, detail=f"Owner user with email {owner_email} not found")

    due_date = None
    if due_date_str:
        due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))

    issue = ComplianceIssue(
        department_id=UUID(dept_id),
        owner_user_id=owner.id,
        title=title,
        severity=severity,
        status="open",
        evidence_required=True,
        due_date=due_date
    )
    db.add(issue)
    db.flush()

    # Trigger notification to owner about new compliance issue
    config = db.query(ESGConfig).first()
    if not config or config.notify_compliance_issue:
        msg = f"A new compliance issue has been assigned to you: '{title}'. Due date: {due_date_str or 'N/A'}."
        notif = Notification(user_id=owner.id, type="compliance", message=msg)
        db.add(notif)

    db.commit()
    db.refresh(issue)
    return issue


@router.put("/compliance/{issue_id}/resolve")
def resolve_compliance_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(ComplianceIssue).filter(ComplianceIssue.id == UUID(issue_id)).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")

    issue.status = "resolved"
    db.commit()
    return {"status": "success"}

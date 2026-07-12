from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.erp_models import ESGConfig, Category

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/config")
def get_esg_config(db: Session = Depends(get_db)):
    config = db.query(ESGConfig).first()
    if not config:
        # Create default config if missing
        config = ESGConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.put("/config")
def update_esg_config(payload: dict, db: Session = Depends(get_db)):
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)

    if "org_name" in payload:
        config.org_name = payload["org_name"]
    if "env_weight" in payload:
        config.env_weight = float(payload["env_weight"])
    if "social_weight" in payload:
        config.social_weight = float(payload["social_weight"])
    if "gov_weight" in payload:
        config.gov_weight = float(payload["gov_weight"])
    if "enable_auto_emission" in payload:
        config.enable_auto_emission = bool(payload["enable_auto_emission"])
    if "require_csr_evidence" in payload:
        config.require_csr_evidence = bool(payload["require_csr_evidence"])
    if "enable_badge_auto_award" in payload:
        config.enable_badge_auto_award = bool(payload["enable_badge_auto_award"])
    if "notify_compliance_issue" in payload:
        config.notify_compliance_issue = bool(payload["notify_compliance_issue"])
    if "notify_approval_decision" in payload:
        config.notify_approval_decision = bool(payload["notify_approval_decision"])
    if "notify_policy_reminder" in payload:
        config.notify_policy_reminder = bool(payload["notify_policy_reminder"])
    if "notify_badge_unlock" in payload:
        config.notify_badge_unlock = bool(payload["notify_badge_unlock"])

    db.commit()
    db.refresh(config)
    return {"status": "success", "config": config}


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories


@router.post("/categories")
def create_category(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    type_val = payload.get("type")
    status_val = payload.get("status", "Active")

    if not name or not type_val:
        raise HTTPException(status_code=400, detail="Name and type are required")

    category = Category(name=name, type=type_val, status=status_val)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{cat_id}")
def delete_category(cat_id: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == UUID(cat_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"status": "success"}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID, uuid4
from datetime import datetime

from app.db.session import get_db
from app.models.erp_models import CarbonEntry, EmissionFactor, EnvironmentalGoal, ESGConfig, OperationalRecord, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/carbon", tags=["carbon"])


@router.get("/summary")
def carbon_summary(db: Session = Depends(get_db)):
    # Calculate totals from database
    total = db.query(func.sum(CarbonEntry.kgco2e)).scalar() or 0.0
    
    # We can assign scopes based on activity type mappings:
    # Scope 1 (Direct): Diesel Fuel, Fleet Petrol
    # Scope 2 (Indirect): Grid Electricity
    # Scope 3 (Supply Chain): Employee Commute, Office Paper, etc.
    scope_1 = db.query(func.sum(CarbonEntry.kgco2e)).filter(
        CarbonEntry.activity_type.in_(["Diesel Fuel", "Fleet Petrol"])
    ).scalar() or 0.0
    
    scope_2 = db.query(func.sum(CarbonEntry.kgco2e)).filter(
        CarbonEntry.activity_type == "Grid Electricity"
    ).scalar() or 0.0
    
    scope_3 = db.query(func.sum(CarbonEntry.kgco2e)).filter(
        ~CarbonEntry.activity_type.in_(["Diesel Fuel", "Fleet Petrol", "Grid Electricity"])
    ).scalar() or 0.0

    # Calculate goal target progress
    active_goals = db.query(EnvironmentalGoal).filter(EnvironmentalGoal.status != "Completed").all()
    if active_goals:
        # Average progress across active goals
        total_progress = 0.0
        for goal in active_goals:
            if goal.target_co2 > 0:
                # If target is reduction, progress is (current reduction / target reduction)
                pct = (float(goal.current_co2) / float(goal.target_co2)) * 100.0
                total_progress += min(100.0, max(0.0, pct))
        progress = round(total_progress / len(active_goals), 1)
    else:
        progress = 74.0 # default mock fallback

    return {
        "total_kgco2e": round(float(total), 1),
        "scope_1": round(float(scope_1), 1),
        "scope_2": round(float(scope_2), 1),
        "scope_3": round(float(scope_3), 1),
        "target_progress": progress,
    }


@router.get("/entries")
def get_carbon_entries(db: Session = Depends(get_db)):
    entries = db.query(CarbonEntry).order_by(CarbonEntry.created_at.desc()).all()
    return [
        {
            "id": str(e.id),
            "user_id": str(e.user_id),
            "department_id": str(e.department_id) if e.department_id else None,
            "activity_type": e.activity_type,
            "quantity": float(e.quantity),
            "unit": e.unit,
            "emission_factor": float(e.emission_factor),
            "kgco2e": float(e.kgco2e),
            "evidence_url": e.evidence_url,
            "created_at": e.created_at.isoformat(),
        }
        for e in entries
    ]


@router.post("/entries")
def create_carbon_entry(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity_type = payload.get("activity_type")
    quantity = float(payload.get("quantity", 0.0))
    unit = payload.get("unit", "")
    factor = float(payload.get("emission_factor", 0.0))
    evidence_url = payload.get("evidence_url")
    dept_id = payload.get("department_id") or str(current_user.department_id)

    if not activity_type or quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid activity description or quantity")

    kgco2e = quantity * factor

    entry = CarbonEntry(
        user_id=current_user.id,
        department_id=UUID(dept_id) if dept_id else None,
        activity_type=activity_type,
        quantity=quantity,
        unit=unit,
        emission_factor=factor,
        kgco2e=kgco2e,
        evidence_url=evidence_url
    )
    db.add(entry)

    # Check and update environmental goals progress if applicable
    if dept_id:
        goals = db.query(EnvironmentalGoal).filter(
            EnvironmentalGoal.department_id == UUID(dept_id),
            EnvironmentalGoal.status != "Completed"
        ).all()
        for goal in goals:
            # Accumulate current emissions towards the goal limit/threshold
            goal.current_co2 = float(goal.current_co2) + (kgco2e / 1000.0) # convert to tons if needed
            if goal.current_co2 >= goal.target_co2:
                goal.status = "Completed"

    db.commit()
    db.refresh(entry)

    try:
        from app.core.mail import send_carbon_entry_email
        send_carbon_entry_email(
            to_email=current_user.email,
            full_name=current_user.full_name,
            activity_type=entry.activity_type,
            quantity=float(entry.quantity),
            unit=entry.unit,
            kgco2e=float(entry.kgco2e)
        )
    except Exception as e:
        print(f"Error sending carbon entry email: {e}")

    return entry


@router.get("/factors")
def get_emission_factors(db: Session = Depends(get_db)):
    return db.query(EmissionFactor).all()


@router.post("/factors")
def create_emission_factor(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    activity_type = payload.get("activity_type")
    factor = float(payload.get("factor", 0.0))
    unit = payload.get("unit")

    if not name or not activity_type or factor <= 0:
        raise HTTPException(status_code=400, detail="Name, activity type and valid factor are required")

    ef = db.query(EmissionFactor).filter(EmissionFactor.activity_type == activity_type).first()
    if ef:
        ef.name = name
        ef.factor = factor
        ef.unit = unit
    else:
        ef = EmissionFactor(name=name, activity_type=activity_type, factor=factor, unit=unit)
        db.add(ef)
    
    db.commit()
    db.refresh(ef)
    return ef


@router.get("/goals")
def get_goals(db: Session = Depends(get_db)):
    return db.query(EnvironmentalGoal).all()


@router.post("/goals")
def create_goal(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    target_co2 = float(payload.get("target_co2", 0.0))
    deadline_str = payload.get("deadline")
    dept_id = payload.get("department_id")

    if not name or target_co2 <= 0 or not deadline_str:
        raise HTTPException(status_code=400, detail="Missing required goal attributes")

    goal = EnvironmentalGoal(
        name=name,
        target_co2=target_co2,
        current_co2=0.0,
        deadline=datetime.fromisoformat(deadline_str.replace("Z", "+00:00")),
        status="Active",
        department_id=UUID(dept_id) if dept_id else None
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.post("/operations")
def log_operational_record(payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    op_type = payload.get("type") # purchase, manufacturing, expense, fleet
    description = payload.get("description")
    quantity = float(payload.get("quantity", 0.0))
    unit = payload.get("unit")
    cost = float(payload.get("cost")) if payload.get("cost") else None
    dept_id = payload.get("department_id") or str(current_user.department_id)

    if not op_type or not description or quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid operational entry parameters")

    op_record = OperationalRecord(
        type=op_type,
        description=description,
        department_id=UUID(dept_id),
        quantity=quantity,
        unit=unit,
        cost=cost
    )
    db.add(op_record)
    db.flush()

    # Retrieve settings configuration
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)
        db.flush()

    # Auto emission calculation trigger
    if config.enable_auto_emission:
        # Match emission factor based on type or description keywords
        # Try to find factor with activity_type containing description or matching type
        activity_map = {
            "purchase": "Grid Electricity",
            "fleet": "Fleet Petrol",
            "expense": "Office Paper",
            "manufacturing": "Diesel Fuel"
        }
        target_activity = activity_map.get(op_type, "Grid Electricity")
        factor_obj = db.query(EmissionFactor).filter(EmissionFactor.activity_type == target_activity).first()
        
        if factor_obj:
            kgco2e = quantity * float(factor_obj.factor)
            carbon_entry = CarbonEntry(
                user_id=current_user.id,
                department_id=UUID(dept_id),
                activity_type=factor_obj.activity_type,
                quantity=quantity,
                unit=unit,
                emission_factor=factor_obj.factor,
                kgco2e=kgco2e,
                operational_record_id=op_record.id
            )
            db.add(carbon_entry)

    db.commit()
    db.refresh(op_record)
    return {"status": "success", "operation": op_record}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.erp_models import Department

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("")
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "code": d.code,
            "head": d.head,
            "employee_count": d.employee_count,
            "status": d.status,
        }
        for d in depts
    ]


@router.post("")
def create_department(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    code = payload.get("code")
    head = payload.get("head", "")
    employee_count = int(payload.get("employee_count", 0))
    status_val = payload.get("status", "Active")
    parent_id = payload.get("parent_department_id")

    if not name or not code:
        raise HTTPException(status_code=400, detail="Name and code are required")

    existing = db.query(Department).filter((Department.name == name) | (Department.code == code)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")

    dept = Department(
        name=name,
        code=code,
        head=head,
        employee_count=employee_count,
        status=status_val,
        parent_department_id=UUID(parent_id) if parent_id else None
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"status": "success", "department": {"id": str(dept.id), "name": dept.name}}


@router.put("/{dept_id}")
def update_department(dept_id: str, payload: dict, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == UUID(dept_id)).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    if "name" in payload:
        dept.name = payload["name"]
    if "code" in payload:
        dept.code = payload["code"]
    if "head" in payload:
        dept.head = payload["head"]
    if "employee_count" in payload:
        dept.employee_count = int(payload["employee_count"])
    if "status" in payload:
        dept.status = payload["status"]

    db.commit()
    return {"status": "success"}


@router.delete("/{dept_id}")
def delete_department(dept_id: str, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == UUID(dept_id)).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    db.delete(dept)
    db.commit()
    return {"status": "success"}


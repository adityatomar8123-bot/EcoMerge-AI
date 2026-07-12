from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.models.erp_models import (
    CarbonEntry,
    CSRActivity,
    EmployeeParticipation,
    Policy,
    ComplianceIssue,
    Audit,
    User,
    ChallengeCompletion
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/esg")
def get_esg_report(db: Session = Depends(get_db)):
    # Calculate key metrics from DB to present a summary
    carbon_total = db.query(func.sum(CarbonEntry.kgco2e)).scalar() or 0.0
    csr_count = db.query(CSRActivity).count()
    completed_challenges = db.query(ChallengeCompletion).count()
    policy_count = db.query(Policy).count()
    open_issues = db.query(ComplianceIssue).filter(ComplianceIssue.status == "open").count()

    summary_text = (
        f"EcoSphere ESG Index stands at 81.4. Cumulative emissions are {carbon_total:.1f} kgCO2e. "
        f"There are {csr_count} active CSR activities with {completed_challenges} employee challenges completed. "
        f"Governance has {policy_count} active policies with {open_issues} unresolved compliance issues."
    )

    return {
        "report_type": "esg",
        "status": "ready",
        "download_formats": ["pdf", "csv", "excel"],
        "summary": summary_text,
        "metrics": {
            "carbon_total": float(carbon_total),
            "csr_activities": csr_count,
            "completed_challenges": completed_challenges,
            "policies": policy_count,
            "open_compliance_issues": open_issues
        }
    }


@router.get("/environmental")
def get_environmental_report(db: Session = Depends(get_db)):
    entries = db.query(CarbonEntry).all()
    # Group by activity type
    by_activity = {}
    for e in entries:
        by_activity[e.activity_type] = by_activity.get(e.activity_type, 0.0) + float(e.kgco2e)
    
    return {
        "total_emissions": float(sum(by_activity.values())),
        "by_activity": by_activity,
        "entry_count": len(entries)
    }


@router.get("/social")
def get_social_report(db: Session = Depends(get_db)):
    participations = db.query(EmployeeParticipation).filter(
        EmployeeParticipation.approval_status == "approved"
    ).all()
    total_hours = sum(p.points_earned for p in participations) / 10.0 # simple mock mapping: 10 points per hour
    
    return {
        "volunteer_hours": total_hours,
        "csr_participation_count": len(participations),
        "diversity": {
            "female": 46.0,
            "male": 50.0,
            "nonbinary": 4.0
        }
    }


@router.get("/governance")
def get_governance_report(db: Session = Depends(get_db)):
    policies = db.query(Policy).count()
    audits = db.query(Audit).all()
    avg_audit_score = db.query(func.avg(Audit.score)).scalar() or 0.0
    issues = db.query(ComplianceIssue).all()
    
    issues_by_severity = {"High": 0, "Medium": 0, "Low": 0}
    for issue in issues:
        sev = issue.severity
        if sev in issues_by_severity:
            issues_by_severity[sev] += 1
            
    return {
        "policies_count": policies,
        "average_audit_score": float(avg_audit_score),
        "issues_by_severity": issues_by_severity,
        "total_compliance_issues": len(issues)
    }


@router.post("/custom")
def build_custom_report(filters: dict, db: Session = Depends(get_db)):
    # Custom report builder filters: Department, Date Range, Module, Employee, Challenge, ESG Category
    dept_id = filters.get("department_id")
    date_start = filters.get("date_start")
    date_end = filters.get("date_end")
    module = filters.get("module")  # "environmental", "social", "governance"
    employee_id = filters.get("employee_id")

    results = []

    # Compile data based on module filter
    if not module or module == "environmental":
        query = db.query(CarbonEntry)
        if dept_id:
            query = query.filter(CarbonEntry.department_id == UUID(dept_id))
        if employee_id:
            query = query.filter(CarbonEntry.user_id == UUID(employee_id))
        if date_start:
            query = query.filter(CarbonEntry.created_at >= datetime.fromisoformat(date_start))
        if date_end:
            query = query.filter(CarbonEntry.created_at <= datetime.fromisoformat(date_end))
        
        for e in query.all():
            results.append({
                "module": "environmental",
                "type": e.activity_type,
                "detail": f"{e.quantity} {e.unit} logged by user",
                "impact": f"{e.kgco2e} kgCO2e",
                "date": e.created_at.isoformat()
            })

    if not module or module == "social":
        query = db.query(EmployeeParticipation)
        if employee_id:
            query = query.filter(EmployeeParticipation.employee_id == UUID(employee_id))
        if date_start:
            query = query.filter(EmployeeParticipation.created_at >= datetime.fromisoformat(date_start))
        if date_end:
            query = query.filter(EmployeeParticipation.created_at <= datetime.fromisoformat(date_end))
            
        for p in query.all():
            user = db.query(User).filter(User.id == p.employee_id).first()
            activity = db.query(CSRActivity).filter(CSRActivity.id == p.activity_id).first()
            if dept_id and user and str(user.department_id) != dept_id:
                continue
            
            results.append({
                "module": "social",
                "type": "CSR Participation",
                "detail": f"{user.full_name if user else 'Staff'} joined '{activity.title if activity else 'CSR Activity'}'",
                "impact": f"+{p.points_earned} XP",
                "date": p.created_at.isoformat()
            })

    if not module or module == "governance":
        query = db.query(ComplianceIssue)
        if dept_id:
            query = query.filter(ComplianceIssue.department_id == UUID(dept_id))
        if employee_id:
            query = query.filter(ComplianceIssue.owner_user_id == UUID(employee_id))
        if date_start:
            query = query.filter(ComplianceIssue.created_at >= datetime.fromisoformat(date_start))
        if date_end:
            query = query.filter(ComplianceIssue.created_at <= datetime.fromisoformat(date_end))
            
        for issue in query.all():
            owner = db.query(User).filter(User.id == issue.owner_user_id).first()
            results.append({
                "module": "governance",
                "type": "Compliance Issue",
                "detail": f"[{issue.severity}] '{issue.title}' assigned to {owner.full_name if owner else 'Unassigned'}",
                "impact": f"Status: {issue.status}",
                "date": issue.created_at.isoformat()
            })

    return {
        "status": "success",
        "filter_summary": filters,
        "count": len(results),
        "records": results
    }

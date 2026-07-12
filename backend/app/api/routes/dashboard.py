from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import calendar

from app.db.session import get_db
from app.models.erp_models import (
    Department,
    DepartmentScore,
    CarbonEntry,
    Challenge,
    Notification,
    User,
    ESGConfig
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview")
def get_dashboard_overview(
    time_range: str = Query("6M", alias="range"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Active challenges
    active_challenges = db.query(Challenge).filter(Challenge.status == "active").count()

    # 2. Pending alerts for the user
    unread_notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    # 3. Leaderboard
    leaderboard_users = db.query(User).order_by(User.xp.desc()).limit(3).all()
    leaderboard = [
        {"name": u.full_name.split(" ")[0], "xp": u.xp}
        for u in leaderboard_users
    ]
    while len(leaderboard) < 3:
        leaderboard.append({"name": "Ava", "xp": 100})

    # 4. Department scores
    dept_scores_query = db.query(DepartmentScore).all()
    department_scores = []
    for ds in dept_scores_query:
        dept = db.query(Department).filter(Department.id == ds.department_id).first()
        if dept:
            department_scores.append({
                "department": dept.name,
                "score": float(ds.total_score)
            })

    if not department_scores:
        department_scores = [
            {"department": "Administration", "score": 84.0},
            {"department": "Operations", "score": 79.0},
            {"department": "People", "score": 86.0}
        ]

    # Calculate overall ESG score
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)
        db.flush()

    total_dept_score = sum(d["score"] for d in department_scores)
    overall_esg_score = round(total_dept_score / len(department_scores), 1) if department_scores else 81.4

    # 5. Carbon trend — grouped by the requested time window
    now = datetime.utcnow()

    if time_range == "1W":
        start_date = now - timedelta(days=7)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        daily_data = {}
        for i in range(6, -1, -1):
            target_day = now - timedelta(days=i)
            daily_data[target_day.strftime("%a")] = 0.0
        for e in entries:
            key = e.created_at.strftime("%a")
            if key in daily_data:
                daily_data[key] += float(e.kgco2e)
        carbon_trend = [{"month": k, "kgco2e": round(v, 1)} for k, v in daily_data.items()]

    elif time_range == "1M":
        start_date = now - timedelta(days=30)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        weekly_data = {}
        for i in range(3, -1, -1):
            weekly_data[f"Wk {4-i}"] = 0.0
        for e in entries:
            age_days = (now - e.created_at).days
            week_idx = min(3, age_days // 7)
            key = f"Wk {4-week_idx}"
            if key in weekly_data:
                weekly_data[key] += float(e.kgco2e)
        carbon_trend = [{"month": k, "kgco2e": round(v, 1)} for k, v in weekly_data.items()]

    elif time_range == "1Y":
        start_date = now - timedelta(days=365)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        monthly_data = {}
        for i in range(11, -1, -1):
            target_month = now - timedelta(days=i * 30)
            monthly_data[calendar.month_name[target_month.month][:3]] = 0.0
        for e in entries:
            key = calendar.month_name[e.created_at.month][:3]
            if key in monthly_data:
                monthly_data[key] += float(e.kgco2e)
        carbon_trend = [{"month": k, "kgco2e": round(v, 1)} for k, v in monthly_data.items()]

    else:  # Default 6M
        start_date = now - timedelta(days=180)
        entries = db.query(CarbonEntry).filter(CarbonEntry.created_at >= start_date).all()
        monthly_data = {}
        for i in range(5, -1, -1):
            target_month = now - timedelta(days=i * 30)
            monthly_data[calendar.month_name[target_month.month][:3]] = 0.0
        for e in entries:
            key = calendar.month_name[e.created_at.month][:3]
            if key in monthly_data:
                monthly_data[key] += float(e.kgco2e)
        carbon_trend = [{"month": k, "kgco2e": round(v, 1)} for k, v in monthly_data.items()]

    return {
        "overall_esg_score": overall_esg_score,
        "department_scores": department_scores,
        "carbon_trend": carbon_trend,
        "notifications": unread_notifs,
        "active_challenges": active_challenges,
        "leaderboard": leaderboard
    }

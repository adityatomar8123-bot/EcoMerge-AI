from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.models.erp_models import (
    Challenge,
    ChallengeParticipation,
    ChallengeCompletion,
    Badge,
    Reward,
    User,
    ESGConfig,
    Notification
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/stats")
def get_gamification_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate level (e.g. 1 level per 300 XP)
    xp = current_user.xp or 0
    level = (xp // 300) + 1
    
    # Check next unlock badge
    next_badge = db.query(Badge).filter(Badge.xp_threshold > xp).order_by(Badge.xp_threshold.asc()).first()
    next_badge_threshold = next_badge.xp_threshold if next_badge else 1500
    
    return {
        "xp": xp,
        "level": level,
        "points": current_user.points or 0,
        "next_badge_threshold": next_badge_threshold
    }


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.xp.desc()).limit(10).all()
    return [
        {
            "name": u.full_name,
            "xp": u.xp,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


@router.get("/challenges")
def list_challenges(db: Session = Depends(get_db)):
    return db.query(Challenge).all()


@router.post("/challenges")
def create_challenge(payload: dict, db: Session = Depends(get_db)):
    title = payload.get("title")
    category_id = payload.get("category_id")
    description = payload.get("description")
    xp_reward = int(payload.get("xp_reward", 100))
    difficulty = payload.get("difficulty", "Medium")
    evidence_required = bool(payload.get("evidence_required", True))
    deadline_str = payload.get("deadline")

    if not title:
        raise HTTPException(status_code=400, detail="Challenge title is required")

    deadline = None
    if deadline_str:
        deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))

    challenge = Challenge(
        title=title,
        category_id=UUID(category_id) if category_id else None,
        description=description,
        xp_reward=xp_reward,
        difficulty=difficulty,
        evidence_required=evidence_required,
        deadline=deadline,
        status="draft"
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.put("/challenges/{challenge_id}/status")
def update_challenge_status(challenge_id: str, payload: dict, db: Session = Depends(get_db)):
    status_val = payload.get("status")
    if status_val not in ["draft", "active", "under_review", "completed", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    challenge = db.query(Challenge).filter(Challenge.id == UUID(challenge_id)).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    challenge.status = status_val
    db.commit()
    return {"status": "success", "challenge_status": challenge.status}


@router.post("/challenges/{challenge_id}/join")
def join_challenge(challenge_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    challenge = db.query(Challenge).filter(Challenge.id == UUID(challenge_id)).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    existing = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == challenge.id,
        ChallengeParticipation.employee_id == current_user.id
    ).first()
    if existing:
        return {"status": "already_participating"}

    part = ChallengeParticipation(
        challenge_id=challenge.id,
        employee_id=current_user.id,
        progress=0.0,
        approval_status="pending",
        xp_awarded=0
    )
    db.add(part)
    db.commit()
    return {"status": "success", "participation": part}


@router.post("/challenges/{challenge_id}/complete")
def complete_challenge(challenge_id: str, payload: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    challenge = db.query(Challenge).filter(Challenge.id == UUID(challenge_id)).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    proof_url = payload.get("proof_url")

    # Verify participation
    part = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == challenge.id,
        ChallengeParticipation.employee_id == current_user.id
    ).first()
    if not part:
        part = ChallengeParticipation(
            challenge_id=challenge.id,
            employee_id=current_user.id,
            progress=100.0,
            proof_url=proof_url,
            approval_status="approved",
            xp_awarded=challenge.xp_reward
        )
        db.add(part)
    else:
        part.progress = 100.0
        part.proof_url = proof_url
        part.approval_status = "approved"
        part.xp_awarded = challenge.xp_reward

    # Record completion
    comp = ChallengeCompletion(
        user_id=current_user.id,
        challenge_id=challenge.id,
        status="completed"
    )
    db.add(comp)

    # Award XP and Points
    xp_gained = challenge.xp_reward
    current_user.xp = (current_user.xp or 0) + xp_gained
    current_user.points = (current_user.points or 0) + xp_gained

    # Check Settings Config for Auto-Badge Awarding
    config = db.query(ESGConfig).first()
    if not config:
        config = ESGConfig()
        db.add(config)
        db.flush()

    unlocked_badges = []
    if config.enable_badge_auto_award:
        # Check all badges that the user doesn't already have
        all_badges = db.query(Badge).all()
        # Find user's completed challenges count
        completed_count = db.query(ChallengeCompletion).filter(ChallengeCompletion.user_id == current_user.id).count()
        
        for badge in all_badges:
            # Check unlock rules: e.g. "xp >= 100" or "challenges >= 5"
            rule = badge.unlock_rule or ""
            qualified = False
            if "xp >=" in rule:
                threshold = int(rule.split(">=")[1].strip())
                if current_user.xp >= threshold:
                    qualified = True
            elif "challenges >=" in rule:
                threshold = int(rule.split(">=")[1].strip())
                if completed_count >= threshold:
                    qualified = True
            else:
                # Default fallback threshold check
                if current_user.xp >= badge.xp_threshold:
                    qualified = True

            if qualified:
                # Send notification if new badge unlock
                msg = f"Congratulations! You've unlocked the badge: {badge.icon} {badge.name}!"
                notif = Notification(user_id=current_user.id, type="badge_unlock", message=msg)
                db.add(notif)
                unlocked_badges.append(badge.name)

    db.commit()
    return {
        "status": "success",
        "xp_awarded": xp_gained,
        "total_xp": current_user.xp,
        "new_badges": unlocked_badges
    }


@router.get("/badges")
def list_badges(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    badges = db.query(Badge).all()
    # Check completed challenges
    completed_count = db.query(ChallengeCompletion).filter(ChallengeCompletion.user_id == current_user.id).count()
    
    out = []
    for b in badges:
        rule = b.unlock_rule or ""
        unlocked = False
        if "xp >=" in rule:
            threshold = int(rule.split(">=")[1].strip())
            if current_user.xp >= threshold:
                unlocked = True
        elif "challenges >=" in rule:
            threshold = int(rule.split(">=")[1].strip())
            if completed_count >= threshold:
                unlocked = True
        else:
            if current_user.xp >= b.xp_threshold:
                unlocked = True
                
        out.append({
            "id": str(b.id),
            "code": b.code,
            "name": b.name,
            "description": b.description,
            "xp_threshold": b.xp_threshold,
            "icon": b.icon,
            "unlocked": unlocked
        })
    return out


@router.get("/rewards")
def get_rewards(db: Session = Depends(get_db)):
    return db.query(Reward).all()


@router.post("/rewards/{reward_id}/redeem")
def redeem_reward(reward_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reward = db.query(Reward).filter(Reward.id == UUID(reward_id)).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward catalog item not found")

    if reward.stock <= 0:
        raise HTTPException(status_code=400, detail="Reward item is out of stock")

    if current_user.points < reward.xp_cost:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Required: {reward.xp_cost}, Current: {current_user.points}"
        )

    # Deduct points/XP balance and stock
    current_user.points = current_user.points - reward.xp_cost
    reward.stock = reward.stock - 1

    # Send Notification if enabled
    config = db.query(ESGConfig).first()
    if not config or config.notify_badge_unlock: # default channel
        msg = f"You redeemed reward '{reward.title}' for {reward.xp_cost} points. Code sent to email."
        notif = Notification(user_id=current_user.id, type="reward_redemption", message=msg)
        db.add(notif)

    db.commit()
    return {
        "status": "success",
        "current_points": current_user.points,
        "reward_title": reward.title,
        "stock_remaining": reward.stock
    }

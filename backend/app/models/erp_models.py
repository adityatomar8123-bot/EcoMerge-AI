from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    code: Mapped[str] = mapped_column(String(60), nullable=False, unique=True)
    parent_department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    head: Mapped[str | None] = mapped_column(String(120), nullable=True)
    employee_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    parent = relationship("Department", remote_side="Department.id", backref="children")
    users = relationship("User", back_populates="department")


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    xp: Mapped[int] = mapped_column(Integer, default=0)
    points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    department = relationship("Department", back_populates="users")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)  # "csr" or "challenge"
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    factor: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ProductESGProfile(Base):
    __tablename__ = "product_esg_profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    carbon_footprint: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)  # kgCO2e per unit
    recycled_content_pct: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    supply_chain_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class EnvironmentalGoal(Base):
    __tablename__ = "environmental_goals"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    target_co2: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    current_co2: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False, default=0.0)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")  # Active, On Track, Completed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class PolicyAcknowledgement(Base):
    __tablename__ = "policy_acknowledgements"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    policy_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("policies.id"), nullable=False)
    acknowledged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CarbonEntry(Base):
    __tablename__ = "carbon_entries"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    activity_type: Mapped[str] = mapped_column(String(120), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    emission_factor: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    kgco2e: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    evidence_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    operational_record_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("operational_records.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CSRActivity(Base):
    __tablename__ = "csr_activities"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    category_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    volunteer_hours_est: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    funds_raised: Mapped[str] = mapped_column(String(64), nullable=False, default="N/A")
    points_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class EmployeeParticipation(Base):
    __tablename__ = "employee_participations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    activity_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("csr_activities.id"), nullable=False)
    proof_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")  # pending, approved, rejected
    points_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completion_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    category_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False, default="Medium")  # Easy, Medium, Hard
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")  # draft, active, under_review, completed, archived
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    challenge_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    employee_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    progress: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0)
    proof_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approval_status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")  # pending, approved, rejected
    xp_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ChallengeCompletion(Base):
    __tablename__ = "challenge_completions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="completed")
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Audit(Base):
    __tablename__ = "audits"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    auditor_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="open")
    score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    owner_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="open")
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    report_type: Mapped[str] = mapped_column(String(48), nullable=False)
    format: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="generated")
    department_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    generated_by_user_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    storage_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), default="")
    unlock_rule: Mapped[str] = mapped_column(String(255), default="xp >= 100")
    icon: Mapped[str] = mapped_column(String(32), default="🌱")
    xp_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(String(255), default="")
    xp_cost: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(32), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class DepartmentScore(Base):
    __tablename__ = "department_scores"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    environmental_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0)
    social_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0)
    governance_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0)
    total_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ESGConfig(Base):
    __tablename__ = "esg_configs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    org_name: Mapped[str] = mapped_column(String(120), default="EcoSphere Corp")
    env_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=40.0)
    social_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=30.0)
    gov_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=30.0)
    enable_auto_emission: Mapped[bool] = mapped_column(Boolean, default=True)
    require_csr_evidence: Mapped[bool] = mapped_column(Boolean, default=True)
    enable_badge_auto_award: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_compliance_issue: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_approval_decision: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_policy_reminder: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_badge_unlock: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class OperationalRecord(Base):
    __tablename__ = "operational_records"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    type: Mapped[str] = mapped_column(String(64), nullable=False)  # purchase, manufacturing, expense, fleet
    description: Mapped[str] = mapped_column(String(160), nullable=False)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    cost: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

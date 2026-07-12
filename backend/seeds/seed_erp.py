from datetime import datetime, timedelta
from uuid import uuid4

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.erp_models import (
    Audit,
    Badge,
    CarbonEntry,
    Category,
    Challenge,
    ChallengeCompletion,
    ChallengeParticipation,
    ComplianceIssue,
    CSRActivity,
    Department,
    DepartmentScore,
    EmployeeParticipation,
    ESGConfig,
    EmissionFactor,
    EnvironmentalGoal,
    OperationalRecord,
    Policy,
    PolicyAcknowledgement,
    ProductESGProfile,
    Reward,
    User,
)


def seed() -> None:
    # Build schema
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    # Clear existing data to avoid constraint issues during development
    # (Since it's local development, delete in reverse order of dependencies)
    for model in [
        ESGConfig, DepartmentScore, ChallengeCompletion, ChallengeParticipation,
        EmployeeParticipation, CarbonEntry, PolicyAcknowledgement, ComplianceIssue,
        Audit, Policy, Challenge, Reward, Badge, ProductESGProfile,
        EmissionFactor, CSRActivity, Category, User, Department, OperationalRecord
    ]:
        try:
            session.query(model).delete()
        except Exception:
            session.rollback()

    # 1. Departments
    departments = [
        Department(name="Administration", code="ADM", head="Alice Johnson", employee_count=10, status="Active"),
        Department(name="Operations", code="OPS", head="Bob Smith", employee_count=45, status="Active"),
        Department(name="People / HR", code="HR", head="Charlie Brown", employee_count=5, status="Active"),
        Department(name="Logistics", code="LOG", head="David Davis", employee_count=20, status="Active"),
    ]
    session.add_all(departments)
    session.flush()

    # 2. Users
    # Store plain passwords or hashed? In auth_service.py it checks against user["password"] == password,
    # and password_hash in DB is matched directly or via passlib. Let's make sure they align!
    users = [
        User(
            email="admin@ecosphere.local",
            password_hash="admin123",  # plaintext since AuthService checks it directly
            role="admin",
            full_name="Admin User",
            department_id=departments[0].id,
            xp=100,
            points=100,
        ),
        User(
            email="manager@ecosphere.local",
            password_hash="manager123",
            role="manager",
            full_name="Manager User",
            department_id=departments[1].id,
            xp=250,
            points=250,
        ),
        User(
            email="employee@ecosphere.local",
            password_hash="employee123",
            role="employee",
            full_name="Employee User",
            department_id=departments[1].id,
            xp=450,
            points=450,
        ),
        User(
            email="auditor@ecosphere.local",
            password_hash="auditor123",
            role="auditor",
            full_name="Auditor User",
            department_id=departments[2].id,
            xp=50,
            points=50,
        ),
    ]
    session.add_all(users)
    session.flush()

    # 3. Categories
    categories = [
        Category(name="Community Outreach", type="csr", status="Active"),
        Category(name="Environmental Stewardship", type="csr", status="Active"),
        Category(name="Health & Well-being", type="csr", status="Active"),
        Category(name="ESG Literacy", type="challenge", status="Active"),
        Category(name="Active Commuting", type="challenge", status="Active"),
    ]
    session.add_all(categories)
    session.flush()

    # 4. Emission Factors
    factors = [
        EmissionFactor(name="Electricity Grid", activity_type="Grid Electricity", factor=0.850, unit="kWh"),
        EmissionFactor(name="Diesel Generator", activity_type="Diesel Fuel", factor=2.680, unit="litres"),
        EmissionFactor(name="Petrol Vehicle", activity_type="Fleet Petrol", factor=2.310, unit="litres"),
        EmissionFactor(name="Employee Commuting", activity_type="Employee Commute", factor=0.180, unit="km"),
        EmissionFactor(name="Standard Office Paper", activity_type="Office Paper", factor=0.950, unit="kg"),
    ]
    session.add_all(factors)
    session.flush()

    # 5. Product ESG Profiles
    products = [
        ProductESGProfile(name="Bamboo Coffee Mug", carbon_footprint=0.120, recycled_content_pct=85.0, supply_chain_score=92.0),
        ProductESGProfile(name="Recycled Paper Notebook", carbon_footprint=0.080, recycled_content_pct=100.0, supply_chain_score=95.0),
        ProductESGProfile(name="Organic Cotton Tote Bag", carbon_footprint=0.450, recycled_content_pct=10.0, supply_chain_score=88.0),
    ]
    session.add_all(products)
    session.flush()

    # 6. Environmental Goals
    goals = [
        EnvironmentalGoal(
            name="Reduce Fleet Emissions",
            department_id=departments[3].id,  # Logistics
            target_co2=500.0,
            current_co2=390.0,
            deadline=datetime.utcnow() + timedelta(days=90),
            status="Active",
        ),
        EnvironmentalGoal(
            name="Cut Packaging Waste",
            department_id=departments[1].id,  # Operations
            target_co2=120.0,
            current_co2=98.0,
            deadline=datetime.utcnow() + timedelta(days=120),
            status="On Track",
        ),
        EnvironmentalGoal(
            name="Office Energy Cut",
            department_id=departments[0].id,  # Admin
            target_co2=80.0,
            current_co2=80.0,
            deadline=datetime.utcnow() - timedelta(days=5),
            status="Completed",
        ),
    ]
    session.add_all(goals)
    session.flush()

    # 7. Policies
    policies = [
        Policy(title="ESG Code of Conduct", category="governance", version="v1", status="active", department_id=departments[0].id),
        Policy(title="Carbon Reporting Standard", category="environmental", version="v1", status="active", department_id=departments[1].id),
        Policy(title="Anti-Corruption Policy", category="governance", version="v2", status="active", department_id=departments[0].id),
    ]
    session.add_all(policies)
    session.flush()

    # 8. Badges
    badges = [
        Badge(code="green_starter", name="Green Starter", description="Get started with environmental ESG tracking", xp_threshold=50, icon="🌱"),
        Badge(code="carbon_zero_hero", name="Carbon Zero Hero", description="Log first carbon scope reduction entry", xp_threshold=100, icon="💚"),
        Badge(code="compliance_champion", name="Compliance Champion", description="Acknowledge all policies and audits", xp_threshold=300, icon="📜"),
        Badge(code="outreach_catalyst", name="Outreach Catalyst", description="Volunteer 10+ hours in CSR activities", xp_threshold=600, icon="🤝"),
    ]
    session.add_all(badges)
    session.flush()

    # 9. Rewards
    rewards = [
        Reward(title="Eco Gift Card", description="Redeemable at eco-friendly retailers", xp_cost=150, stock=20, status="Active"),
        Reward(title="Premium Eco Flask", description="Double-walled stainless steel flask", xp_cost=300, stock=15, status="Active"),
        Reward(title="1-Month Transit Pass", description="Public transportation subsidy card", xp_cost=500, stock=5, status="Active"),
    ]
    session.add_all(rewards)
    session.flush()

    # 10. Challenges
    challenges = [
        Challenge(
            title="Zero Waste Week",
            category_id=categories[3].id,
            description="Achieve single-use plastic free operation for an entire week.",
            xp_reward=100,
            difficulty="Medium",
            evidence_required=True,
            deadline=datetime.utcnow() + timedelta(days=14),
            status="active",
        ),
        Challenge(
            title="ESG Policy Literacy",
            category_id=categories[3].id,
            description="Complete Q3 compliance training and policy review.",
            xp_reward=150,
            difficulty="Easy",
            evidence_required=False,
            deadline=datetime.utcnow() + timedelta(days=30),
            status="active",
        ),
        Challenge(
            title="Green Commute Challenge",
            category_id=categories[4].id,
            description="Walk, cycle, or take public transit to work for 5 days.",
            xp_reward=200,
            difficulty="Hard",
            evidence_required=True,
            deadline=datetime.utcnow() + timedelta(days=10),
            status="active",
        ),
    ]
    session.add_all(challenges)
    session.flush()

    # 11. CSR Activities
    activities = [
        CSRActivity(
            title="Tree Plantation Drive",
            category_id=categories[1].id,
            description="Volunteer to plant trees in the local community forest.",
            volunteer_hours_est=4,
            funds_raised="N/A",
            points_reward=80,
            evidence_required=True,
            status="Active",
        ),
        CSRActivity(
            title="Charity Blood Donation",
            category_id=categories[2].id,
            description="Participate in the office blood donation drive.",
            volunteer_hours_est=2,
            funds_raised="N/A",
            points_reward=50,
            evidence_required=False,
            status="Active",
        ),
        CSRActivity(
            title="Beach Cleanup Project",
            category_id=categories[1].id,
            description="Clean up plastic debris at the local city beach.",
            volunteer_hours_est=6,
            funds_raised="$5,000",
            points_reward=120,
            evidence_required=True,
            status="Active",
        ),
    ]
    session.add_all(activities)
    session.flush()

    # 12. Default ESG Configuration
    config = ESGConfig(
        org_name="EcoSphere Corp",
        env_weight=40.0,
        social_weight=30.0,
        gov_weight=30.0,
        enable_auto_emission=True,
        require_csr_evidence=True,
        enable_badge_auto_award=True,
        notify_compliance_issue=True,
        notify_approval_decision=True,
        notify_policy_reminder=True,
        notify_badge_unlock=True,
    )
    session.add(config)

    # 13. Default Department Scores
    dept_scores = [
        DepartmentScore(department_id=departments[0].id, environmental_score=85, social_score=82, governance_score=90, total_score=85.6),
        DepartmentScore(department_id=departments[1].id, environmental_score=78, social_score=75, governance_score=84, total_score=78.9),
        DepartmentScore(department_id=departments[2].id, environmental_score=82, social_score=88, governance_score=88, total_score=85.6),
        DepartmentScore(department_id=departments[3].id, environmental_score=72, social_score=70, governance_score=80, total_score=73.8),
    ]
    session.add_all(dept_scores)

    # 14. Add initial Carbon Entries
    carbon_entries = [
        CarbonEntry(
            user_id=users[2].id,
            department_id=departments[1].id,
            activity_type="Diesel Fuel",
            quantity=850,
            unit="litres",
            emission_factor=2.68,
            kgco2e=2278.0,
            evidence_url="invoice_2026_03.pdf",
        ),
        CarbonEntry(
            user_id=users[0].id,
            department_id=departments[0].id,
            activity_type="Grid Electricity",
            quantity=4200,
            unit="kWh",
            emission_factor=0.85,
            kgco2e=3570.0,
            evidence_url="utility_bill_admin.pdf",
        ),
    ]
    session.add_all(carbon_entries)

    # 15. Compliance Issue
    compliance_issues = [
        ComplianceIssue(
            department_id=departments[1].id,
            owner_user_id=users[1].id,
            title="Missing MSDS sheets in Chemical Storage Room",
            severity="High",
            status="open",
            evidence_required=True,
            due_date=datetime.utcnow() + timedelta(days=7),
        ),
        ComplianceIssue(
            department_id=departments[3].id,
            owner_user_id=users[2].id,
            title="Late supplier disclosure filings",
            severity="Medium",
            status="resolved",
            evidence_required=False,
            due_date=datetime.utcnow() - timedelta(days=2),
        ),
    ]
    session.add_all(compliance_issues)

    # 16. Audits
    audits = [
        Audit(
            department_id=departments[1].id,
            auditor_id=users[3].id,
            status="completed",
            score=91.5,
            notes="Minor findings in safety logs, otherwise excellent compliance posture.",
        ),
    ]
    session.add_all(audits)

    session.commit()
    session.close()
    print("Database successfully seeded with comprehensive ESG platform records.")


if __name__ == "__main__":
    seed()

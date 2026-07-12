from uuid import uuid4

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.erp_models import Badge, Challenge, Department, Policy, Reward, User


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    departments = [
        Department(name="Administration", code="ADM", parent_department_id=None),
        Department(name="Operations", code="OPS", parent_department_id=None),
        Department(name="People", code="HR", parent_department_id=None),
    ]

    session.add_all(departments)
    session.flush()

    session.add_all(
        [
            User(
                email="admin@ecomerge.local",
                password_hash="admin123",
                role="admin",
                full_name="Admin User",
                department_id=departments[0].id,
            ),
            User(
                email="manager@ecomerge.local",
                password_hash="manager123",
                role="manager",
                full_name="Manager User",
                department_id=departments[1].id,
            ),
            User(
                email="employee@ecomerge.local",
                password_hash="employee123",
                role="employee",
                full_name="Employee User",
                department_id=departments[1].id,
            ),
            User(
                email="auditor@ecomerge.local",
                password_hash="auditor123",
                role="auditor",
                full_name="Auditor User",
                department_id=departments[2].id,
            ),
        ]
    )

    session.add_all(
        [
            Policy(title="ESG Code of Conduct", category="governance", version="v1", status="active", department_id=departments[0].id),
            Policy(title="Carbon Reporting Standard", category="environmental", version="v1", status="active", department_id=departments[1].id),
            Badge(code="green_starter", name="Green Starter", xp_threshold=50),
            Reward(title="Eco Gift Card", xp_cost=150, stock=20),
            Challenge(title="Zero Waste Week", challenge_type="environmental", xp_reward=100),
        ]
    )

    session.commit()
    session.close()


if __name__ == "__main__":
    seed()

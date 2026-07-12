from sqlalchemy.orm import Session
from app.core.security import create_access_token
from app.models.erp_models import User


class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> tuple[str, str] | None:
        user = db.query(User).filter(User.email == email.lower()).first()
        if not user or user.password_hash != password:
            return None
        token = create_access_token(subject=user.email, role=user.role)
        return token, user.role


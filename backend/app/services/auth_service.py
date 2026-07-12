from app.core.security import create_access_token
from app.core.rbac import Role

seed_users = {
    "admin@ecomerge.local": {"password": "admin123", "role": Role.ADMIN.value},
    "manager@ecomerge.local": {"password": "manager123", "role": Role.MANAGER.value},
    "employee@ecomerge.local": {"password": "employee123", "role": Role.EMPLOYEE.value},
    "auditor@ecomerge.local": {"password": "auditor123", "role": Role.AUDITOR.value},
}


class AuthService:
    @staticmethod
    def authenticate(email: str, password: str) -> tuple[str, str] | None:
        user = seed_users.get(email.lower())
        if not user or user["password"] != password:
            return None
        token = create_access_token(subject=email.lower(), role=user["role"])
        return token, user["role"]

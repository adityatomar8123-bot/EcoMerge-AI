from enum import Enum
from typing import Callable, Any


class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    AUDITOR = "auditor"


role_permissions = {
    Role.ADMIN: {
        "dashboard:read",
        "department:write",
        "carbon:write",
        "carbon:read",
        "policy:write",
        "policy:read",
        "compliance:write",
        "compliance:read",
        "report:write",
        "report:read",
        "settings:write",
        "notification:write",
    },
    Role.MANAGER: {
        "dashboard:read",
        "department:read",
        "carbon:write",
        "carbon:read",
        "policy:write",
        "policy:read",
        "compliance:write",
        "compliance:read",
        "report:write",
        "report:read",
        "notification:write",
    },
    Role.EMPLOYEE: {
        "dashboard:read",
        "carbon:read",
        "carbon:write",
        "policy:read",
        "report:read",
        "notification:read",
    },
    Role.AUDITOR: {
        "dashboard:read",
        "policy:read",
        "compliance:read",
        "compliance:write",
        "report:read",
        "notification:read",
    },
}


def require_permission(permission: str) -> Callable[[Any], bool]:
    def _guard(request: Any) -> bool:
        state = getattr(request, "state", None)
        if isinstance(state, dict):
            user = state.get("user")
        else:
            user = getattr(state, "user", None)

        if user is None:
            return False

        role_value = user.get("role", "employee")
        if role_value not in {item.value for item in Role}:
            return False

        role = Role(role_value)
        return permission in role_permissions.get(role, set())

    return _guard

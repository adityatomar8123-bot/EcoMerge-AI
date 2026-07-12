from fastapi.testclient import TestClient

from app.main import app
from app.core.rbac import Role, require_permission, role_permissions


client = TestClient(app)


def test_root_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_login_returns_jwt_for_admin_seed_user():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@ecosphere.local", "password": "admin123"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert payload["role"] == "admin"


def test_rbac_permissions_are_defined_for_all_roles():
    assert Role.ADMIN in role_permissions
    assert Role.MANAGER in role_permissions
    assert Role.EMPLOYEE in role_permissions
    assert Role.AUDITOR in role_permissions


def test_permission_guard_allows_admin_access():
    request = type("Req", (), {"state": {"user": {"role": "admin"}}})()
    handler = require_permission("dashboard:read")
    assert handler(request) is True

from app.services.auth_service import AuthService


class AuthController:
    @staticmethod
    def login(email: str, password: str):
        result = AuthService.authenticate(email=email, password=password)
        if result is None:
            return None
        token, role = result
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role,
            "email": email,
        }

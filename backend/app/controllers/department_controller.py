from app.repositories.department_repository import DepartmentRepository


class DepartmentController:
    @staticmethod
    def list_departments():
        return DepartmentRepository().list_departments()

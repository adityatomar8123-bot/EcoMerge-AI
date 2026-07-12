class DepartmentRepository:
    def list_departments(self):
        return [
            {"id": "1", "name": "Administration", "code": "ADM"},
            {"id": "2", "name": "Operations", "code": "OPS"},
            {"id": "3", "name": "People", "code": "HR"},
        ]

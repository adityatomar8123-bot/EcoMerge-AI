from app.services.dashboard_service import DashboardService


class DashboardController:
    @staticmethod
    def get_overview():
        return DashboardService().get_overview()

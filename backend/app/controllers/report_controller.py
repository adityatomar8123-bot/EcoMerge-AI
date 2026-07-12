from app.services.report_service import ReportService


class ReportController:
    @staticmethod
    def get_esg_report():
        return ReportService().generate_esg_report()

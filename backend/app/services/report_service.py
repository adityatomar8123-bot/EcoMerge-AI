from typing import Any


class ReportService:
    def generate_esg_report(self) -> dict[str, Any]:
        return {
            "report_type": "esg",
            "status": "ready",
            "download_formats": ["pdf", "csv", "excel"],
            "summary": "Overall ESG performance is stable with strong governance oversight.",
        }

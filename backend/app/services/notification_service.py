class NotificationService:
    def list_notifications(self):
        return [
            {"id": "n1", "type": "policy_reminder", "message": "Annual ESG policy acknowledgement due in 2 days", "is_read": False},
            {"id": "n2", "type": "compliance", "message": "Audit evidence pending for Operations", "is_read": False},
        ]

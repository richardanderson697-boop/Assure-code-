import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "service": "scanner-service",
            "message": record.getMessage(),
            "correlationId": getattr(record, 'correlation_id', 'N/A')
        }
        return json.dumps(log_entry)
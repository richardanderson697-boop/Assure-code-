import logging
import json
from .middleware import correlation_id_ctx

class StructuredJsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "service": "ai-scanner-service",
            "correlation_id": correlation_id_ctx.get(),
            "module": record.module,
        }
        return json.dumps(log_record)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredJsonFormatter())
    logging.getLogger().addHandler(handler)
    logging.getLogger().setLevel(logging.INFO)
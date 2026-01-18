import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from contextvars import ContextVar

correlation_id_ctx = ContextVar("correlation_id", default="N/A")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        corr_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
        token = correlation_id_ctx.set(corr_id)
        
        try:
            response = await call_next(request)
            response.headers["x-correlation-id"] = corr_id
            return response
        finally:
            correlation_id_ctx.reset(token)
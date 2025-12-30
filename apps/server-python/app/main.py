from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, apikeys, billing
from pathlib import Path
import fnmatch

# Create FastAPI app
app = FastAPI(
    title="Vault API",
    description="API Key Management Service",
    version="1.0.0"
)

# Mount static files directory
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


# Custom CORS middleware with wildcard pattern support
class FlexibleCORSMiddleware(BaseHTTPMiddleware):
    """CORS middleware that supports wildcard patterns like *.vercel.app"""

    def __init__(self, app, allow_origins: list):
        super().__init__(app)
        self.allow_origins = allow_origins

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")

        if origin:
            # Check if origin matches any pattern (including wildcards)
            is_allowed = any(
                fnmatch.fnmatch(origin, pattern.replace("*", "*"))
                if "*" in pattern
                else origin == pattern
                for pattern in self.allow_origins
            )

            if is_allowed:
                # Add CORS headers for allowed origins
                response = await call_next(request)
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

                # Handle preflight requests
                if request.method == "OPTIONS":
                    return Response(
                        status_code=200,
                        headers={
                            "Access-Control-Allow-Origin": origin,
                            "Access-Control-Allow-Credentials": "true",
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        }
                    )
                return response

        # Default behavior for non-CORS requests
        return await call_next(request)


# Configure CORS with wildcard pattern support
app.add_middleware(
    FlexibleCORSMiddleware,
    allow_origins=settings.allowed_origins_list,
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(apikeys.router, prefix="/api")
app.include_router(billing.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    # In production, use Alembic migrations instead
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # Log error but don't prevent startup
        import logging
        logging.error(f"Warning: Could not connect to database on startup: {e}")
        logging.warning("Application will start, but database operations may fail")


@app.get("/")
async def root():
    """Root endpoint - Serve the landing page"""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {
        "name": "Vault API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "auth": "/api/auth",
            "apiKeys": "/api/apikeys",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)

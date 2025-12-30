from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, apikeys, billing
from pathlib import Path

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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

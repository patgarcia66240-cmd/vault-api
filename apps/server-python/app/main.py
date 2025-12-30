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
# Par défaut : autorise localhost (tous ports) et tous les sous-domaines vercel.app
default_origins = ["http://localhost:*", "https://*.vercel.app"]

# Utilise ALLOWED_ORIGINS si définie, sinon utilise les patterns par défaut
allowed_origins = settings.allowed_origins_list if settings.allowed_origins_list else default_origins

app.add_middleware(
    FlexibleCORSMiddleware,
    allow_origins=allowed_origins,
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
            "test_db": "/test-db",
            "auth": "/api/auth",
            "apiKeys": "/api/apikeys",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/test-db")
async def test_database():
    """
    Test de connectivite a la base de donnees
    Retourne des infos detaillees sur la connexion
    """
    from sqlalchemy import text
    import time

    result = {
        "status": "unknown",
        "database": {},
        "timing_ms": 0,
        "error": None
    }

    start_time = time.time()

    # Essayer la connexion jusqu'a 3 fois (pour gerer le fallback IPv6 -> IPv4)
    max_retries = 3
    last_error = None

    for attempt in range(max_retries):
        try:
            # Test 1: Connexion simple
            with engine.connect() as conn:
                # Test 2: Requete de version
                version_result = conn.execute(text("SELECT version()"))
                version = version_result.fetchone()[0]

                # Test 3: Compter les tables
                tables_result = conn.execute(text("""
                    SELECT COUNT(*) FROM information_schema.tables
                    WHERE table_schema = 'public'
                """))
                tables_count = tables_result.fetchone()[0]

                # Test 4: Compter les utilisateurs
                try:
                    users_result = conn.execute(text("SELECT COUNT(*) FROM users"))
                    users_count = users_result.fetchone()[0]
                except:
                    users_count = 0

                # Test 5: Infos de connexion
                info_result = conn.execute(text("""
                    SELECT
                        inet_server_addr() as server_ip,
                        inet_server_port() as server_port,
                        current_database() as database,
                        current_user as user
                """))
                server_ip, server_port, database, user = info_result.fetchone()

                elapsed = (time.time() - start_time) * 1000

                result.update({
                    "status": "connected",
                    "database": {
                        "server_ip": server_ip,
                        "server_port": server_port,
                        "database_name": database,
                        "user": user,
                        "postgresql_version": version.split(",")[0] if version else "unknown",
                        "tables_count": tables_count,
                        "users_count": users_count
                    },
                    "timing_ms": round(elapsed, 2),
                    "error": None
                })

                # Succes ! On retourne le resultat
                return result

        except Exception as e:
            last_error = e
            # Si ce n'est pas la derniere tentative, on continue
            if attempt < max_retries - 1:
                continue

    # Si on arrive ici, toutes les tentatives ont echoue
    elapsed = (time.time() - start_time) * 1000
    result.update({
        "status": "error",
        "timing_ms": round(elapsed, 2),
        "error": str(last_error)
    })

    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)

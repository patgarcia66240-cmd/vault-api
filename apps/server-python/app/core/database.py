from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Force IPv4 connection for Supabase (Render has IPv6 issues)
database_url = settings.DATABASE_URL
# Add hostaddr parameter to force IPv4 connection
if "supabase.co" in database_url and "hostaddr" not in database_url:
    # Extract host from URL and add hostaddr parameter to force IPv4
    if "@" in database_url:
        # URL format: postgresql://user:pass@host:port/db
        parts = database_url.split("@")
        credentials = parts[0]
        rest = parts[1]
        host_part = rest.split("/")[0]
        # Extract host (remove port if present)
        host = host_part.split(":")[0]
        # Add IPv4 parameter
        database_url = database_url.replace(host_part, f"{host_part}?hostaddr={host}&connect_timeout=10")

# Create SQLAlchemy engine
engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "connect_timeout": 10
    }
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

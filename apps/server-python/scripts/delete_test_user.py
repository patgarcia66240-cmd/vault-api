from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
email='test@example.com'
with engine.begin() as conn:
    res = conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {'email': email})
    existing = res.first()
    if existing:
        user_id = existing[0]
        conn.execute(text("DELETE FROM auth.identities WHERE user_id = :user_id"), {'user_id': user_id})
        conn.execute(text("DELETE FROM auth.sessions WHERE user_id = :user_id"), {'user_id': user_id})
        conn.execute(text("DELETE FROM auth.users WHERE id = :user_id"), {'user_id': user_id})
        print('Deleted existing test user')
    else:
        print('No existing test user found')

from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT COUNT(*) FROM auth.users WHERE email = 'test@example.com'"))
    print('count auth.users=', res.scalar())
    try:
        res2 = conn.execute(text("SELECT COUNT(*) FROM public.user WHERE email = 'test@example.com'"))
        print('count public.user=', res2.scalar())
    except Exception as e:
        print('public.user check failed:', e)

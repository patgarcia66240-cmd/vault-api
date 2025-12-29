from pathlib import Path
import sys
# Ensure local app package is importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from sqlalchemy import create_engine, text
from app.core.config import settings
import uuid, json

engine = create_engine(settings.DATABASE_URL)
email='test@example.com'
password='Test123!'
with engine.begin() as conn:
    res = conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {'email': email})
    existing = res.first()
    if existing:
        user_id = existing[0]
        conn.execute(text("DELETE FROM auth.identities WHERE user_id = :user_id"), {'user_id': user_id})
        conn.execute(text("DELETE FROM auth.sessions WHERE user_id = :user_id"), {'user_id': user_id})
        conn.execute(text("DELETE FROM auth.users WHERE id = :user_id"), {'user_id': user_id})
        print('Deleted existing user')
    user_id = str(uuid.uuid4())
    conn.execute(text("""
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, role, created_at, updated_at
        ) VALUES (
            :id, :email, crypt(:password, gen_salt('bf')), NOW(), :raw_user_meta_data, :raw_app_meta_data, :role, NOW(), NOW()
        )
    """), {
        'id': user_id, 'email': email, 'password': password,
        'raw_user_meta_data': json.dumps({'name':'Test User'}), 'raw_app_meta_data': json.dumps({'provider':'email'}), 'role':'user'
    })
    conn.execute(text("""
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (:id, :user_id, :identity_data, 'email', :email, NOW(), NOW(), NOW())
    """), {'id': str(uuid.uuid4()), 'user_id': user_id, 'identity_data': json.dumps({'email': email, 'name':'Test User'}), 'email': email})
print('Recreated test user', email)

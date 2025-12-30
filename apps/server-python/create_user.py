"""
Script pour créer un utilisateur de test dans la base de données Supabase
Usage: python create_user.py <email> <password>
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.security import get_password_hash
import uuid

def create_user(email: str, password: str):
    db = SessionLocal()
    try:
        # Vérifier si l'utilisateur existe déjà
        result = db.execute(
            text("SELECT id, email FROM auth.users WHERE email = :email"),
            {"email": email}
        )
        existing_user = result.fetchone()

        if existing_user:
            print(f"ERROR: User {email} already exists (ID: {existing_user[0]})")
            return False

        # Générer un UUID pour le nouvel utilisateur
        user_id = str(uuid.uuid4())

        # Hasher le mot de passe
        password_hash = get_password_hash(password)

        # Insérer dans auth.users (table système Supabase)
        db.execute(
            text("""
                INSERT INTO auth.users (
                    instance_id, id, aud, role, email,
                    encrypted_password, email_confirmed_at,
                    created_at, updated_at, last_sign_in_at
                ) VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    :id,
                    'authenticated',
                    'authenticated',
                    :email,
                    :password_hash,
                    NOW(),
                    NOW(),
                    NOW(),
                    NOW()
                )
            """),
            {
                "id": user_id,
                "email": email,
                "password_hash": password_hash
            }
        )

        # Créer le profil dans user_profiles
        from app.models.user import UserProfile
        user_profile = UserProfile(id=user_id, plan="FREE")
        db.add(user_profile)
        db.commit()
        db.refresh(user_profile)

        print(f"SUCCESS: User created successfully!")
        print(f"   ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Plan: FREE")
        return True

    except Exception as e:
        db.rollback()
        print(f"ERROR: Failed to create user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_user.py <email> <password>")
        print("Example: python create_user.py xenatronics@gmx.fr 'Garcia66240!'")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    print(f"Creating user {email}...")
    success = create_user(email, password)

    if success:
        print("\nSUCCESS: You can now login with these credentials!")
    else:
        print("\nERROR: Failed to create user")
        sys.exit(1)

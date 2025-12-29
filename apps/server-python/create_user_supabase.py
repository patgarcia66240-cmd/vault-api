#!/usr/bin/env python3
"""Créer un utilisateur Supabase"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings
import uuid
import json

def create_user(email: str, password: str, name: str = None):
    """Créer un utilisateur Supabase"""

    print("="*60)
    print("CREATION UTILISATEUR SUPABASE")
    print("="*60)
    print(f"\nEmail: {email}")
    print(f"Name: {name or email}")

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        with engine.connect() as conn:
            # Vérifier si l'utilisateur existe déjà
            result = conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {"email": email})
            existing = result.first()

            if existing:
                print(f"\n[INFO] L'utilisateur {email} existe déjà (ID: {existing[0]})")
                return True

            # Générer un UUID pour l'utilisateur
            user_id = str(uuid.uuid4())

            # Insérer dans auth.users (table Supabase)
            # Note: Supabase utilise une structure spécifique
            conn.execute(text("""
                INSERT INTO auth.users (
                    id,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    raw_user_meta_data,
                    created_at,
                    updated_at
                ) VALUES (
                    :id,
                    :email,
                    crypt(:password, gen_salt('bf')),
                    NOW(),
                    :raw_user_meta_data,
                    NOW(),
                    NOW()
                )
            """), {
                "id": user_id,
                "email": email,
                "password": password,
                "raw_user_meta_data": json.dumps({"name": name}) if name else "{}"
            })

            # Créer aussi l'identité
            conn.execute(text("""
                INSERT INTO auth.identities (
                    id,
                    user_id,
                    identity_data,
                    provider,
                    provider_id,
                    last_sign_in_at,
                    created_at,
                    updated_at
                ) VALUES (
                    :id,
                    :user_id,
                    :identity_data,
                    'email',
                    :email,
                    NOW(),
                    NOW(),
                    NOW()
                )
            """), {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "identity_data": json.dumps({"email": email, "name": name} if name else {"email": email}),
                "email": email
            })

            conn.commit()

            print(f"\n[OK] Utilisateur créé avec succès !")
            print(f"ID: {user_id}")
            print(f"Email: {email}")
            print(f"Name: {name or 'Non défini'}")
            return True

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    email = "xenatronics@gmx.fr"
    password = "Test123456!"
    name = "xen"

    success = create_user(email, password, name)

    print("\n" + "="*60)
    if success:
        print("SUCCES - Utilisateur créé")
    else:
        print("ECHEC - Vérifiez les erreurs ci-dessus")
    print("="*60 + "\n")

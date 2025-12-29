#!/usr/bin/env python3
"""Supprimer et recréer un utilisateur Supabase avec le rôle user"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings
import uuid
import json

def recreate_user(email: str, password: str, first_name: str = None, last_name: str = None):
    """Supprimer et recréer un utilisateur Supabase"""

    print("="*60)
    print("SUPPRESSION ET RECREATION UTILISATEUR SUPABASE")
    print("="*60)
    print(f"\nEmail: {email}")
    print(f"Firstname: {first_name or 'Non défini'}")
    print(f"Lastname: {last_name or 'Non défini'}")

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        with engine.connect() as conn:
            # 1. Supprimer l' utilisateur s'il existe
            print(f"\n[1/3] Recherche de l'utilisateur...")
            result = conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {"email": email})
            existing = result.first()

            if existing:
                user_id = existing[0]
                print(f"Utilisateur trouvé (ID: {user_id})")

                # Supprimer d'abord les identités
                conn.execute(text("DELETE FROM auth.identities WHERE user_id = :user_id"), {"user_id": user_id})
                print(f"[OK] Identités supprimées")

                # Supprimer les sessions
                conn.execute(text("DELETE FROM auth.sessions WHERE user_id = :user_id"), {"user_id": user_id})
                print(f"[OK] Sessions supprimées")

                # Supprimer l'utilisateur
                conn.execute(text("DELETE FROM auth.users WHERE id = :user_id"), {"user_id": user_id})
                print(f"[OK] Utilisateur supprimé")
            else:
                print(f"[INFO] L'utilisateur n'existe pas encore")

            # 2. Créer le nouvel utilisateur
            print(f"\n[2/3] Création du nouvel utilisateur...")
            user_id = str(uuid.uuid4())

            conn.execute(text("""
                INSERT INTO auth.users (
                    id,
                    email,
                    encrypted_password,
                    email_confirmed_at,
                    raw_user_meta_data,
                    raw_app_meta_data,
                    role,
                    created_at,
                    updated_at
                ) VALUES (
                    :id,
                    :email,
                    crypt(:password, gen_salt('bf')),
                    NOW(),
                    :raw_user_meta_data,
                    :raw_app_meta_data,
                    :role,
                    NOW(),
                    NOW()
                )
            """), {
                "id": user_id,
                "email": email,
                "password": password,
                "raw_user_meta_data": json.dumps({
                    "first_name": first_name,
                    "last_name": last_name
                }) if first_name or last_name else "{}",
                "raw_app_meta_data": json.dumps({
                    "first_name": first_name,
                    "last_name": last_name,
                    "provider": "email"
                }) if first_name or last_name else '{"provider": "email"}',
                "role": "user"
            })

            # 3. Créer l'identité
            print(f"\n[3/3] Création de l'identité...")
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
                "identity_data": json.dumps({
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name
                }) if first_name or last_name else json.dumps({"email": email}),
                "email": email
            })

            conn.commit()

            print(f"\n[OK] Utilisateur recréé avec succès !")
            print(f"ID: {user_id}")
            print(f"Email: {email}")
            print(f"Firstname: {first_name or 'Non défini'}")
            print(f"Lastname: {last_name or 'Non défini'}")
            print(f"Role: user")
            return True

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    email = "xenatronics@gmx.fr"
    password = "Test123456!"
    first_name = "xen"
    last_name = "garcia"

    success = recreate_user(email, password, first_name, last_name)

    print("\n" + "="*60)
    if success:
        print("SUCCES - Utilisateur recréé avec le rôle user")
    else:
        print("ECHEC - Vérifiez les erreurs ci-dessus")
    print("="*60 + "\n")

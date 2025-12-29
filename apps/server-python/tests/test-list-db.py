#!/usr/bin/env python3
"""
Test de connexion Supabase
- Vérifie la connexion
- Liste les schémas
- Liste les utilisateurs Supabase (auth.users)
"""

from sqlalchemy import create_engine, text
import sys
from pathlib import Path
# Ensure local 'app' package is importable when running the script directly
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.config import settings

def test_supabase_connection():
    print("\n" + "=" * 60)
    print("TEST CONNEXION SUPABASE")
    print("=" * 60)

    if not settings.DATABASE_URL:
        print("[ERREUR] DATABASE_URL non configurée")
        return

    # Supabase → psycopg2 recommandé en sync
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        with engine.connect() as conn:
            print("\n[OK] Connexion réussie")

            # 1️⃣ Lister les schémas visibles
            schemas = conn.execute(text("""
                SELECT schema_name
                FROM information_schema.schemata
                ORDER BY schema_name
            """)).scalars().all()

            print("\nSchémas disponibles :")
            for schema in schemas:
                print(f"  - {schema}")

            # 2️⃣ Lister les tables auth
            if "auth" in schemas:
                tables = conn.execute(text("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'auth'
                    ORDER BY table_name
                """)).scalars().all()

                print("\nTables dans le schéma auth :")
                for table in tables:
                    print(f"  - {table}")

            # 3️⃣ Lister les utilisateurs Supabase
            print("\nUtilisateurs Supabase (auth.users) :")
            users = conn.execute(text("""
                SELECT
                    id,
                    email,
                    created_at,
                    raw_user_meta_data
                FROM auth.users
                ORDER BY created_at DESC
                LIMIT 20
            """)).fetchall()

            if not users:
                print("  (aucun utilisateur)")
            else:
                for u in users:
                    meta = u.raw_user_meta_data or {}
                    print(
                        f"  - {u.email} | "
                        f"créé le {u.created_at} | "
                        f"meta={meta}"
                    )

    except Exception as e:
        print("\n[ERREUR] Connexion ou requête échouée")
        print(e)
        import traceback
        traceback.print_exc()


def show_supabase_config():
    print("\n" + "=" * 60)
    print("CONFIGURATION SUPABASE")
    print("=" * 60)

    print(f"Project ID        : {settings.SUPABASE_PROJECT_ID or 'Non configuré'}")
    print(f"API key présente  : {'Oui' if settings.SUPABASE_API_KEY else 'Non'}")
    print(f"DATABASE_URL      : {settings.DATABASE_URL[:60]}...")


if __name__ == "__main__":
    show_supabase_config()
    test_supabase_connection()
    print("\n" + "=" * 60)
    print("TERMINÉ")
    print("=" * 60 + "\n")

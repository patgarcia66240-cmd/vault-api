#!/usr/bin/env python3
"""Vérifier les colonnes de la table auth.users"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, inspect
from app.core.config import settings

def check_users_columns():
    """Lister toutes les colonnes de auth.users"""

    print("="*60)
    print("COLONNES DE LA TABLE auth.users")
    print("="*60)

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        inspector = inspect(engine)

        # Lister les colonnes de auth.users
        columns = inspector.get_columns("users", schema="auth")

        print(f"\n[OK] {len(columns)} colonnes trouvées:\n")
        for col in columns:
            nullable = "NULL" if col["nullable"] else "NOT NULL"
            default = f" DEFAULT {col['default']}" if col['default'] else ""
            print(f"  - {col['name']:30} {str(col['type']):20} {nullable}{default}")

        # Lister aussi les colonnes de la table mappers si elle existe
        try:
            columns = inspector.get_columns("users", schema="vault")
            print(f"\n[OK] {len(columns)} colonnes trouvées dans vault.users:\n")
            for col in columns:
                nullable = "NULL" if col["nullable"] else "NOT NULL"
                default = f" DEFAULT {col['default']}" if col['default'] else ""
                print(f"  - {col['name']:30} {str(col['type']):20} {nullable}{default}")
        except Exception:
            pass

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_users_columns()

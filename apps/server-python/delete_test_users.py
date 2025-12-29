#!/usr/bin/env python3
"""Supprimer tous les utilisateurs de test de la base de données"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings

def delete_all_users():
    """Supprimer tous les utilisateurs auth.users et auth.identities"""

    print("="*60)
    print("SUPPRESSION DE TOUS LES UTILISATEURS")
    print("="*60)

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        with engine.begin() as conn:
            # Compter avant
            result = conn.execute(text("SELECT COUNT(*) FROM auth.users"))
            count_users = result.scalar()
            result = conn.execute(text("SELECT COUNT(*) FROM auth.identities"))
            count_identities = result.scalar()

            print(f"\nUtilisateurs avant: {count_users}")
            print(f"Identités avant: {count_identities}")

            # Supprimer d'abord les identités (clé étrangère)
            print("\n[1/2] Suppression des identités...")
            result = conn.execute(text("DELETE FROM auth.identities"))
            print(f"    {result.rowcount} identités supprimées")

            # Puis supprimer les utilisateurs
            print("[2/2] Suppression des utilisateurs...")
            result = conn.execute(text("DELETE FROM auth.users"))
            print(f"    {result.rowcount} utilisateurs supprimés")

            print("\n[OK] Tous les utilisateurs ont été supprimés avec succès !")

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    delete_all_users()

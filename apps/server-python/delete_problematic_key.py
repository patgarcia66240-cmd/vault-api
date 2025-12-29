#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour supprimer la clé problématique
"""
import sys
import os
import io

# Forcer UTF-8 pour la sortie Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sqlalchemy import text
from app.core.database import SessionLocal

def delete_problematic_key():
    """Supprimer la clé API problématique"""

    print("=== Suppression de la clé problématique ===\n")

    db = SessionLocal()

    try:
        # Supprimer la clé avec l'ID problématique
        key_id = "6397fdb8-7682-4346-a247-508988602077"

        # D'abord, vérifier si elle existe
        check_query = text("""
            SELECT id, name, prefix, last4
            FROM public.api_keys
            WHERE id = :key_id
        """)
        result = db.execute(check_query, {"key_id": key_id}).fetchone()

        if result:
            print(f"Clé trouvée : {result[1]} ({result[2]}***{result[3]})")
            print(f"ID: {result[0]}")
            print("\nSuppression...")

            delete_query = text("DELETE FROM public.api_keys WHERE id = :key_id")
            db.execute(delete_query, {"key_id": key_id})
            db.commit()

            print("✅ Clé supprimée avec succès")
        else:
            print("❌ Clé non trouvée (elle a peut-être déjà été supprimée)")

        # Afficher toutes les clés restantes
        print("\n=== Clés API restantes ===")
        all_keys_query = text("""
            SELECT id, name, prefix, last4
            FROM public.api_keys
            ORDER BY created_at DESC
        """)
        all_keys = db.execute(all_keys_query).fetchall()

        print(f"Total: {len(all_keys)} clé(s)\n")
        for key in all_keys:
            print(f"  - {key[1]} ({key[2]}***{key[3]})")

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

    return True


if __name__ == "__main__":
    success = delete_problematic_key()
    sys.exit(0 if success else 1)

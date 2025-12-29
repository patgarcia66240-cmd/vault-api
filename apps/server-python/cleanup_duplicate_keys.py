#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour nettoyer les clés API en doublon ou problématiques
"""
import sys
import os
import io

# Forcer UTF-8 pour la sortie Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sqlalchemy import text
from app.core.database import SessionLocal

def cleanup_duplicates():
    """Nettoyer les clés API en doublon"""

    print("=== Nettoyage des clés API ===\n")

    db = SessionLocal()

    try:
        # Trouver les hash en doublon
        print("Recherche des hash en doublon...")
        duplicate_query = text("""
            SELECT hash, COUNT(*) as count
            FROM public.api_keys
            GROUP BY hash
            HAVING COUNT(*) > 1
        """)

        duplicates = db.execute(duplicate_query).fetchall()

        if duplicates:
            print(f"Found {len(duplicates)} duplicate hash(es):")
            for dup in duplicates:
                print(f"  - Hash: {dup[0][:16]}... (count: {dup[1]})")

            # Pour chaque doublon, garder la plus ancienne et supprimer les autres
            for dup in duplicates:
                hash_value = dup[0]

                # Récupérer toutes les clés avec ce hash, triées par date de création
                keys_query = text("""
                    SELECT id, name, created_at
                    FROM public.api_keys
                    WHERE hash = :hash
                    ORDER BY created_at ASC
                """)
                keys = db.execute(keys_query, {"hash": hash_value}).fetchall()

                # Garder la première, supprimer les autres
                keys_to_keep = keys[0]
                keys_to_delete = keys[1:]

                print(f"\nHash {hash_value[:16]}...")
                print(f"  Garder: {keys_to_keep[1]} (ID: {keys_to_keep[0]})")

                for key in keys_to_delete:
                    print(f"  Supprimer: {key[1]} (ID: {key[0]})")
                    delete_query = text("DELETE FROM public.api_keys WHERE id = :id")
                    db.execute(delete_query, {"id": key[0]})

                db.commit()
        else:
            print("✅ Aucun doublon trouvé")

        # Afficher toutes les clés restantes
        print("\n=== Clés API restantes ===")
        all_keys_query = text("""
            SELECT id, name, prefix, last4, created_at
            FROM public.api_keys
            ORDER BY created_at DESC
        """)
        all_keys = db.execute(all_keys_query).fetchall()

        print(f"Total: {len(all_keys)} clé(s)\n")
        for key in all_keys:
            print(f"  - {key[1]} ({key[2]}***{key[3]}) - ID: {key[0]}")

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
    success = cleanup_duplicates()
    sys.exit(0 if success else 1)

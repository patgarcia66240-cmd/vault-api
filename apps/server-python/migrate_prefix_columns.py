#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour migrer les colonnes prefix et last4 de la table api_keys
"""
import sys
import os
import io

# Forcer UTF-8 pour la sortie Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sqlalchemy import text
from app.core.database import engine

def migrate_columns():
    """Élargir les colonnes prefix et last4"""

    print("=== Migration des colonnes api_keys ===\n")

    try:
        with engine.connect() as conn:
            # Début de la transaction
            trans = conn.begin()

            try:
                # Élargir la colonne prefix
                print("Élargissement de la colonne prefix à VARCHAR(50)...")
                conn.execute(text(
                    "ALTER TABLE public.api_keys ALTER COLUMN prefix TYPE VARCHAR(50)"
                ))
                print("✅ Colonne prefix mise à jour")

                # Élargir la colonne last4
                print("\nÉlargissement de la colonne last4 à VARCHAR(10)...")
                conn.execute(text(
                    "ALTER TABLE public.api_keys ALTER COLUMN last4 TYPE VARCHAR(10)"
                ))
                print("✅ Colonne last4 mise à jour")

                # Valider la transaction
                trans.commit()
                print("\n✅ Migration terminée avec succès!")

            except Exception as e:
                # Annuler en cas d'erreur
                trans.rollback()
                print(f"\n❌ Erreur lors de la migration, transaction annulée: {e}")
                raise

    except Exception as e:
        print(f"\n❌ Erreur de connexion ou de migration: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    success = migrate_columns()
    sys.exit(0 if success else 1)

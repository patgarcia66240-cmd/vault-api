#!/usr/bin/env python3
"""Créer la table public.api_keys"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_api_keys_table():
    """Créer la table public.api_keys"""

    print("="*60)
    print("CREATION DE LA TABLE public.api_keys")
    print("="*60)

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        pool_pre_ping=True,
    )

    try:
        with engine.begin() as conn:
            # Créer la table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS public.api_keys (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    provider VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
                    provider_config TEXT,
                    prefix VARCHAR(10) NOT NULL,
                    last4 VARCHAR(4) NOT NULL,
                    enc_ciphertext BYTEA NOT NULL,
                    enc_nonce BYTEA NOT NULL,
                    hash VARCHAR(255) UNIQUE NOT NULL,
                    revoked BOOLEAN DEFAULT FALSE NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
                )
            """))

            # Créer les index
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(hash)"))

            print("\n[OK] Table public.api_keys créée avec succès !")

    except Exception as e:
        print(f"\n[ERREUR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_api_keys_table()

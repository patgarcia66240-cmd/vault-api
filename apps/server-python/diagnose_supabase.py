"""
Script de diagnostic pour identifier le problème de création de clés Supabase
"""

import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings
from app.core.security import crypto_manager
from sqlalchemy import create_engine, text
import json

def diagnose_supabase_creation():
    """Diagnostic complet pour la création de clés Supabase"""

    print("=" * 80)
    print("DINOSTIC CREATION CLE SUPABASE")
    print("=" * 80)
    print()

    # Test 1: Configuration
    print("[TEST 1] Configuration")
    print("-" * 80)
    print(f"DATABASE_URL: {settings.DATABASE_URL[:50]}...")
    print()

    # Test 2: Connexion à la base
    print("[TEST 2] Connexion à la base de données")
    print("-" * 80)

    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.begin() as conn:
            # Vérifier si la table api_keys existe
            result = conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_name = 'api_keys'
            """))

            if result.fetchone():
                print("[OK] La table api_keys existe")
            else:
                print("[ERREUR] La table api_keys n'existe PAS")
                print("        Solution: Exécutez d'abord le setup de la base")
                return False

    except Exception as e:
        print(f"[ERREUR] Impossible de se connecter à la base: {e}")
        return False

    print()

    # Test 3: Vérifier si des utilisateurs existent
    print("[TEST 3] Vérification des utilisateurs")
    print("-" * 80)

    try:
        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT COUNT(*) as count FROM users LIMIT 1
            """))
            count = result.scalar()

            if count and count > 0:
                print(f"[OK] {count} utilisateur(s) trouvé(s)")
            else:
                print("[ERREUR] Aucun utilisateur trouvé")
                print("        Solution: Créez d'abord un utilisateur via /api/auth/register")
                return False

    except Exception as e:
        print(f"[ERREUR] Impossible de vérifier les utilisateurs: {e}")
        return False

    print()

    # Test 4: Test de création de clé Supabase
    print("[TEST 4] Test de création d'une clé Supabase")
    print("-" * 80)

    try:
        # Simuler les données du frontend
        api_key_data = {
            "name": "Test Supabase",
            "provider": "SUPABASE",
            "provider_config": json.dumps({
                "url": "https://test.supabase.co",
                "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
                "serviceRoleKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_role"
            })
        }

        print(f"Données de test:")
        print(f"  name: {api_key_data['name']}")
        print(f"  provider: {api_key_data['provider']}")
        print(f"  provider_config: {api_key_data['provider_config'][:50]}...")
        print()

        # Générer une clé aléatoire
        import secrets
        api_key_plain = f"vk_{secrets.token_urlsafe(32)}"
        print(f"Clé générée: {api_key_plain[:20]}...")
        print()

        # Extraire prefix et last4
        parts = api_key_plain.split("_")
        if len(parts) > 1:
            prefix = parts[0] + "_"
        else:
            prefix = api_key_plain[:4]
        last4 = api_key_plain[-4:]

        print(f"Prefix: {prefix}")
        print(f"Last4: {last4}")
        print()

        # Chiffrer
        enc_ciphertext, enc_nonce = crypto_manager.encrypt(api_key_plain)
        print(f"[OK] Chiffrement réussi")
        print(f"  Ciphertext: {len(enc_ciphertext)} bytes")
        print(f"  Nonce: {len(enc_nonce)} bytes")
        print()

        # Créer le hash
        import hashlib
        api_key_hash = hashlib.sha256(api_key_plain.encode()).hexdigest()
        print(f"Hash: {api_key_hash[:20]}...")
        print()

        # Insérer dans la base
        print("[TEST 5] Insertion dans la base")
        print("-" * 80)

        with engine.begin() as conn:
            # Récupérer un user_id
            result = conn.execute(text("""
                SELECT id FROM users LIMIT 1
            """))
            user_id = result.scalar()
            print(f"User ID: {user_id}")

            # Insérer
            import uuid
            new_id = str(uuid.uuid4())

            result = conn.execute(text("""
                INSERT INTO api_keys (
                    id, user_id, name, provider, provider_config,
                    prefix, last4, enc_ciphertext, enc_nonce, hash,
                    revoked, created_at, updated_at
                )
                VALUES (
                    :id, :user_id, :name, :provider, :provider_config,
                    :prefix, :last4, :ciphertext, :nonce, :hash,
                    false, NOW(), NOW()
                )
                RETURNING id
            """), {
                "id": new_id,
                "user_id": user_id,
                "name": api_key_data["name"],
                "provider": api_key_data["provider"],
                "provider_config": api_key_data["provider_config"],
                "prefix": prefix,
                "last4": last4,
                "ciphertext": enc_ciphertext,
                "nonce": enc_nonce,
                "hash": api_key_hash
            })

            inserted_id = result.scalar()
            print(f"[OK] Clé insérée avec ID: {inserted_id}")
            print()

        # Vérifier l'insertion
        print("[TEST 6] Vérification de l'insertion")
        print("-" * 80)

        with engine.begin() as conn:
            result = conn.execute(text("""
                SELECT id, name, provider, prefix, last4, provider_config
                FROM api_keys
                WHERE id = :id
            """), {"id": inserted_id})

            row = result.fetchone()
            if row:
                print(f"[OK] Clé trouvée dans la base:")
                print(f"  ID: {row[0]}")
                print(f"  Name: {row[1]}")
                print(f"  Provider: {row[2]}")
                print(f"  Prefix: {row[3]}")
                print(f"  Last4: {row[4]}")
                print(f"  Config: {row[5][:50] if row[5] else 'None'}...")
                print()

                # Vérifier le provider_config
                config = json.loads(row[5]) if row[5] else None
                if config:
                    print("Configuration Supabase:")
                    print(f"  URL: {config.get('url', 'N/A')}")
                    print(f"  Anon Key: {config.get('anonKey', 'N/A')[:20]}...")
                    print(f"  Service Role: {config.get('serviceRoleKey', 'N/A')[:20]}...")

                return True
            else:
                print("[ERREUR] Clé non trouvée après insertion")
                return False

    except Exception as e:
        print(f"[ERREUR] Erreur lors du test: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print()

    success = diagnose_supabase_creation()

    print()
    print("=" * 80)
    print("CONCLUSION")
    print("=" * 80)
    print()

    if success:
        print("[SUCCESS] Le système de création de clés Supabase fonctionne")
        print()
        print("Si vous ne pouvez toujours pas créer de clés dans l'interface:")
        print("  1. Vérifiez que vous êtes connecté (utilisateur authentifié)")
        print("  2. Ouvrez la console du navigateur (F12) pour voir les erreurs")
        print("  3. Vérifiez la console du serveur backend pour les erreurs")
        print("  4. Essayez de rafraîchir la page (Ctrl+Shift+R)")
        sys.exit(0)
    else:
        print("[ECHEC] Le système a des problèmes")
        print()
        print("Solutions possibles:")
        print("  1. Créez un utilisateur via /api/auth/register")
        print("  2. Vérifiez que la table api_keys existe")
        print("  3. Vérifiez les permissions de la base de données")
        sys.exit(1)

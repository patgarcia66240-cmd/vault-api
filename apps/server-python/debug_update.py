import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.apikey import ApiKey
from app.schemas.apikey import ApiKeyCreate
from app.models.apikey import ProviderType

# Simuler une mise à jour
db = SessionLocal()

try:
    # Trouver la clé
    api_key = db.query(ApiKey).filter(ApiKey.id == '7a8b0534-8dcd-4c34-ade7-fb7ef79a2cb2').first()

    if api_key:
        print(f"=== AVANT ===")
        print(f"Nom: {api_key.name}")
        print(f"Provider: {api_key.provider} (type: {type(api_key.provider)})")
        print(f"Prefix: {api_key.prefix}")
        print(f"Last4: {api_key.last4}")

        # Simuler les données du schéma
        api_key_data = ApiKeyCreate(
            name='eleven',
            provider=ProviderType.CUSTOM,
            value='sk_25d7e9a8061625eef2b8f143cb394c7f394e2ec7101d9a44'
        )

        print(f"\n=== DONNÉES REÇUES ===")
        print(f"provider: {api_key_data.provider} (type: {type(api_key_data.provider)})")
        print(f"provider.value: {api_key_data.provider.value if hasattr(api_key_data.provider, 'value') else 'N/A'}")
        print(f"value: {api_key_data.value}")

        # Convertir provider enum en string
        provider_str = api_key_data.provider.value if hasattr(api_key_data.provider, 'value') else api_key_data.provider
        print(f"\nprovider_str: {provider_str}")
        print(f"Condition CUSTOM: {provider_str == 'CUSTOM'}")
        print(f"Condition value: {bool(api_key_data.value)}")
        print(f"Condition complete: {provider_str == 'CUSTOM' and api_key_data.value}")

        # Test de mise à jour
        if provider_str == "CUSTOM" and api_key_data.value:
            print(f"\nCONDITION VERIFIEE - Mise a jour prevue")

            from app.routes.apikeys import get_api_key_parts
            from app.core.security import crypto_manager
            import hashlib

            api_key_plain = api_key_data.value
            prefix, last4 = get_api_key_parts(api_key_plain)
            enc_ciphertext, enc_nonce = crypto_manager.encrypt(api_key_plain)
            api_key_hash = hashlib.sha256(api_key_plain.encode()).hexdigest()

            print(f"Nouveau prefix: {prefix}")
            print(f"Nouveau last4: {last4}")

            # Appliquer les changements
            api_key.name = api_key_data.name
            api_key.provider = provider_str
            api_key.prefix = prefix
            api_key.last4 = last4
            api_key.enc_ciphertext = enc_ciphertext
            api_key.enc_nonce = enc_nonce
            api_key.hash = api_key_hash

            db.commit()
            db.refresh(api_key)

            print(f"\n=== APRÈS ===")
            print(f"Nom: {api_key.name}")
            print(f"Provider: {api_key.provider}")
            print(f"Prefix: {api_key.prefix}")
            print(f"Last4: {api_key.last4}")

            # Vérifier le déchiffrement
            decrypted = crypto_manager.decrypt(api_key.enc_ciphertext, api_key.enc_nonce)
            print(f"Valeur déchiffrée: {decrypted}")

            if decrypted == 'sk_25d7e9a8061625eef2b8f143cb394c7f394e2ec7101d9a44':
                print("\nSUCCES TOTAL ! La cle a ete mise a jour !")
            else:
                print("\nECHEC : La valeur ne correspond pas")

        else:
            print(f"\nCONDITION NON VERIFIEE - Pas de mise a jour")
            print(f"Raison: provider_str={provider_str}, value={api_key_data.value}")

    else:
        print("Clé non trouvée")

finally:
    db.close()

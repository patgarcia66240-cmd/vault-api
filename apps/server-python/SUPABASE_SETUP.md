# Setup Supabase - Vault API

Guide pour configurer et déployer les tables Supabase pour Vault API.

## 📋 Aperçu

Ce projet utilise Supabase PostgreSQL comme base de données. Les tables sont organisées comme suit :

- **`auth.users`** : Table gérée par Supabase pour l'authentification
- **`public.api_keys`** : Clés API des utilisateurs (chiffrées)
- **`public.invoices`** : Facturation Stripe
- **`public.usage_logs`** : Logs d'utilisation API (optionnel)

## 🚀 Installation Rapide

### 1. Installer les dépendances Python

```bash
cd apps/server-python
pip install -r requirements.txt
```

### 2. Configurer les variables d'environnement

Créer ou modifier le fichier `.env` à la racine du projet :

```env
# Base de données Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

# JWT
JWT_SECRET=votre-secret-key

# Crypto (pour chiffrer les API keys)
CRYPTO_MASTER_KEY=votre-cle-master-32-bytes

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Créer les tables Supabase

```bash
python setup_supabase_tables.py
```

Ce script va :
- ✅ Créer toutes les tables dans le schéma `public`
- ✅ Créer les index pour les performances
- ✅ Configurer les triggers `updated_at`
- ✅ Activer le Row Level Security (RLS)
- ✅ Créer les policies de sécurité

### 4. Vérifier les tables

```bash
python setup_supabase_tables.py --check
```

## 📊 Structure des Tables

### `public.api_keys`

Stockage sécurisé des clés API avec chiffrement AES-GCM.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence à `auth.users` |
| `name` | VARCHAR(255) | Nom de la clé API |
| `provider` | ENUM | 'CUSTOM' ou 'SUPABASE' |
| `provider_config` | TEXT | Configuration JSON (optionnel) |
| `prefix` | VARCHAR(10) | Préfixe (ex: "vk_") |
| `last4` | VARCHAR(4) | 4 derniers caractères |
| `enc_ciphertext` | BYTEA | Clé API chiffrée |
| `enc_nonce` | BYTEA | Nonce pour déchiffrement |
| `hash` | VARCHAR(255) | Hash unique (indexé) |
| `revoked` | BOOLEAN | Si la clé est révoquée |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

**Index :**
- `idx_api_keys_user_id` : Recherche par utilisateur
- `idx_api_keys_hash` : Recherche par hash
- `idx_api_keys_revoked` : Filtrer les clés actives

### `public.invoices`

Facturation Stripe.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence à `auth.users` |
| `stripe_invoice_id` | VARCHAR(255) | ID facture Stripe (unique) |
| `amount` | INTEGER | Montant en centimes |
| `currency` | VARCHAR(3) | Devise (défaut: 'usd') |
| `status` | ENUM | 'paid', 'open', 'void', etc. |
| `invoice_pdf` | TEXT | URL du PDF Stripe |
| `hosted_invoice_url` | TEXT | URL de paiement |
| `period_start` | TIMESTAMPTZ | Début période |
| `period_end` | TIMESTAMPTZ | Fin période |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

### `public.usage_logs` (Optionnel)

Journalisation des appels API pour facturation basée sur l'utilisation.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `api_key_id` | UUID | Référence à `public.api_keys` |
| `user_id` | UUID | Référence à `auth.users` |
| `endpoint` | VARCHAR(255) | Endpoint appelé |
| `method` | VARCHAR(10) | Méthode HTTP |
| `status_code` | INTEGER | Code réponse |
| `response_time_ms` | INTEGER | Temps de réponse |
| `created_at` | TIMESTAMPTZ | Date de création |

## 🔒 Sécurité (RLS)

Le Row Level Security est activé sur toutes les tables. Les politiques garantissent que :

- ✅ Les utilisateurs ne peuvent voir que leurs propres API keys
- ✅ Les utilisateurs ne peuvent voir que leurs propres factures
- ✅ Les utilisateurs ne peuvent modifier que leurs propres données

### Vérifier les policies dans Supabase Dashboard

1. Aller dans [Supabase Dashboard](https://app.supabase.com)
2. Sélectionner votre projet
3. Database → Policies
4. Vérifier que les policies sont actives

## 🔧 Scripts Utiles

### Recréer toutes les tables

```bash
python setup_supabase_tables.py --force
```

⚠️ **Attention** : Cela va supprimer et recréer toutes les tables !

### Vérifier les tables existantes

```bash
python setup_supabase_tables.py --check
```

### Supprimer tous les utilisateurs de test

```bash
python delete_test_users.py
```

## 🧪 Tester le Setup

Une fois les tables créées, lancez les tests :

```bash
# Démarrer le serveur
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000

# Dans un autre terminal, tester les routes
python test_all_routes.py
```

Tous les tests devraient passer (7/7) :

```
Total: 7/7 tests reussis
```

## 📝 Notes Importantes

### Chiffrement des API Keys

Les clés API sont chiffrées avec **AES-256-GCM** :
- `enc_ciphertext` : La clé API chiffrée
- `enc_nonce` : Le nonce pour le déchiffrement
- `hash` : SHA-256 pour identification unique

⚠️ **Important** : La clé maître (`CRYPTO_MASTER_KEY`) doit :
- Faire 32 bytes (256 bits)
- Être stockée sécuritairement ( jamais dans le code !)
- Être la même en dev et prod

### Cascade Delete

Lorsqu'un utilisateur est supprimé :
- ✅ Ses API keys sont automatiquement supprimées (`ON DELETE CASCADE`)
- ✅ Ses factures sont automatiquement supprimées
- ✅ Ses logs d'utilisation sont automatiquement supprimés

## 🚨 Dépannage

### Erreur : "relation public.api_keys does not exist"

**Solution** : Exécuter le script de setup

```bash
python setup_supabase_tables.py
```

### Erreur : "permission denied for table auth.users"

**Cause** : L'utilisateur de connexion n'a pas les permissions sur le schéma `auth`

**Solution** : S'assurer que l'utilisateur a les permissions dans Supabase

### Erreur RLS : "permission denied for table api_keys"

**Cause** : Les policies RLS bloquent l'accès

**Solution** : Vérifier que `auth.uid()` correspond bien à `user_id`

## 📚 Ressources

- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org)

## 🎯 Prochaines Étapes

Une fois le setup terminé :

1. ✅ Configurer l'authentification Supabase
2. ✅ Implémenter les routes de facturation Stripe
3. ✅ Ajouter les logs d'utilisation API
4. ✅ Configurer les webhooks Stripe
5. ✅ Mettre en place la rotation des clés API

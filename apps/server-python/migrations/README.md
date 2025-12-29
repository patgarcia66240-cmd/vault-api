# Migration vers Supabase Auth

## Objectif
Migrer de `public.users` vers `auth.users` (système d'authentification Supabase).

## Ce que fait la migration

1. **Crée une table `public.user_profiles`** : Stocke les données supplémentaires (plan, stripe_id) liées aux utilisateurs
2. **Crée un trigger automatique** : Quand un utilisateur est créé dans `auth.users`, un profil est automatiquement créé dans `public.user_profiles`
3. **Crée une vue `public.users`** : Pour compatibilité avec le code existant
4. **Supprime l'ancienne table `public.users`** : ⚠️ Attention, cela supprime toutes les données existantes !

## Comment exécuter la migration

### Option 1: Via le dashboard Supabase (Recommandé)

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans la barre latérale
4. Cliquez sur "New Query"
5. Copiez et collez le contenu du fichier `use_supabase_auth.sql`
6. Cliquez sur "Run" pour exécuter la migration

### Option 2: Via psql en ligne de commande

```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.kxqigfvgfbwcxlpfgmho.supabase.co:5432/postgres" -f migrations/use_supabase_auth.sql
```

## Après la migration

1. **Redémarrez le serveur Python** : Les modèles Python ont été mis à jour pour utiliser `user_profiles`
2. **Testez l'inscription** : Les nouveaux utilisateurs doivent être créés via Supabase Auth
3. **Vérifiez les triggers** : Quand un user est créé dans `auth.users`, un profil doit être créé automatiquement dans `public.user_profiles`

## Structure résultante

```
auth.users (géré par Supabase)
├── id (UUID)
├── email
├── encrypted_password
└── ...

public.user_profiles (nos données supplémentaires)
├── id (UUID) → référence auth.users.id
├── plan (FREE/PRO)
├── stripe_id
└── ...

public.api_keys
├── user_id → référence public.user_profiles.id
└── ...

public.invoices
├── user_id → référence public.user_profiles.id
└── ...
```

## Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
DROP VIEW IF EXISTS public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.user_profiles;

-- Recréer l'ancienne table users (si vous avez une sauvegarde)
-- ...
```

-- =====================================================
-- SCHEMA SUPABASE POUR VAULT API
-- Tables dans le schéma PUBLIC (sauf auth.users géré par Supabase)
-- =====================================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: api_keys
-- Stockage sécurisé des clés API chiffrées
-- =====================================================

CREATE TYPE provider_type AS ENUM ('CUSTOM', 'SUPABASE');

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider provider_type NOT NULL DEFAULT 'CUSTOM',
    provider_config TEXT, -- JSON string pour configuration Supabase
    prefix VARCHAR(10) NOT NULL, -- Préfixe de la clé (ex: "vk_")
    last4 VARCHAR(4) NOT NULL, -- 4 derniers caractères
    enc_ciphertext BYTEA NOT NULL, -- Clé API chiffrée
    enc_nonce BYTEA NOT NULL, -- Nonce pour le déchiffrement
    hash VARCHAR(255) UNIQUE NOT NULL, -- Hash pour identification unique
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON public.api_keys(revoked);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table
COMMENT ON TABLE public.api_keys IS 'Stockage sécurisé des clés API utilisateurs avec chiffrement';
COMMENT ON COLUMN public.api_keys.enc_ciphertext IS 'Clé API chiffrée avec AES-GCM';
COMMENT ON COLUMN public.api_keys.enc_nonce IS 'Nonce utilisé pour le chiffrement/déchiffrement';
COMMENT ON COLUMN public.api_keys.hash IS 'Hash SHA-256 de la clé pour identification unique';


-- =====================================================
-- TABLE: invoices
-- Facturation Stripe
-- =====================================================

CREATE TYPE invoice_status AS ENUM ('paid', 'open', 'void', 'draft', 'uncollectible');

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Montant en centimes
    currency VARCHAR(3) DEFAULT 'usd' NOT NULL,
    status invoice_status NOT NULL,
    invoice_pdf TEXT, -- URL du PDF Stripe
    hosted_invoice_url TEXT, -- URL de la page de paiement
    description TEXT,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON public.invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);

-- Trigger pour updated_at
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table
COMMENT ON TABLE public.invoices IS 'Factures Stripe des utilisateurs';


-- =====================================================
-- TABLE: usage_logs (OPTIONNEL - pour suivi d'utilisation)
-- Journalisation des appels API pour facturation
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER, -- Temps de réponse en millisecondes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour les performances et les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key_id ON public.usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);

-- Partitionnement mensuel recommandé pour les données volumineuses
-- COMMENT ON TABLE public.usage_logs IS 'Logs dutilisation API pour facturation';


-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Sécurité au niveau des lignes
-- =====================================================

-- Activer RLS sur les tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY; -- Si utilisée

-- Politiques RLS pour api_keys
-- Les utilisateurs ne peuvent voir que leurs propres API keys
CREATE POLICY "Users can view own api keys"
    ON public.api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys"
    ON public.api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
    ON public.api_keys
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
    ON public.api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Politiques RLS pour invoices
-- Les utilisateurs ne peuvent voir que leurs propres factures
CREATE POLICY "Users can view own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour compter les API keys actives d'un utilisateur
CREATE OR REPLACE FUNCTION count_active_api_keys(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.api_keys
        WHERE user_id = p_user_id
        AND revoked = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer le total des factures payées d'un utilisateur
CREATE OR REPLACE FUNCTION get_total_paid(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.invoices
        WHERE user_id = p_user_id
        AND status = 'paid'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NETTOYAGE AUTOMATIQUE (OPTIONNEL)
-- Supprimer les logs d'utilisation anciens (plus de 90 jours)
-- =====================================================

-- COMMENT ON TABLE public.usage_logs IS 'Pour activer le nettoyage, décommentez la fonction ci-dessous';

/*
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.usage_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Planifier l'exécution tous les jours via pg_cron ou externe
-- SELECT cron.schedule('cleanup-usage-logs', '0 2 * * *', 'SELECT cleanup_old_usage_logs();');
*/


-- =====================================================
-- VALIDATION ET TESTS
-- =====================================================

-- Vérifier que toutes les tables sont créées
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('api_keys', 'invoices', 'usage_logs')
ORDER BY table_name;

-- Vérifier les index
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('api_keys', 'invoices')
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Migration pour élargir les colonnes prefix et last4 de la table api_keys
-- Cela permet de stocker des prefixes plus longs (ex: clés Google API)

-- Élargir la colonne prefix à VARCHAR(50)
ALTER TABLE public.api_keys
ALTER COLUMN prefix TYPE VARCHAR(50);

-- Élargir la colonne last4 à VARCHAR(10) pour être cohérent
ALTER TABLE public.api_keys
ALTER COLUMN last4 TYPE VARCHAR(10);

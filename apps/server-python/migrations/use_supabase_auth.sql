-- set column type to timestamptz, add default now(), set not null
ALTER TABLE public.user_profiles
  ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE public.user_profiles
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- set existing NULLs to now() before making NOT NULL
UPDATE public.user_profiles
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;
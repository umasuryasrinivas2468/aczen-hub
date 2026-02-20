ALTER TABLE public.punches
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(5);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'punches_verification_code_format'
  ) THEN
    ALTER TABLE public.punches
    ADD CONSTRAINT punches_verification_code_format
    CHECK (verification_code IS NULL OR verification_code ~ '^[A-Z0-9]{5}$');
  END IF;
END
$$;


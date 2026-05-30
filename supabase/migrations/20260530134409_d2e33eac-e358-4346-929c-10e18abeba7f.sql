-- Add status tracking and Stripe session reference to wallet transactions
ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Ensure status is constrained to known values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallet_transactions_status_check'
  ) THEN
    ALTER TABLE public.wallet_transactions
      ADD CONSTRAINT wallet_transactions_status_check
      CHECK (status IN ('pending', 'confirmed', 'failed'));
  END IF;
END $$;

-- Unique index to enable webhook idempotency by Stripe session
CREATE UNIQUE INDEX IF NOT EXISTS wallet_transactions_stripe_session_uidx
  ON public.wallet_transactions (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index for listing user transactions efficiently
CREATE INDEX IF NOT EXISTS wallet_transactions_user_created_idx
  ON public.wallet_transactions (user_id, created_at DESC);

-- Allow the webhook (service role) and the owner to update their own
-- pending transactions (e.g. when the webhook confirms a payment)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wallet_transactions'
      AND policyname = 'Users update own pending tx'
  ) THEN
    CREATE POLICY "Users update own pending tx"
      ON public.wallet_transactions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON public.wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at
  BEFORE UPDATE ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
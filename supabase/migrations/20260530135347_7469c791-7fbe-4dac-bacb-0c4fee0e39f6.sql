-- Garante REPLICA IDENTITY FULL para receber linhas completas no realtime
ALTER TABLE public.wallet_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.wallet_balances REPLICA IDENTITY FULL;

-- Adiciona ao publication do realtime (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallet_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallet_balances'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_balances;
  END IF;
END $$;
-- ============ 1. WALLET SECURITY: read-only for clients ============
DROP POLICY IF EXISTS "Users insert own balance" ON public.wallet_balances;
DROP POLICY IF EXISTS "Users update own balance" ON public.wallet_balances;
REVOKE INSERT, UPDATE, DELETE ON public.wallet_balances FROM authenticated;
REVOKE ALL ON public.wallet_balances FROM anon;
GRANT SELECT ON public.wallet_balances TO authenticated;
GRANT ALL ON public.wallet_balances TO service_role;

DROP POLICY IF EXISTS "Users insert own tx" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users update own pending tx" ON public.wallet_transactions;
REVOKE INSERT, UPDATE, DELETE ON public.wallet_transactions FROM authenticated;
REVOKE ALL ON public.wallet_transactions FROM anon;
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;

-- charge sessions are written by the server too
DROP POLICY IF EXISTS "Users insert own sessions" ON public.charge_sessions;
DROP POLICY IF EXISTS "Users update own sessions" ON public.charge_sessions;
REVOKE INSERT, UPDATE, DELETE ON public.charge_sessions FROM authenticated;
GRANT SELECT ON public.charge_sessions TO authenticated;
GRANT ALL ON public.charge_sessions TO service_role;

-- ============ 2. TRIP PLANS ============
CREATE TABLE public.trip_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  start_soc integer NOT NULL DEFAULT 80,
  stops jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_plans TO authenticated;
GRANT ALL ON public.trip_plans TO service_role;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own trip plans" ON public.trip_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trip plans" ON public.trip_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own trip plans" ON public.trip_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own trip plans" ON public.trip_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trip_plans_updated_at BEFORE UPDATE ON public.trip_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 3. RFID TAGS ============
CREATE TABLE public.rfid_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  serial text NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfid_tags TO authenticated;
GRANT ALL ON public.rfid_tags TO service_role;
ALTER TABLE public.rfid_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tags" ON public.rfid_tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tags" ON public.rfid_tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own tags" ON public.rfid_tags FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own tags" ON public.rfid_tags FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER rfid_tags_updated_at BEFORE UPDATE ON public.rfid_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 4. NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 5. SMARTCAR OAUTH STATE (CSRF) ============
CREATE TABLE public.smartcar_oauth_states (
  state text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.smartcar_oauth_states TO service_role;
ALTER TABLE public.smartcar_oauth_states ENABLE ROW LEVEL SECURITY;
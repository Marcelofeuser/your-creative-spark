
-- =========================================================
-- Helper: updated_at trigger function
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- Plan enum
-- =========================================================
CREATE TYPE public.subscription_plan AS ENUM ('bronze', 'silver', 'gold');

-- =========================================================
-- Profiles
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Vehicles
-- =========================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  plate TEXT,
  battery_kwh NUMERIC(6,2) NOT NULL DEFAULT 60,
  range_km INTEGER NOT NULL DEFAULT 350,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Wallet balance (1 row per user)
-- =========================================================
CREATE TABLE public.wallet_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  plan public.subscription_plan NOT NULL DEFAULT 'bronze',
  plan_renews_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own balance" ON public.wallet_balances
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own balance" ON public.wallet_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own balance" ON public.wallet_balances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER wallet_balances_updated_at
  BEFORE UPDATE ON public.wallet_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Wallet transactions
-- =========================================================
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- 'topup' | 'charge' | 'upgrade' | 'bonus'
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL, -- positive=in, negative=out
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_wallet_tx_user_created ON public.wallet_transactions(user_id, created_at DESC);

CREATE POLICY "Users view own tx" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own tx" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- Charge sessions
-- =========================================================
CREATE TABLE public.charge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  station_address TEXT,
  power_kw NUMERIC(6,2) NOT NULL DEFAULT 50,
  energy_kwh NUMERIC(6,2) NOT NULL DEFAULT 0,
  duration_min INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
ALTER TABLE public.charge_sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_charge_user_started ON public.charge_sessions(user_id, started_at DESC);

CREATE POLICY "Users view own sessions" ON public.charge_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.charge_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.charge_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- =========================================================
-- Bootstrap on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.wallet_balances (user_id, balance_cents, plan)
  VALUES (NEW.id, 0, 'bronze');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

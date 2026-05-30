CREATE TABLE IF NOT EXISTS public.smartcar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  make text,
  model text,
  year integer,
  mode text NOT NULL DEFAULT 'test',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, vehicle_id)
);

-- Auth-only table (tokens are sensitive); never expose to anon
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smartcar_connections TO authenticated;
GRANT ALL ON public.smartcar_connections TO service_role;

ALTER TABLE public.smartcar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own smartcar connections"
  ON public.smartcar_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own smartcar connections"
  ON public.smartcar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own smartcar connections"
  ON public.smartcar_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own smartcar connections"
  ON public.smartcar_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS smartcar_connections_user_idx
  ON public.smartcar_connections (user_id);

CREATE TRIGGER update_smartcar_connections_updated_at
  BEFORE UPDATE ON public.smartcar_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
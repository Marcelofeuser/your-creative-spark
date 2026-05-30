import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMARTCAR_AUTH = "https://auth.smartcar.com/oauth/token";
const SMARTCAR_CONNECT = "https://connect.smartcar.com/oauth/authorize";
const SMARTCAR_API = "https://api.smartcar.com/v2.0";
const DEFAULT_SCOPES = [
  "read_vehicle_info",
  "read_battery",
  "read_charge",
  "read_location",
  "read_odometer",
  "read_vin",
];

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function basicAuthHeader() {
  const id = Deno.env.get("SMARTCAR_CLIENT_ID")!;
  const secret = Deno.env.get("SMARTCAR_CLIENT_SECRET")!;
  return "Basic " + btoa(`${id}:${secret}`);
}

async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch(SMARTCAR_AUTH, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

async function fetchVehicleInfo(accessToken: string, vehicleId: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const res = await fetch(`${SMARTCAR_API}/vehicles/${vehicleId}`, { headers });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; make: string; model: string; year: number }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string };

    // ---- Auth user from JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    // ---- Action: generate connect URL ----
    if (action === "url") {
      const { redirectUri, mode } = body as { redirectUri?: string; mode?: "test" | "live" };
      if (!redirectUri || !/^https?:\/\//.test(redirectUri)) {
        return json({ error: "Invalid redirectUri" }, { status: 400 });
      }
      const state = `${userId}:${crypto.randomUUID()}`;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: Deno.env.get("SMARTCAR_CLIENT_ID")!,
        redirect_uri: redirectUri,
        scope: DEFAULT_SCOPES.join(" "),
        state,
        mode: mode === "live" ? "live" : "test",
      });
      return json({ url: `${SMARTCAR_CONNECT}?${params.toString()}`, state });
    }

    // ---- Action: exchange code ----
    if (action === "exchange") {
      const { code, redirectUri, mode } = body as { code?: string; redirectUri?: string; mode?: string };
      if (!code || !redirectUri) return json({ error: "Missing code/redirectUri" }, { status: 400 });

      const tokens = await exchangeCode(code, redirectUri);
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      // Lista veículos do usuário
      const vehiclesRes = await fetch(`${SMARTCAR_API}/vehicles`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!vehiclesRes.ok) throw new Error("Failed to list vehicles");
      const vehiclesData = await vehiclesRes.json() as { vehicles: string[] };
      if (!vehiclesData.vehicles.length) return json({ error: "Nenhum veículo encontrado" }, { status: 404 });

      // Usa o primeiro veículo (Smartcar test mode geralmente retorna 1)
      const vehicleId = vehiclesData.vehicles[0];
      const info = await fetchVehicleInfo(tokens.access_token, vehicleId);

      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } },
      );
      const { error: upErr } = await admin.from("smartcar_connections").upsert({
        user_id: userId,
        vehicle_id: vehicleId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        mode: mode === "live" ? "live" : "test",
        make: info?.make ?? null,
        model: info?.model ?? null,
        year: info?.year ?? null,
      }, { onConflict: "user_id,vehicle_id" });
      if (upErr) throw upErr;

      return json({ ok: true, vehicleId, make: info?.make, model: info?.model, year: info?.year });
    }

    // ---- Action: disconnect ----
    if (action === "disconnect") {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } },
      );
      await admin.from("smartcar_connections").delete().eq("user_id", userId);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("smartcar-auth error", err);
    return json({ error: (err as Error).message }, { status: 500 });
  }
});
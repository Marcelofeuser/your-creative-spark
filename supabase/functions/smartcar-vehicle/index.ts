import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMARTCAR_API = "https://api.smartcar.com/v2.0";
const SMARTCAR_TOKEN = "https://auth.smartcar.com/oauth/token";

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

async function refreshIfNeeded(admin: any, conn: any) {
  const exp = new Date(conn.expires_at).getTime();
  if (exp - Date.now() > 60_000) return conn.access_token;

  const res = await fetch(SMARTCAR_TOKEN, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: conn.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  const tokens = await res.json();
  const newExpires = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await admin.from("smartcar_connections").update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: newExpires,
  }).eq("id", conn.id);
  return tokens.access_token as string;
}

async function safeGet(token: string, path: string) {
  try {
    const res = await fetch(`${SMARTCAR_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { error: `${res.status}` };
    return await res.json();
  } catch (e) {
    return { error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: conn } = await admin
      .from("smartcar_connections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conn) return json({ connected: false });

    const token = await refreshIfNeeded(admin, conn);
    const vid = conn.vehicle_id;

    const [battery, charge, odometer, location] = await Promise.all([
      safeGet(token, `/vehicles/${vid}/battery`),
      safeGet(token, `/vehicles/${vid}/charge`),
      safeGet(token, `/vehicles/${vid}/odometer`),
      safeGet(token, `/vehicles/${vid}/location`),
    ]);

    return json({
      connected: true,
      vehicle: {
        id: vid, make: conn.make, model: conn.model, year: conn.year, mode: conn.mode,
      },
      battery, charge, odometer, location,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("smartcar-vehicle error", err);
    return json({ error: (err as Error).message }, { status: 500 });
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

type Connector = "CCS2" | "Type 2" | "CHAdeMO";
type Status = "available" | "occupied" | "maintenance";

interface Pin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: Status;
  power: number;
  connector: Connector;
  distance: string;
  price: string;
  available: number;
  total: number;
  wait: string;
}

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function mapConnectorType(t?: string): Connector {
  if (!t) return "CCS2";
  if (t.includes("CHADEMO")) return "CHAdeMO";
  if (t.includes("TYPE_2") || t.includes("J1772")) return "Type 2";
  return "CCS2";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
    return json({ error: "Google Maps connector not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    const radius = Math.min(Math.max(Number(body?.radius ?? 8000), 500), 50000);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json({ error: "lat/lng required" }, { status: 400 });
    }

    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.evChargeOptions",
    ].join(",");

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchNearby`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({
        includedTypes: ["electric_vehicle_charging_station"],
        maxResultCount: 20,
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius },
        },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("places error", res.status, txt);
      return json({ error: "places_failed", status: res.status, detail: txt }, { status: 502 });
    }

    const data = await res.json();
    const places: any[] = data.places ?? [];
    const origin = { lat, lng };

    const pins: Pin[] = places.map((p, i) => {
      const loc = { lat: p.location?.latitude, lng: p.location?.longitude };
      const ev = p.evChargeOptions ?? {};
      const aggs: any[] = ev.connectorAggregation ?? [];
      const total = ev.connectorCount ?? aggs.reduce((s, a) => s + (a.count ?? 0), 0);
      const available = aggs.reduce((s, a) => s + (a.availableCount ?? 0), 0);
      const power = Math.round(
        aggs.reduce((m, a) => Math.max(m, a.maxChargeRateKw ?? 0), 0),
      );
      const connector = mapConnectorType(aggs[0]?.type);
      const status: Status =
        total === 0 ? "available" : available > 0 ? "available" : "occupied";
      const km = haversineKm(origin, loc);
      return {
        id: p.id ?? `p${i}`,
        name: p.displayName?.text ?? "Eletroposto",
        address: p.formattedAddress ?? "—",
        lat: loc.lat,
        lng: loc.lng,
        status,
        power: power || 50,
        connector,
        distance: km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`,
        price: "—",
        available: available ?? 0,
        total: total ?? 0,
        wait: status === "available" ? "imediato" : "—",
      };
    });

    pins.sort((a, b) => haversineKm(origin, a) - haversineKm(origin, b));
    return json({ pins, count: pins.length });
  } catch (err) {
    console.error("nearby-stations error", err);
    return json({ error: (err as Error).message }, { status: 500 });
  }
});
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import type { TripPlan, Stop, Tier, Transaction, WalletState, TripState, LegacyVehicle, UserProfile, AppNotification, ChargeSession } from "./types";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const TRIP_KEY = "drivervolt:trip";
const PLANS_KEY = "drivervolt:plans";
const LEGACY_KEY = "drivervolt:legacy";
const NOTIF_KEY = "drivervolt:notifications";

const defaultStops: Stop[] = [
  { id: "s1", name: "Eletra · Posto Graal Aparecida", km: 168, power: "150kW DC", duration: "22 min", socAfter: 78 },
  { id: "s2", name: "Hyperion · Resende", km: 312, power: "350kW DC", duration: "14 min", socAfter: 82 },
];

const defaultTrip: TripState = {
  origin: "São Paulo, SP",
  destination: "Rio de Janeiro, RJ",
  startSoc: 84,
  stops: defaultStops,
  savedPlans: [],
};

const defaultWallet: WalletState = {
  balance: 0,
  currentTier: "bronze",
  transactions: [],
};

const defaultUser: UserProfile = {
  name: "",
  email: "",
  phone: "",
  vehicle: null,
  onboarded: false,
  prefs: { notifications: true, voiceSearch: true, highContrast: false },
};

const defaultNotifications: AppNotification[] = [
  { id: "n1", type: "charge", title: "Recarga concluída", body: "Verdant Point · 32 kWh em 28 min · R$ 76,80", date: "Há 12 min", read: false },
  { id: "n2", type: "maintenance", title: "Pastilhas de freio", body: "Atrasado em 350 km. Agende inspeção.", date: "Hoje · 09:14", read: false },
  { id: "n3", type: "legal", title: "Multa registrada", body: "Av. Faria Lima · R$ 293,47 · vencimento 30 abr", date: "Ontem", read: true },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

interface Ctx {
  // Auth
  session: Session | null;
  loadingSession: boolean;
  hydrating: boolean;
  signOut: () => Promise<void>;
  // Trip
  trip: TripState;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  setStartSoc: (v: number) => void;
  setStops: (s: Stop[]) => void;
  addStop: () => void;
  removeStop: (id: string) => void;
  loadPlanFromUrl: (params: URLSearchParams) => boolean;
  savePlan: (name: string) => TripPlan;
  deletePlan: (id: string) => void;
  applyPlan: (id: string) => void;
  buildShareUrl: () => string;
  // Wallet
  wallet: WalletState;
  upgradeTier: (tier: Tier) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  topUp: (amountCents: number) => Promise<void>;
  resetWallet: () => void;
  // Legacy vehicle
  legacy: LegacyVehicle | null;
  setLegacy: (v: LegacyVehicle | null) => void;
  // User
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => Promise<void>;
  updatePrefs: (patch: Partial<UserProfile["prefs"]>) => Promise<void>;
  completeOnboarding: (data: { name: string; email: string; vehicle: NonNullable<UserProfile["vehicle"]> }) => Promise<void>;
  logout: () => Promise<void>;
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markNotifRead: (id: string) => void;
  markAllNotifRead: () => void;
  pushNotif: (n: Omit<AppNotification, "id" | "read" | "date">) => void;
  // Charge sessions
  sessions: ChargeSession[];
  addSession: (s: Omit<ChargeSession, "id">) => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

const tierLabel: Record<Tier, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };
const tierPriceCents: Record<Tier, number> = { bronze: 0, silver: 3990, gold: 8990 };

function fmtBRL(cents: number) {
  const v = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${v}`;
}

function fmtDateBR(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return `Hoje · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " +
         d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [trip, setTrip] = useState<TripState>(() => load(TRIP_KEY, defaultTrip));
  const [savedPlans, setSavedPlans] = useState<TripPlan[]>(() => load(PLANS_KEY, [] as TripPlan[]));
  const [wallet, setWallet] = useState<WalletState>(defaultWallet);
  const [legacy, setLegacyState] = useState<LegacyVehicle | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(NOTIF_KEY) : null;
      return raw ? JSON.parse(raw) : defaultNotifications;
    } catch { return defaultNotifications; }
  });
  const [sessions, setSessions] = useState<ChargeSession[]>([]);

  // ------------------- Auth bootstrap -------------------
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ------------------- Hydrate from server when session ready -------------------
  const hydrate = useCallback(async (uid: string, email: string) => {
    // profile
    const { data: profile } = await supabase
      .from("profiles").select("*").eq("user_id", uid).maybeSingle();
    // vehicle
    const { data: vehicles } = await supabase
      .from("vehicles").select("*").eq("user_id", uid).order("is_primary", { ascending: false }).limit(1);
    const vehicle = vehicles?.[0] ?? null;
    // wallet
    const { data: bal } = await supabase
      .from("wallet_balances").select("*").eq("user_id", uid).maybeSingle();
    const { data: txs } = await supabase
      .from("wallet_transactions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50);
    // sessions
    const { data: sess } = await supabase
      .from("charge_sessions").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(50);

    setUser({
      name: profile?.full_name ?? "",
      email,
      phone: profile?.phone ?? "",
      vehicle: vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        year: new Date(vehicle.created_at).getFullYear(),
        batteryKwh: Number(vehicle.battery_kwh),
        rangeKm: vehicle.range_km,
        plate: vehicle.plate ?? "",
      } : null,
      onboarded: !!vehicle,
      prefs: {
        notifications: true,
        voiceSearch: true,
        highContrast: profile?.high_contrast ?? false,
      },
    });

    setWallet({
      balance: bal?.balance_cents ?? 0,
      currentTier: (bal?.plan as Tier) ?? "bronze",
      transactions: (txs ?? []).map((t) => ({
        id: t.id,
        title: t.description,
        date: fmtDateBR(t.created_at),
        value: `${t.amount_cents >= 0 ? "+" : "-"}${fmtBRL(Math.abs(t.amount_cents))}`,
        sign: t.amount_cents >= 0 ? "in" : "out",
      })),
    });

    setSessions((sess ?? []).map((s) => ({
      id: s.id,
      station: s.station_name,
      date: fmtDateBR(s.started_at),
      durationMin: s.duration_min,
      kwh: Number(s.energy_kwh),
      cost: s.cost_cents,
      power: `${s.power_kw}kW`,
      connector: "CCS2",
    })));
  }, []);

  useEffect(() => {
    if (!session) {
      setUser(defaultUser);
      setWallet(defaultWallet);
      setSessions([]);
      return;
    }
    hydrate(session.user.id, session.user.email ?? "");
  }, [session, hydrate]);

  // ------------------- Persist trip/legacy/notif locally -------------------
  useEffect(() => { localStorage.setItem(TRIP_KEY, JSON.stringify({ ...trip, savedPlans: undefined })); }, [trip]);
  useEffect(() => { localStorage.setItem(PLANS_KEY, JSON.stringify(savedPlans)); }, [savedPlans]);
  useEffect(() => {
    if (legacy) localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
    else localStorage.removeItem(LEGACY_KEY);
  }, [legacy]);
  useEffect(() => { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);

  const value = useMemo<Ctx>(() => {
    const uid = session?.user.id;

    const setOrigin = (v: string) => setTrip((t) => ({ ...t, origin: v }));
    const setDestination = (v: string) => setTrip((t) => ({ ...t, destination: v }));
    const setStartSoc = (v: number) => setTrip((t) => ({ ...t, startSoc: v }));
    const setStops = (s: Stop[]) => setTrip((t) => ({ ...t, stops: s }));
    const addStop = () => setTrip((t) => ({
      ...t,
      stops: [...t.stops, {
        id: `s${Date.now()}`,
        name: "Nova parada · Smart Map",
        km: t.stops.length ? t.stops[t.stops.length - 1].km + 90 : 90,
        power: "150kW DC", duration: "20 min", socAfter: 75,
      }],
    }));
    const removeStop = (id: string) => setTrip((t) => ({ ...t, stops: t.stops.filter((s) => s.id !== id) }));

    const buildShareUrl = () => {
      const params = new URLSearchParams();
      params.set("o", trip.origin);
      params.set("d", trip.destination);
      params.set("soc", String(trip.startSoc));
      params.set("s", trip.stops.map((s) => `${s.name}|${s.km}|${s.power}|${s.duration}|${s.socAfter}`).join("~"));
      const base = typeof window !== "undefined" ? `${window.location.origin}/trip` : "/trip";
      return `${base}?${params.toString()}`;
    };

    const loadPlanFromUrl = (params: URLSearchParams) => {
      const o = params.get("o"); const d = params.get("d");
      if (!o || !d) return false;
      const soc = parseInt(params.get("soc") || "80", 10);
      const sRaw = params.get("s") || "";
      const stops: Stop[] = sRaw ? sRaw.split("~").filter(Boolean).map((chunk, i) => {
        const [name, km, power, duration, socAfter] = chunk.split("|");
        return {
          id: `s${i}-${Date.now()}`,
          name: name || "Parada",
          km: parseInt(km || "0", 10),
          power: power || "150kW DC",
          duration: duration || "20 min",
          socAfter: parseInt(socAfter || "75", 10),
        };
      }) : [];
      setTrip((t) => ({ ...t, origin: o, destination: d, startSoc: soc, stops }));
      return true;
    };

    const savePlan = (name: string): TripPlan => {
      const plan: TripPlan = {
        id: `p${Date.now()}`,
        name: name || `${trip.origin} → ${trip.destination}`,
        origin: trip.origin, destination: trip.destination,
        startSoc: trip.startSoc, stops: trip.stops, createdAt: Date.now(),
      };
      setSavedPlans((p) => [plan, ...p]);
      return plan;
    };
    const deletePlan = (id: string) => setSavedPlans((p) => p.filter((x) => x.id !== id));
    const applyPlan = (id: string) => {
      const plan = savedPlans.find((p) => p.id === id);
      if (!plan) return;
      setTrip((t) => ({ ...t, origin: plan.origin, destination: plan.destination, startSoc: plan.startSoc, stops: plan.stops }));
    };

    // ---------------- Wallet (server-backed) ----------------
    const insertTx = async (kind: string, description: string, amountCents: number) => {
      if (!uid) return null;
      const { data, error } = await supabase
        .from("wallet_transactions")
        .insert({ user_id: uid, kind, description, amount_cents: amountCents })
        .select().single();
      if (error) { console.error(error); return null; }
      return data;
    };

    const upgradeTier = async (tier: Tier) => {
      if (!uid) return;
      const cost = tierPriceCents[tier];
      const newBalance = Math.max(0, wallet.balance - cost);
      const { error: e1 } = await supabase
        .from("wallet_balances")
        .update({ plan: tier, balance_cents: newBalance })
        .eq("user_id", uid);
      if (e1) { console.error(e1); return; }
      const tx = await insertTx(
        "upgrade",
        cost ? `Assinatura ${tierLabel[tier]}` : `Plano ${tierLabel[tier]} ativado`,
        cost ? -cost : 0,
      );
      setWallet((w) => ({
        ...w,
        currentTier: tier,
        balance: newBalance,
        transactions: tx ? [{
          id: tx.id, title: tx.description, date: fmtDateBR(tx.created_at),
          value: `${tx.amount_cents >= 0 ? "+" : "-"}${fmtBRL(Math.abs(tx.amount_cents))}`,
          sign: tx.amount_cents >= 0 ? "in" : "out",
        }, ...w.transactions] : w.transactions,
      }));
    };

    const addTransaction = async (tx: Omit<Transaction, "id">) => {
      if (!uid) {
        setWallet((w) => ({ ...w, transactions: [{ ...tx, id: `tx${Date.now()}` }, ...w.transactions] }));
        return;
      }
      const numeric = parseInt(tx.value.replace(/[^\d]/g, ""), 10) || 0;
      const cents = tx.sign === "out" ? -numeric : numeric;
      const row = await insertTx(tx.sign === "out" ? "charge" : "topup", tx.title, cents);
      if (row) {
        setWallet((w) => ({
          ...w,
          transactions: [{
            id: row.id, title: row.description, date: fmtDateBR(row.created_at),
            value: tx.value, sign: tx.sign,
          }, ...w.transactions],
        }));
      }
    };

    const topUp = async (amountCents: number) => {
      if (!uid) {
        setWallet((w) => ({
          ...w, balance: w.balance + amountCents,
          transactions: [{ id: `tx${Date.now()}`, title: "Top-up carteira", date: "Agora", value: `+${fmtBRL(amountCents)}`, sign: "in" }, ...w.transactions],
        }));
        return;
      }
      const newBalance = wallet.balance + amountCents;
      await supabase.from("wallet_balances").update({ balance_cents: newBalance }).eq("user_id", uid);
      const row = await insertTx("topup", "Top-up carteira", amountCents);
      setWallet((w) => ({
        ...w, balance: newBalance,
        transactions: row ? [{
          id: row.id, title: row.description, date: fmtDateBR(row.created_at),
          value: `+${fmtBRL(amountCents)}`, sign: "in",
        }, ...w.transactions] : w.transactions,
      }));
    };

    const resetWallet = () => setWallet(defaultWallet);
    const setLegacy = (v: LegacyVehicle | null) => setLegacyState(v);

    // ---------------- User (server-backed) ----------------
    const updateUser = async (patch: Partial<UserProfile>) => {
      setUser((u) => ({ ...u, ...patch }));
      if (!uid) return;
      const dbPatch: { full_name?: string; phone?: string } = {};
      if (patch.name !== undefined) dbPatch.full_name = patch.name;
      if (patch.phone !== undefined) dbPatch.phone = patch.phone;
      if (Object.keys(dbPatch).length === 0) return;
      const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", uid).maybeSingle();
      if (existing) {
        await supabase.from("profiles").update(dbPatch).eq("user_id", uid);
      } else {
        await supabase.from("profiles").insert({ user_id: uid, ...dbPatch });
      }
    };

    const updatePrefs = async (patch: Partial<UserProfile["prefs"]>) => {
      setUser((u) => ({ ...u, prefs: { ...u.prefs, ...patch } }));
      if (!uid || patch.highContrast === undefined) return;
      await supabase.from("profiles").update({ high_contrast: patch.highContrast }).eq("user_id", uid);
    };

    const completeOnboarding: Ctx["completeOnboarding"] = async (data) => {
      setUser((u) => ({ ...u, ...data, onboarded: true }));
      if (!uid) return;
      await supabase.from("profiles").update({ full_name: data.name }).eq("user_id", uid);
      await supabase.from("vehicles").insert({
        user_id: uid,
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        plate: data.vehicle.plate || null,
        battery_kwh: data.vehicle.batteryKwh,
        range_km: data.vehicle.rangeKm,
        is_primary: true,
      });
    };

    const logout = async () => {
      await supabase.auth.signOut();
      setUser(defaultUser);
      setWallet(defaultWallet);
      setSessions([]);
    };

    const markNotifRead = (id: string) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));
    const markAllNotifRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    const pushNotif: Ctx["pushNotif"] = (n) =>
      setNotifications((ns) => [{ ...n, id: `n${Date.now()}`, date: "Agora", read: false }, ...ns]);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const addSession: Ctx["addSession"] = async (s) => {
      if (!uid) {
        setSessions((arr) => [{ ...s, id: `cs${Date.now()}` }, ...arr]);
        return;
      }
      const { data, error } = await supabase.from("charge_sessions").insert({
        user_id: uid,
        station_name: s.station,
        power_kw: parseFloat(s.power) || 50,
        energy_kwh: s.kwh,
        duration_min: s.durationMin,
        cost_cents: s.cost,
        ended_at: new Date().toISOString(),
      }).select().single();
      if (error) { console.error(error); return; }
      setSessions((arr) => [{
        id: data.id, station: data.station_name, date: fmtDateBR(data.started_at),
        durationMin: data.duration_min, kwh: Number(data.energy_kwh),
        cost: data.cost_cents, power: `${data.power_kw}kW`, connector: s.connector,
      }, ...arr]);
    };

    return {
      session, loadingSession, signOut: logout,
      trip: { ...trip, savedPlans },
      setOrigin, setDestination, setStartSoc, setStops, addStop, removeStop,
      loadPlanFromUrl, savePlan, deletePlan, applyPlan, buildShareUrl,
      wallet, upgradeTier, addTransaction, topUp, resetWallet,
      legacy, setLegacy,
      user, updateUser, updatePrefs, completeOnboarding, logout,
      notifications, unreadCount, markNotifRead, markAllNotifRead, pushNotif,
      sessions, addSession,
    };
  }, [trip, savedPlans, wallet, legacy, user, notifications, sessions, session, loadingSession]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
};

export { fmtBRL, tierLabel, tierPriceCents };

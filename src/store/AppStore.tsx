import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { TripPlan, Stop, Tier, Transaction, WalletState, TripState, LegacyVehicle, UserProfile, AppNotification, ChargeSession } from "./types";

const TRIP_KEY = "drivervolt:trip";
const PLANS_KEY = "drivervolt:plans";
const WALLET_KEY = "drivervolt:wallet";
const LEGACY_KEY = "drivervolt:legacy";
const USER_KEY = "drivervolt:user";
const NOTIF_KEY = "drivervolt:notifications";
const SESSIONS_KEY = "drivervolt:sessions";

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
  balance: 48230,
  currentTier: "silver",
  transactions: [
    { id: "t1", title: "Recarga · Verdant Point", date: "Hoje · 14:32", value: "-R$ 48,20", sign: "out" },
    { id: "t2", title: "Cashback Silver", date: "Ontem · 18:11", value: "+R$ 2,41", sign: "in" },
    { id: "t3", title: "Recarga DC · Eletra Ibirapuera", date: "26 abr · 09:48", value: "-R$ 72,90", sign: "out" },
    { id: "t4", title: "Top-up carteira", date: "24 abr · 21:02", value: "+R$ 200,00", sign: "in" },
  ],
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
  { id: "n4", type: "promo", title: "Cashback Solar atualizado", body: "Você acumulou R$ 84,30 este mês.", date: "26 abr", read: true },
  { id: "n5", type: "system", title: "Smart Grid sugere janela", body: "02h–05h hoje · economia de R$ 18,40", date: "26 abr", read: false },
];

const defaultSessions: ChargeSession[] = [
  { id: "cs1", station: "Verdant Point", date: "Hoje · 14:32", durationMin: 28, kwh: 32, cost: 7680, power: "350kW", connector: "CCS2" },
  { id: "cs2", station: "Eletra Ibirapuera", date: "26 abr · 09:48", durationMin: 42, kwh: 28, cost: 5880, power: "300kW", connector: "Type 2" },
  { id: "cs3", station: "Aether Hub", date: "23 abr · 19:10", durationMin: 35, kwh: 24, cost: 4680, power: "150kW", connector: "CCS2" },
  { id: "cs4", station: "Hyperion Pinheiros", date: "20 abr · 11:25", durationMin: 22, kwh: 18, cost: 4050, power: "180kW", connector: "CCS2" },
  { id: "cs5", station: "GridStation Centro", date: "17 abr · 08:02", durationMin: 18, kwh: 14, cost: 3570, power: "350kW", connector: "CCS2" },
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
  upgradeTier: (tier: Tier) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  topUp: (amountCents: number) => void;
  resetWallet: () => void;
  // Legacy vehicle
  legacy: LegacyVehicle | null;
  setLegacy: (v: LegacyVehicle | null) => void;
  // User
  user: UserProfile;
  updateUser: (patch: Partial<UserProfile>) => void;
  updatePrefs: (patch: Partial<UserProfile["prefs"]>) => void;
  completeOnboarding: (data: { name: string; email: string; vehicle: NonNullable<UserProfile["vehicle"]> }) => void;
  logout: () => void;
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markNotifRead: (id: string) => void;
  markAllNotifRead: () => void;
  pushNotif: (n: Omit<AppNotification, "id" | "read" | "date">) => void;
  // Charge sessions
  sessions: ChargeSession[];
  addSession: (s: Omit<ChargeSession, "id">) => void;
}

const AppCtx = createContext<Ctx | null>(null);

const tierLabel: Record<Tier, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold" };
const tierPriceCents: Record<Tier, number> = { bronze: 0, silver: 3990, gold: 8990 };

function fmtBRL(cents: number) {
  const v = (cents / 100).toFixed(2).replace(".", ",");
  return `R$ ${v}`;
}

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [trip, setTrip] = useState<TripState>(() => load(TRIP_KEY, defaultTrip));
  const [savedPlans, setSavedPlans] = useState<TripPlan[]>(() => load(PLANS_KEY, [] as TripPlan[]));
  const [wallet, setWallet] = useState<WalletState>(() => load(WALLET_KEY, defaultWallet));
  const [legacy, setLegacyState] = useState<LegacyVehicle | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<UserProfile>(() => load(USER_KEY, defaultUser));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(NOTIF_KEY) : null;
      return raw ? JSON.parse(raw) : defaultNotifications;
    } catch {
      return defaultNotifications;
    }
  });
  const [sessions, setSessions] = useState<ChargeSession[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(SESSIONS_KEY) : null;
      return raw ? JSON.parse(raw) : defaultSessions;
    } catch {
      return defaultSessions;
    }
  });

  useEffect(() => {
    localStorage.setItem(TRIP_KEY, JSON.stringify({ ...trip, savedPlans: undefined }));
  }, [trip]);
  useEffect(() => {
    localStorage.setItem(PLANS_KEY, JSON.stringify(savedPlans));
  }, [savedPlans]);
  useEffect(() => {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  }, [wallet]);
  useEffect(() => {
    if (legacy) localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
    else localStorage.removeItem(LEGACY_KEY);
  }, [legacy]);
  useEffect(() => { localStorage.setItem(USER_KEY, JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); }, [sessions]);

  const value = useMemo<Ctx>(() => {
    const setOrigin = (v: string) => setTrip((t) => ({ ...t, origin: v }));
    const setDestination = (v: string) => setTrip((t) => ({ ...t, destination: v }));
    const setStartSoc = (v: number) => setTrip((t) => ({ ...t, startSoc: v }));
    const setStops = (s: Stop[]) => setTrip((t) => ({ ...t, stops: s }));
    const addStop = () =>
      setTrip((t) => ({
        ...t,
        stops: [
          ...t.stops,
          {
            id: `s${Date.now()}`,
            name: "Nova parada · Smart Map",
            km: t.stops.length ? t.stops[t.stops.length - 1].km + 90 : 90,
            power: "150kW DC",
            duration: "20 min",
            socAfter: 75,
          },
        ],
      }));
    const removeStop = (id: string) => setTrip((t) => ({ ...t, stops: t.stops.filter((s) => s.id !== id) }));

    const buildShareUrl = () => {
      const params = new URLSearchParams();
      params.set("o", trip.origin);
      params.set("d", trip.destination);
      params.set("soc", String(trip.startSoc));
      params.set(
        "s",
        trip.stops.map((s) => `${s.name}|${s.km}|${s.power}|${s.duration}|${s.socAfter}`).join("~"),
      );
      const base = typeof window !== "undefined" ? `${window.location.origin}/trip` : "/trip";
      return `${base}?${params.toString()}`;
    };

    const loadPlanFromUrl = (params: URLSearchParams) => {
      const o = params.get("o");
      const d = params.get("d");
      if (!o || !d) return false;
      const soc = parseInt(params.get("soc") || "80", 10);
      const sRaw = params.get("s") || "";
      const stops: Stop[] = sRaw
        ? sRaw.split("~").filter(Boolean).map((chunk, i) => {
            const [name, km, power, duration, socAfter] = chunk.split("|");
            return {
              id: `s${i}-${Date.now()}`,
              name: name || "Parada",
              km: parseInt(km || "0", 10),
              power: power || "150kW DC",
              duration: duration || "20 min",
              socAfter: parseInt(socAfter || "75", 10),
            };
          })
        : [];
      setTrip((t) => ({ ...t, origin: o, destination: d, startSoc: soc, stops }));
      return true;
    };

    const savePlan = (name: string): TripPlan => {
      const plan: TripPlan = {
        id: `p${Date.now()}`,
        name: name || `${trip.origin} → ${trip.destination}`,
        origin: trip.origin,
        destination: trip.destination,
        startSoc: trip.startSoc,
        stops: trip.stops,
        createdAt: Date.now(),
      };
      setSavedPlans((p) => [plan, ...p]);
      return plan;
    };
    const deletePlan = (id: string) => setSavedPlans((p) => p.filter((x) => x.id !== id));
    const applyPlan = (id: string) => {
      const plan = savedPlans.find((p) => p.id === id);
      if (!plan) return;
      setTrip((t) => ({
        ...t,
        origin: plan.origin,
        destination: plan.destination,
        startSoc: plan.startSoc,
        stops: plan.stops,
      }));
    };

    const upgradeTier = (tier: Tier) => {
      setWallet((w) => {
        const cost = tierPriceCents[tier];
        const balance = Math.max(0, w.balance - cost);
        const tx: Transaction = cost
          ? {
              id: `tx${Date.now()}`,
              title: `Assinatura ${tierLabel[tier]}`,
              date: "Agora",
              value: `-${fmtBRL(cost)}`,
              sign: "out",
            }
          : {
              id: `tx${Date.now()}`,
              title: `Plano ${tierLabel[tier]} ativado`,
              date: "Agora",
              value: "R$ 0,00",
              sign: "in",
            };
        return { ...w, currentTier: tier, balance, transactions: [tx, ...w.transactions] };
      });
    };

    const addTransaction = (tx: Omit<Transaction, "id">) =>
      setWallet((w) => ({ ...w, transactions: [{ ...tx, id: `tx${Date.now()}` }, ...w.transactions] }));

    const topUp = (amountCents: number) =>
      setWallet((w) => ({
        ...w,
        balance: w.balance + amountCents,
        transactions: [
          {
            id: `tx${Date.now()}`,
            title: "Top-up carteira",
            date: "Agora",
            value: `+${fmtBRL(amountCents)}`,
            sign: "in",
          },
          ...w.transactions,
        ],
      }));

    const resetWallet = () => setWallet(defaultWallet);
    const setLegacy = (v: LegacyVehicle | null) => setLegacyState(v);

    const updateUser = (patch: Partial<UserProfile>) => setUser((u) => ({ ...u, ...patch }));
    const updatePrefs = (patch: Partial<UserProfile["prefs"]>) =>
      setUser((u) => ({ ...u, prefs: { ...u.prefs, ...patch } }));
    const completeOnboarding: Ctx["completeOnboarding"] = (data) =>
      setUser((u) => ({ ...u, ...data, onboarded: true }));
    const logout = () => setUser(defaultUser);

    const markNotifRead = (id: string) =>
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const markAllNotifRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    const pushNotif: Ctx["pushNotif"] = (n) =>
      setNotifications((ns) => [{ ...n, id: `n${Date.now()}`, date: "Agora", read: false }, ...ns]);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const addSession: Ctx["addSession"] = (s) =>
      setSessions((arr) => [{ ...s, id: `cs${Date.now()}` }, ...arr]);

    return {
      trip: { ...trip, savedPlans },
      setOrigin,
      setDestination,
      setStartSoc,
      setStops,
      addStop,
      removeStop,
      loadPlanFromUrl,
      savePlan,
      deletePlan,
      applyPlan,
      buildShareUrl,
      wallet,
      upgradeTier,
      addTransaction,
      topUp,
      resetWallet,
      legacy,
      setLegacy,
      user,
      updateUser,
      updatePrefs,
      completeOnboarding,
      logout,
      notifications,
      unreadCount,
      markNotifRead,
      markAllNotifRead,
      pushNotif,
      sessions,
      addSession,
    };
  }, [trip, savedPlans, wallet, legacy, user, notifications, sessions]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
};

export { fmtBRL, tierLabel, tierPriceCents };
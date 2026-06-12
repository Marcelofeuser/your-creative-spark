import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Battery, Zap, Search, Navigation, X, Mic, MicOff } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";
import { useApp } from "@/store/AppStore";
import { GoogleStationsMap } from "@/components/drivervolt/GoogleStationsMap";
import { supabase } from "@/integrations/supabase/client";

type Status = "available" | "occupied" | "maintenance";
type Connector = "CCS2" | "Type 2" | "CHAdeMO";

interface Pin {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: Status;
  power: number; // kW
  connector: Connector;
  distance: string;
  price: string;
  available: number;
  total: number;
  wait: string;
}

const fallbackPins: Pin[] = [
  { id: "p1", name: "Verdant Point", address: "Av. Paulista, 1500", lat: -23.5613, lng: -46.6565, status: "available", power: 350, connector: "CCS2", distance: "1.2km", price: "R$ 2,40", available: 6, total: 8, wait: "~4 min" },
  { id: "p2", name: "Aether Hub", address: "R. Augusta, 2200", lat: -23.5556, lng: -46.6629, status: "occupied", power: 150, connector: "CCS2", distance: "4.8km", price: "R$ 1,95", available: 0, total: 4, wait: "~18 min" },
  { id: "p3", name: "Eletra Ibirapuera", address: "Pq. Ibirapuera, Pte 3", lat: -23.5874, lng: -46.6576, status: "available", power: 300, connector: "Type 2", distance: "6.4km", price: "R$ 2,10", available: 4, total: 6, wait: "imediato" },
  { id: "p4", name: "Hyperion Pinheiros", address: "R. dos Pinheiros, 880", lat: -23.5663, lng: -46.6810, status: "available", power: 180, connector: "CCS2", distance: "3.1km", price: "R$ 2,25", available: 3, total: 4, wait: "~2 min" },
  { id: "p5", name: "Volt Vila Olímpia", address: "Vila Olímpia, 410", lat: -23.5955, lng: -46.6868, status: "maintenance", power: 120, connector: "CHAdeMO", distance: "8.0km", price: "—", available: 0, total: 2, wait: "indisponível" },
  { id: "p6", name: "GridStation Centro", address: "Pça. Sé, 90", lat: -23.5505, lng: -46.6333, status: "available", power: 350, connector: "CCS2", distance: "2.6km", price: "R$ 2,55", available: 5, total: 8, wait: "~3 min" },
];

const connectors: ("Todos" | Connector)[] = ["Todos", "CCS2", "Type 2", "CHAdeMO"];
const statuses: ("Todos" | Status)[] = ["Todos", "available", "occupied", "maintenance"];
const powerBands = [
  { id: "all", label: "Toda potência", min: 0 },
  { id: "150", label: "≥ 150kW", min: 150 },
  { id: "300", label: "≥ 300kW (Ultra)", min: 300 },
];

const statusLabel: Record<Status, string> = { available: "Disponível", occupied: "Ocupado", maintenance: "Manutenção" };

const MapPage = () => {
  const { user } = useApp();
  const [query, setQuery] = useState("");
  const [connector, setConnector] = useState<(typeof connectors)[number]>("Todos");
  const [status, setStatus] = useState<(typeof statuses)[number]>("Todos");
  const [power, setPower] = useState<(typeof powerBands)[number]["id"]>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [pins, setPins] = useState<Pin[]>(fallbackPins);
  const [loadingStations, setLoadingStations] = useState(false);

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Reconhecimento de voz não suportado neste navegador");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const r = new SR();
    r.lang = "pt-BR";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => {
      setListening(false);
      toast.error("Não foi possível reconhecer áudio");
    };
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      toast.success(`Buscando: "${text}"`);
    };
    recognitionRef.current = r;
    r.start();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minPower = powerBands.find((p) => p.id === power)?.min ?? 0;
    return pins.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.address.toLowerCase().includes(q)) return false;
      if (connector !== "Todos" && p.connector !== connector) return false;
      if (status !== "Todos" && p.status !== status) return false;
      if (p.power < minPower) return false;
      return true;
    });
  }, [query, connector, status, power]);

  const [selectedId, setSelectedId] = useState<string | null>(pins[0].id);
  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 }
    );
  }, []);

  // Busca eletropostos reais via Google Places (gateway)
  useEffect(() => {
    const center = userLocation ?? { lat: -23.5631, lng: -46.6544 };
    let cancelled = false;
    setLoadingStations(true);
    supabase.functions
      .invoke("nearby-stations", { body: { lat: center.lat, lng: center.lng, radius: 8000 } })
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoadingStations(false);
        if (error || !data?.pins?.length) {
          if (error) toast.error("Não foi possível carregar estações reais — exibindo demo");
          return;
        }
        setPins(data.pins as Pin[]);
        setSelectedId(data.pins[0]?.id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  const statusColor = (s: Status) =>
    s === "available" ? "bg-primary shadow-bloom" : s === "occupied" ? "bg-warning" : "bg-destructive";

  const activeFilters = [
    connector !== "Todos" ? connector : null,
    status !== "Todos" ? statusLabel[status as Status] : null,
    power !== "all" ? powerBands.find((p) => p.id === power)?.label : null,
  ].filter(Boolean);

  return (
    <PageShell title="Smart Map" subtitle="Estações em tempo real">
      {/* Search */}
      <div className="glass-card flex items-center gap-3 px-4 py-3">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar nome ou endereço..."
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Limpar busca" className="text-muted-foreground hover:text-foreground">
            <X size={12} />
          </button>
        )}
        {user.prefs.voiceSearch && (
          <button
            onClick={startVoice}
            aria-label="Buscar por voz"
            className={`transition-colors ${listening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-primary"}`}
          >
            {listening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        )}
        <button
          aria-label="Filtros"
          onClick={() => setFiltersOpen((s) => !s)}
          className={`transition-colors ${filtersOpen || activeFilters.length ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Filter size={14} />
          {activeFilters.length > 0 && <span className="ml-1 text-[10px] font-mono">{activeFilters.length}</span>}
        </button>
      </div>

      {/* Filtros expansíveis */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Conector</p>
                <div className="flex gap-2 flex-wrap">
                  {connectors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setConnector(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        connector === c ? "bg-primary text-primary-foreground" : "glass-card hover:border-primary/30"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Status</p>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        status === s ? "bg-primary text-primary-foreground" : "glass-card hover:border-primary/30"
                      }`}
                    >
                      {s === "Todos" ? "Todos" : statusLabel[s as Status]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Potência</p>
                <div className="flex gap-2 flex-wrap">
                  {powerBands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setPower(b.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        power === b.id ? "bg-primary text-primary-foreground" : "glass-card hover:border-primary/30"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips de filtros ativos */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <span key={String(f)} className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {f}
            </span>
          ))}
          <button
            onClick={() => {
              setConnector("Todos");
              setStatus("Todos");
              setPower("all");
            }}
            className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 text-muted-foreground hover:text-foreground"
          >
            limpar
          </button>
        </div>
      )}

      {/* Mapa */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card aspect-[4/5] relative overflow-hidden"
        aria-label="Mapa de estações"
      >
        <GoogleStationsMap
          pins={filtered.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, status: p.status }))}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          userLocation={userLocation}
        />

        {filtered.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6 bg-background/60 backdrop-blur-sm z-10">
            <div className="space-y-2">
              <Search size={24} className="text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Nenhuma estação encontrada com esses filtros.</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 glass-card px-3 py-2 space-y-1.5 text-[10px] font-mono uppercase tracking-wider z-10 pointer-events-none">
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> Disponível</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-warning" /> Ocupado</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-destructive" /> Manutenção</div>
        </div>

        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground glass-card px-2.5 py-1 z-10 pointer-events-none">
          {loadingStations ? "buscando…" : `${filtered.length} de ${pins.length}`}
        </div>
      </motion.section>

      {/* Card da estação selecionada */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.section
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${statusColor(selected.status)}`} />
                  <h3 className="text-base font-semibold text-foreground truncate">{selected.name}</h3>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-1">
                  {selected.address} · {selected.distance} · {selected.connector}
                </p>
              </div>
              <span className="text-sm font-mono text-primary flex items-center gap-1 flex-shrink-0">
                <Zap size={12} /> {selected.power}kW
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Conectores</p>
                <p className="text-sm font-medium mt-1">{selected.available}/{selected.total}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Preço/kWh</p>
                <p className="text-sm font-medium mt-1">{selected.price}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Espera</p>
                <p className={`text-sm font-medium mt-1 ${selected.status === "available" ? "text-primary" : "text-muted-foreground"}`}>
                  {selected.wait}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(selected.address)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={selected.status === "maintenance"}
                className={`flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow ${selected.status === "maintenance" ? "opacity-40 pointer-events-none" : ""}`}
              >
                <Navigation size={14} strokeWidth={2.5} /> Waze
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.address)}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 glass-card rounded-2xl flex items-center justify-center hover:border-primary/30 transition-colors"
              >
                <Battery size={16} className="text-primary" />
              </a>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 text-center text-sm text-muted-foreground"
          >
            Selecione uma estação no mapa para ver detalhes.
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default MapPage;
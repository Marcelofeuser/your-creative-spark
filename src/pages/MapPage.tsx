import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Battery, Zap, Search, Navigation } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";

interface Pin {
  id: string;
  name: string;
  x: number; // %
  y: number; // %
  status: "available" | "occupied" | "maintenance";
  power: string;
  connector: string;
  distance: string;
}

const pins: Pin[] = [
  { id: "p1", name: "Verdant Point", x: 32, y: 28, status: "available", power: "350kW", connector: "CCS2", distance: "1.2km" },
  { id: "p2", name: "Aether Hub", x: 60, y: 42, status: "occupied", power: "150kW", connector: "CCS2", distance: "4.8km" },
  { id: "p3", name: "Eletra Ibirapuera", x: 48, y: 64, status: "available", power: "300kW", connector: "Type 2", distance: "6.4km" },
  { id: "p4", name: "Hyperion Pinheiros", x: 22, y: 56, status: "available", power: "180kW", connector: "CCS2", distance: "3.1km" },
  { id: "p5", name: "Volt Vila Olímpia", x: 74, y: 24, status: "maintenance", power: "120kW", connector: "CHAdeMO", distance: "8.0km" },
  { id: "p6", name: "GridStation Centro", x: 50, y: 38, status: "available", power: "350kW", connector: "CCS2", distance: "2.6km" },
];

const filters = ["Todos", "CCS2", "Type 2", "CHAdeMO"] as const;

const MapPage = () => {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");
  const [selected, setSelected] = useState<Pin | null>(pins[0]);

  const filtered = pins.filter((p) => filter === "Todos" || p.connector === filter);

  const statusColor = (s: Pin["status"]) =>
    s === "available" ? "bg-primary shadow-bloom" : s === "occupied" ? "bg-warning" : "bg-destructive";

  return (
    <PageShell title="Smart Map" subtitle="Estações em tempo real">
      {/* Search */}
      <div className="glass-card flex items-center gap-3 px-4 py-3">
        <Search size={14} className="text-muted-foreground" />
        <input
          placeholder="Buscar endereço ou estação..."
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button aria-label="Filtros" className="text-muted-foreground hover:text-primary transition-colors">
          <Filter size={14} />
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-bloom-soft"
                : "glass-card hover:border-primary/30"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Mapa mockado */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card aspect-[4/5] relative overflow-hidden"
        aria-label="Mapa de estações"
      >
        {/* Grid topográfico */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        {/* Curvas de elevação */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 500" aria-hidden>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="250" r="180" fill="url(#glow)" />
          <path d="M0,180 Q120,140 220,200 T400,180" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1" fill="none" />
          <path d="M0,260 Q140,220 240,290 T400,270" stroke="hsl(var(--secondary) / 0.2)" strokeWidth="1" fill="none" />
          <path d="M0,360 Q160,320 260,380 T400,360" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" fill="none" />
          {/* Rota sugerida */}
          <path
            d="M 128,140 Q 200,180 240,210 T 192,320"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
          />
        </svg>

        {/* Pins */}
        {filtered.map((pin) => {
          const isSelected = selected?.id === pin.id;
          return (
            <button
              key={pin.id}
              onClick={() => setSelected(pin)}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              aria-label={pin.name}
            >
              <span
                className={`absolute inset-0 -m-2 rounded-full ${statusColor(pin.status)} opacity-30 ${
                  pin.status === "available" ? "animate-pulse-bloom" : ""
                }`}
              />
              <span
                className={`relative block size-3.5 rounded-full ${statusColor(pin.status)} border-2 border-background transition-transform ${
                  isSelected ? "scale-150" : "group-hover:scale-125"
                }`}
              />
            </button>
          );
        })}

        {/* Você está aqui */}
        <div className="absolute left-[42%] top-[44%] -translate-x-1/2 -translate-y-1/2" aria-label="Sua localização">
          <span className="absolute inset-0 -m-3 rounded-full bg-secondary/30 animate-ping" />
          <span className="relative block size-3 rounded-full bg-secondary border-2 border-background shadow-[0_0_12px_hsl(var(--secondary)/0.8)]" />
        </div>

        {/* Legenda */}
        <div className="absolute top-3 right-3 glass-card px-3 py-2 space-y-1.5 text-[10px] font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> Disponível</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-warning" /> Ocupado</div>
          <div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-destructive" /> Manutenção</div>
        </div>
      </motion.section>

      {/* Card da estação selecionada */}
      {selected && (
        <motion.section
          key={selected.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
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
                {selected.distance} · {selected.connector}
              </p>
            </div>
            <span className="text-sm font-mono text-primary flex items-center gap-1 flex-shrink-0">
              <Zap size={12} /> {selected.power}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Conectores</p>
              <p className="text-sm font-medium mt-1">6/8</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Preço</p>
              <p className="text-sm font-medium mt-1">R$ 2,40</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">Espera</p>
              <p className="text-sm font-medium mt-1 text-primary">~4 min</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow">
              <Navigation size={14} strokeWidth={2.5} /> Navegar
            </button>
            <button className="px-4 glass-card rounded-2xl flex items-center justify-center hover:border-primary/30 transition-colors">
              <Battery size={16} className="text-primary" />
            </button>
          </div>
        </motion.section>
      )}
    </PageShell>
  );
};

export default MapPage;

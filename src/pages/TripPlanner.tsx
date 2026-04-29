import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plug, Battery, Clock, Route as RouteIcon, Navigation, Plus, X } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";

interface Stop {
  id: string;
  name: string;
  km: number;
  power: string;
  duration: string;
  socAfter: number;
}

const TripPlanner = () => {
  const [origin, setOrigin] = useState("São Paulo, SP");
  const [destination, setDestination] = useState("Rio de Janeiro, RJ");
  const [startSoc, setStartSoc] = useState(84);
  const [generated, setGenerated] = useState(true);

  const baseStops: Stop[] = [
    { id: "s1", name: "Eletra · Posto Graal Aparecida", km: 168, power: "150kW DC", duration: "22 min", socAfter: 78 },
    { id: "s2", name: "Hyperion · Resende", km: 312, power: "350kW DC", duration: "14 min", socAfter: 82 },
  ];
  const [stops, setStops] = useState<Stop[]>(baseStops);

  const totals = useMemo(() => {
    const distanceKm = 434;
    const driveMin = Math.round((distanceKm / 95) * 60);
    const chargeMin = stops.reduce((s, x) => s + parseInt(x.duration), 0);
    const arriveSoc = 18;
    return { distanceKm, driveMin, chargeMin, arriveSoc };
  }, [stops]);

  const handleGenerate = () => {
    setGenerated(true);
    toast.success("Rota recalculada com paradas otimizadas");
  };

  const removeStop = (id: string) => setStops((s) => s.filter((x) => x.id !== id));
  const addStop = () => {
    setStops((s) => [
      ...s,
      {
        id: `s${Date.now()}`,
        name: "Nova parada · Smart Map",
        km: s.length ? s[s.length - 1].km + 90 : 90,
        power: "150kW DC",
        duration: "20 min",
        socAfter: 75,
      },
    ]);
  };

  return (
    <PageShell title="Trip Planner" subtitle="Algoritmo EV-First">
      {/* Origem / Destino */}
      <section className="glass-card p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary shadow-bloom flex-shrink-0" />
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origem"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="ml-1 h-6 border-l border-dashed border-border" aria-hidden />
          <div className="flex items-center gap-3">
            <MapPin size={12} className="text-secondary flex-shrink-0" />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destino"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="soc" className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              SoC inicial
            </label>
            <span className="text-sm font-mono text-primary tabular-nums">{startSoc}%</span>
          </div>
          <input
            id="soc"
            type="range"
            min={10}
            max={100}
            value={startSoc}
            onChange={(e) => setStartSoc(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow"
        >
          <RouteIcon size={14} strokeWidth={2.5} /> Calcular rota EV
        </button>
      </section>

      {generated && (
        <>
          {/* Resumo */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass-card p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <RouteIcon size={11} />
                <span className="text-[10px] uppercase tracking-widest font-mono">Distância</span>
              </div>
              <p className="text-xl font-light mt-2 font-mono tabular-nums">
                {totals.distanceKm}<span className="text-xs text-muted-foreground ml-1">km</span>
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={11} />
                <span className="text-[10px] uppercase tracking-widest font-mono">Tempo total</span>
              </div>
              <p className="text-xl font-light mt-2 font-mono tabular-nums">
                {Math.floor((totals.driveMin + totals.chargeMin) / 60)}h{(totals.driveMin + totals.chargeMin) % 60}
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Plug size={11} />
                <span className="text-[10px] uppercase tracking-widest font-mono">Recargas</span>
              </div>
              <p className="text-xl font-light mt-2 font-mono tabular-nums">
                {stops.length}<span className="text-xs text-muted-foreground ml-1">paradas</span>
              </p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Battery size={11} />
                <span className="text-[10px] uppercase tracking-widest font-mono">Chegada</span>
              </div>
              <p className="text-xl font-light mt-2 font-mono tabular-nums text-primary">
                {totals.arriveSoc}%
              </p>
            </div>
          </motion.section>

          {/* Timeline de paradas */}
          <section className="space-y-3" aria-labelledby="stops-heading">
            <div className="flex items-center justify-between px-1">
              <h2 id="stops-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Paradas otimizadas
              </h2>
              <button
                onClick={addStop}
                className="text-xs text-primary font-mono flex items-center gap-1 hover:text-primary-glow transition-colors"
              >
                <Plus size={12} /> adicionar
              </button>
            </div>

            <div className="glass-card p-5 space-y-5">
              {/* Origem */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span className="size-3 rounded-full bg-primary shadow-bloom" />
                  <span className="w-px flex-1 bg-border mt-1 min-h-[28px]" />
                </div>
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-medium text-foreground">{origin}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                    Saída · SoC {startSoc}%
                  </p>
                </div>
              </div>

              {stops.map((stop, i) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span className="size-3 rounded-full border-2 border-primary bg-background" />
                    <span className="w-px flex-1 bg-border mt-1 min-h-[40px]" />
                  </div>
                  <div className="flex-1 -mt-1 flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{stop.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                        Km {stop.km} · {stop.power} · {stop.duration}
                      </p>
                      <p className="text-[10px] text-primary font-mono mt-1">→ SoC {stop.socAfter}% após recarga</p>
                    </div>
                    <button
                      onClick={() => removeStop(stop.id)}
                      aria-label="Remover parada"
                      className="size-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Destino */}
              <div className="flex items-start gap-4">
                <div className="size-3 rounded-full bg-secondary shadow-[0_0_10px_hsl(var(--secondary)/0.6)]" />
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-medium text-foreground">{destination}</p>
                  <p className="text-[10px] font-mono text-secondary uppercase tracking-wider mt-0.5">
                    Chegada · SoC {totals.arriveSoc}%
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full glass-card py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 hover:border-primary/30 transition-colors">
              <Navigation size={14} className="text-primary" /> Iniciar navegação no Waze
            </button>
          </section>
        </>
      )}
    </PageShell>
  );
};

export default TripPlanner;

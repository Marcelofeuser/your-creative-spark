import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { MapPin, Plug, Battery, Clock, Route as RouteIcon, Navigation, Plus, X, Save, Share2, Bookmark, Trash2, Check } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";
import { useApp } from "@/store/AppStore";

const TripPlanner = () => {
  const {
    trip,
    setOrigin,
    setDestination,
    setStartSoc,
    addStop,
    removeStop,
    loadPlanFromUrl,
    savePlan,
    deletePlan,
    applyPlan,
    buildShareUrl,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [generated, setGenerated] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [showPlans, setShowPlans] = useState(false);

  // Restaurar via URL
  useEffect(() => {
    if (searchParams.has("o") && searchParams.has("d")) {
      const ok = loadPlanFromUrl(searchParams);
      if (ok) toast.success("Plano restaurado pela URL compartilhada");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const distanceKm = trip.stops.length ? Math.max(...trip.stops.map((s) => s.km)) + 100 : 200;
    const driveMin = Math.round((distanceKm / 95) * 60);
    const chargeMin = trip.stops.reduce((s, x) => s + parseInt(x.duration), 0);
    const arriveSoc = Math.max(15, trip.startSoc - 60 + trip.stops.length * 8);
    return { distanceKm, driveMin, chargeMin, arriveSoc };
  }, [trip.stops, trip.startSoc]);

  const handleGenerate = async () => {
    setCalculating(true);
    await new Promise((r) => setTimeout(r, 600));
    setCalculating(false);
    setGenerated(true);
    toast.success("Rota recalculada com paradas otimizadas");
  };

  const handleSave = () => {
    const plan = savePlan(planName);
    setPlanName("");
    setSaveOpen(false);
    toast.success(`Plano "${plan.name}" salvo`);
  };

  const handleShare = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast(url);
    }
  };

  return (
    <PageShell title="Trip Planner" subtitle="Algoritmo EV-First">
      <section className="glass-card p-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary shadow-bloom flex-shrink-0" />
            <input
              value={trip.origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Origem"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="ml-1 h-6 border-l border-dashed border-border" aria-hidden />
          <div className="flex items-center gap-3">
            <MapPin size={12} className="text-secondary flex-shrink-0" />
            <input
              value={trip.destination}
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
            <span className="text-sm font-mono text-primary tabular-nums">{trip.startSoc}%</span>
          </div>
          <input
            id="soc"
            type="range"
            min={10}
            max={100}
            value={trip.startSoc}
            onChange={(e) => setStartSoc(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={calculating}
          className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow disabled:opacity-60"
        >
          {calculating ? (
            <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <RouteIcon size={14} strokeWidth={2.5} /> Calcular rota EV
            </>
          )}
        </button>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => setSaveOpen(true)}
            className="glass-card py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 hover:border-primary/30 transition-colors"
          >
            <Save size={12} className="text-primary" /> Salvar
          </button>
          <button
            onClick={() => setShowPlans((s) => !s)}
            className="glass-card py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 hover:border-primary/30 transition-colors"
          >
            <Bookmark size={12} className="text-primary" /> Meus ({trip.savedPlans.length})
          </button>
          <button
            onClick={handleShare}
            className="glass-card py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 hover:border-primary/30 transition-colors"
          >
            <Share2 size={12} className="text-primary" /> Compartilhar
          </button>
        </div>
      </section>

      {/* Lista de planos salvos */}
      <AnimatePresence>
        {showPlans && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">
                Planos salvos
              </h3>
              {trip.savedPlans.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3 text-center">
                  Nenhum plano salvo ainda.
                </p>
              ) : (
                trip.savedPlans.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/40 last:border-0">
                    <button
                      onClick={() => {
                        applyPlan(p.id);
                        toast.success(`Plano "${p.name}" carregado`);
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {p.stops.length} paradas · SoC {p.startSoc}%
                      </p>
                    </button>
                    <button
                      onClick={() => deletePlan(p.id)}
                      aria-label="Remover plano"
                      className="size-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {generated && (
        <>
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
                {trip.stops.length}<span className="text-xs text-muted-foreground ml-1">paradas</span>
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
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span className="size-3 rounded-full bg-primary shadow-bloom" />
                  <span className="w-px flex-1 bg-border mt-1 min-h-[28px]" />
                </div>
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-medium text-foreground">{trip.origin}</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                    Saída · SoC {trip.startSoc}%
                  </p>
                </div>
              </div>

              {trip.stops.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  Sem paradas. Sua autonomia cobre o trajeto direto.
                </div>
              )}

              {trip.stops.map((stop, i) => (
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

              <div className="flex items-start gap-4">
                <div className="size-3 rounded-full bg-secondary shadow-[0_0_10px_hsl(var(--secondary)/0.6)]" />
                <div className="flex-1 -mt-1">
                  <p className="text-sm font-medium text-foreground">{trip.destination}</p>
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

      {/* Modal salvar plano */}
      <AnimatePresence>
        {saveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSaveOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-light">Salvar plano</h3>
                <button onClick={() => setSaveOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={`${trip.origin} → ${trip.destination}`}
                autoFocus
                className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
              />
              <button
                onClick={handleSave}
                className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Check size={14} strokeWidth={2.5} /> Salvar plano
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default TripPlanner;
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Fuel, TreeDeciduous, Sparkles, Car, X, Check, Trophy } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp } from "@/store/AppStore";
import { toast } from "sonner";

const KM_PER_KWH = 5.8;
const DEFAULT_FUEL_CONSUMPTION = 11;
const DEFAULT_FUEL_PRICE = 6.19;
const ELECTRIC_PRICE = 1.1; // R$/kWh (média carregamento doméstico+público)
const CO2_PER_LITER = 2.31; // kg
const CO2_PER_TREE_YEAR = 21; // kg/ano

const EcoCalculator = () => {
  const { trip, legacy, setLegacy } = useApp();
  const defaultDistance = trip.stops.length ? Math.max(...trip.stops.map((s) => s.km)) + 100 : 434;
  const [distance, setDistance] = useState<number>(defaultDistance);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [form, setForm] = useState({
    brand: legacy?.brand ?? "",
    model: legacy?.model ?? "",
    year: legacy?.year ?? 2018,
    consumption: legacy?.consumption ?? DEFAULT_FUEL_CONSUMPTION,
    fuelPrice: legacy?.fuelPrice ?? DEFAULT_FUEL_PRICE,
  });

  const fuelCons = legacy?.consumption ?? DEFAULT_FUEL_CONSUMPTION;
  const fuelPrice = legacy?.fuelPrice ?? DEFAULT_FUEL_PRICE;

  const result = useMemo(() => {
    const kwh = distance / KM_PER_KWH;
    const liters = distance / fuelCons;
    const fuelCost = liters * fuelPrice;
    const evCost = kwh * ELECTRIC_PRICE;
    const savings = Math.max(0, fuelCost - evCost);
    const co2Avoided = liters * CO2_PER_LITER;
    const trees = co2Avoided / CO2_PER_TREE_YEAR;
    return { kwh, liters, fuelCost, evCost, savings, co2Avoided, trees };
  }, [distance, fuelCons, fuelPrice]);

  const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });

  const annualSavings = result.savings * (12000 / Math.max(1, distance));

  const saveLegacy = () => {
    if (!form.brand.trim() || !form.model.trim()) {
      toast.error("Preencha marca e modelo");
      return;
    }
    setLegacy({
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      consumption: Number(form.consumption),
      fuelPrice: Number(form.fuelPrice),
    });
    setLegacyOpen(false);
    toast.success("Veículo legado cadastrado · comparativo ativo");
  };

  return (
    <PageShell title="Calculadora Verde" subtitle="CO₂ evitado & economia">
      {/* Legacy Vehicle */}
      <section className="glass-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-bloom opacity-20" aria-hidden />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Car size={16} className="text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Veículo legado</p>
              {legacy ? (
                <p className="text-sm font-medium text-foreground truncate">
                  {legacy.brand} {legacy.model} <span className="text-muted-foreground">· {legacy.year}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Não cadastrado</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setLegacyOpen(true)}
            className="text-xs text-primary font-mono uppercase tracking-wider hover:text-primary-glow"
          >
            {legacy ? "editar" : "cadastrar"}
          </button>
        </div>
      </section>

      {legacy && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-secondary/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-aurora opacity-10" aria-hidden />
          <div className="relative">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Trophy size={14} />
              <span className="text-[10px] uppercase tracking-widest font-mono">Validação de Migração</span>
            </div>
            <p className="text-2xl font-light text-foreground neon-glow tabular-nums">
              R$ {fmt(annualSavings, 2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              economia anual estimada vs <span className="text-foreground">{legacy.brand} {legacy.model}</span> (12.000 km/ano)
            </p>
          </div>
        </motion.section>
      )}

      <section className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="dist" className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Distância da viagem
          </label>
          <span className="text-sm font-mono text-primary tabular-nums">{distance} km</span>
        </div>
        <input
          id="dist"
          type="range"
          min={10}
          max={2000}
          step={10}
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="grid grid-cols-3 gap-2 text-center">
          {[100, 434, 1000].map((q) => (
            <button
              key={q}
              onClick={() => setDistance(q)}
              className="glass-card py-2 text-xs font-mono hover:border-primary/30 transition-colors"
            >
              {q} km
            </button>
          ))}
        </div>
      </section>

      <motion.section
        key={distance}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-secondary">
            <Leaf size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">CO₂ evitado</span>
          </div>
          <p className="text-2xl font-light mt-2 font-mono tabular-nums text-secondary">
            {fmt(result.co2Avoided)}<span className="text-xs ml-1">kg</span>
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-primary">
            <Sparkles size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Economia</span>
          </div>
          <p className="text-2xl font-light mt-2 font-mono tabular-nums text-primary neon-glow">
            R$ {fmt(result.savings, 2)}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Fuel size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">vs Gasolina</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums">
            {fmt(result.liters)}<span className="text-xs text-muted-foreground ml-1">L</span>
          </p>
          <p className="text-[10px] text-muted-foreground/70 font-mono mt-1">R$ {fmt(result.fuelCost, 2)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TreeDeciduous size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Árvores/ano</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums text-secondary">
            {fmt(result.trees, 1)}
          </p>
        </div>
      </motion.section>

      <section className="glass-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Comparativo energético
        </h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-muted-foreground">
                {legacy ? `${legacy.brand} ${legacy.model}` : "Combustão"} · R$ {fmt(result.fuelCost, 2)}
              </span>
              <span className="text-foreground/70">{fmt(result.liters)} L</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-destructive/70" style={{ width: "100%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-primary">EV · R$ {fmt(result.evCost, 2)}</span>
              <span className="text-foreground/70">{fmt(result.kwh)} kWh</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-aurora"
                style={{ width: `${Math.min(100, (result.evCost / result.fuelCost) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary/85 italic leading-relaxed mt-4 text-pretty">
          Esta viagem em modo elétrico equivale ao trabalho anual de{" "}
          <span className="font-semibold not-italic">{fmt(result.trees, 1)} árvores</span> capturando carbono.
        </p>
      </section>

      {/* Modal cadastro legacy */}
      <AnimatePresence>
        {legacyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setLegacyOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Legacy Analytics</p>
                  <h3 className="text-lg font-light mt-1">Carro a combustão</h3>
                </div>
                <button onClick={() => setLegacyOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="Marca"
                  className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                />
                <input
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder="Modelo"
                  className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                />
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                  placeholder="Ano"
                  className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono"
                />
                <input
                  type="number"
                  step="0.1"
                  value={form.consumption}
                  onChange={(e) => setForm((f) => ({ ...f, consumption: Number(e.target.value) }))}
                  placeholder="km/L"
                  className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono"
                />
                <input
                  type="number"
                  step="0.01"
                  value={form.fuelPrice}
                  onChange={(e) => setForm((f) => ({ ...f, fuelPrice: Number(e.target.value) }))}
                  placeholder="R$/L"
                  className="col-span-2 bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono"
                />
              </div>
              <button
                onClick={saveLegacy}
                className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Check size={14} strokeWidth={2.5} /> Salvar comparativo
              </button>
              {legacy && (
                <button
                  onClick={() => {
                    setLegacy(null);
                    setLegacyOpen(false);
                    toast("Veículo removido");
                  }}
                  className="w-full text-xs text-destructive hover:underline"
                >
                  Remover veículo
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default EcoCalculator;
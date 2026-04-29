import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Fuel, TreeDeciduous, Sparkles } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp } from "@/store/AppStore";

const KM_PER_KWH = 5.8;
const FUEL_CONSUMPTION = 11; // km/L
const FUEL_PRICE = 6.19; // R$/L
const ELECTRIC_PRICE = 1.1; // R$/kWh (média carregamento doméstico+público)
const CO2_PER_LITER = 2.31; // kg
const CO2_PER_TREE_YEAR = 21; // kg/ano

const EcoCalculator = () => {
  const { trip } = useApp();
  const defaultDistance = trip.stops.length ? Math.max(...trip.stops.map((s) => s.km)) + 100 : 434;
  const [distance, setDistance] = useState<number>(defaultDistance);

  const result = useMemo(() => {
    const kwh = distance / KM_PER_KWH;
    const liters = distance / FUEL_CONSUMPTION;
    const fuelCost = liters * FUEL_PRICE;
    const evCost = kwh * ELECTRIC_PRICE;
    const savings = Math.max(0, fuelCost - evCost);
    const co2Avoided = liters * CO2_PER_LITER;
    const trees = co2Avoided / CO2_PER_TREE_YEAR;
    return { kwh, liters, fuelCost, evCost, savings, co2Avoided, trees };
  }, [distance]);

  const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });

  return (
    <PageShell title="Calculadora Verde" subtitle="CO₂ evitado & economia">
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
              <span className="text-muted-foreground">Combustão · R$ {fmt(result.fuelCost, 2)}</span>
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
    </PageShell>
  );
};

export default EcoCalculator;
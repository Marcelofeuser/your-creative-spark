import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Filter, Calendar, BatteryCharging } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp, fmtBRL } from "@/store/AppStore";

type Filter = "all" | "fast" | "ultra";

const History = () => {
  const { sessions } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return sessions;
    return sessions.filter((s) => {
      const p = parseInt(s.power);
      if (filter === "fast") return p >= 50 && p < 300;
      return p >= 300;
    });
  }, [sessions, filter]);

  const totals = useMemo(() => {
    const kwh = filtered.reduce((a, b) => a + b.kwh, 0);
    const cost = filtered.reduce((a, b) => a + b.cost, 0);
    const min = filtered.reduce((a, b) => a + b.durationMin, 0);
    return { kwh, cost, min, count: filtered.length };
  }, [filtered]);

  return (
    <PageShell title="Histórico" subtitle="Sessões de recarga">
      {/* Resumo */}
      <section className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BatteryCharging size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Sessões</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums">{totals.count}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Energia</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums text-primary">
            {totals.kwh}<span className="text-xs ml-1">kWh</span>
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Tempo total</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums">
            {Math.floor(totals.min / 60)}h{totals.min % 60}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-[10px] uppercase tracking-widest font-mono">Gasto</span>
          </div>
          <p className="text-xl font-light mt-2 font-mono tabular-nums text-secondary">{fmtBRL(totals.cost)}</p>
        </div>
      </section>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all" as const, label: "Todas" },
          { id: "fast" as const, label: "Fast (50-300kW)" },
          { id: "ultra" as const, label: "Ultra (300kW+)" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
              filter === f.id ? "bg-primary text-primary-foreground" : "glass-card hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <section className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            <Filter size={20} className="mx-auto text-primary/50 mb-2" />
            Nenhuma sessão para este filtro.
          </div>
        ) : (
          filtered.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.station}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.date}</p>
                </div>
                <span className="text-sm font-mono text-secondary tabular-nums">{fmtBRL(s.cost)}</span>
              </div>
              <div className="flex gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <span className="text-primary">{s.kwh}kWh</span>
                <span>·</span>
                <span>{s.durationMin}min</span>
                <span>·</span>
                <span>{s.power}</span>
                <span>·</span>
                <span>{s.connector}</span>
              </div>
            </motion.article>
          ))
        )}
      </section>
    </PageShell>
  );
};

export default History;
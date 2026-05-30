import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Filter, Calendar, BatteryCharging,
  Loader2, AlertCircle, CheckCircle2, CreditCard, Crown, ArrowDownLeft, ArrowUpRight,
} from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp, fmtBRL } from "@/store/AppStore";
import type { Transaction } from "@/store/types";

type SessionFilter = "all" | "fast" | "ultra";
type Tab = "sessions" | "purchases";

function statusBadge(status?: Transaction["status"]) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <Loader2 size={8} className="animate-spin" /> Processando
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
        <AlertCircle size={8} /> Falhou
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
      <CheckCircle2 size={8} /> Confirmado
    </span>
  );
}

function kindIcon(kind?: Transaction["kind"]) {
  if (kind === "subscription" || kind === "upgrade") return <Crown size={14} className="text-primary" />;
  if (kind === "charge") return <Zap size={14} className="text-secondary" />;
  if (kind === "topup") return <ArrowDownLeft size={14} className="text-primary" />;
  return <CreditCard size={14} className="text-foreground/70" />;
}

function fmtFullDateBR(iso?: string, fallback?: string) {
  if (!iso) return fallback ?? "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) +
         " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const History = () => {
  const { sessions, wallet } = useApp();
  const [tab, setTab] = useState<Tab>("sessions");
  const [filter, setFilter] = useState<SessionFilter>("all");

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

  const purchases = wallet.transactions;
  const pendingCount = purchases.filter((t) => t.status === "pending").length;

  return (
    <PageShell title="Histórico" subtitle="Sessões e movimentações">
      {/* Tabs */}
      <div className="flex gap-2 glass-card p-1 rounded-2xl">
        {([
          { id: "sessions" as const, label: "Recargas", count: sessions.length },
          { id: "purchases" as const, label: "Compras", count: purchases.length, dot: pendingCount > 0 },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 py-2.5 text-xs font-medium uppercase tracking-wider rounded-xl transition-all ${
              tab === t.id ? "bg-primary text-primary-foreground shadow-bloom-soft" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="opacity-60 font-mono">· {t.count}</span>
            {t.dot && (
              <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
      {tab === "sessions" ? (
      <motion.div key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
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
      </motion.div>
      ) : (
      <motion.div key="p" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
        {purchases.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            <CreditCard size={20} className="mx-auto text-primary/50 mb-2" />
            Nenhuma compra ainda.
          </div>
        ) : (
          purchases.map((tx, i) => (
            <motion.article
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`glass-card p-4 space-y-2 ${tx.status === "pending" ? "border-amber-500/30" : ""} ${tx.status === "failed" ? "border-destructive/30 opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {kindIcon(tx.kind)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{tx.title}</p>
                      {statusBadge(tx.status)}
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {fmtFullDateBR(tx.rawDate, tx.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-mono tabular-nums flex-shrink-0 ${
                    tx.status === "failed" ? "text-destructive/70 line-through" :
                    tx.status === "pending" ? "text-muted-foreground" :
                    tx.sign === "in" ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {tx.value}
                </span>
              </div>
            </motion.article>
          ))
        )}
      </motion.div>
      )}
      </AnimatePresence>
    </PageShell>
  );
};

export default History;
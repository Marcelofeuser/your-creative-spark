import { useState } from "react";
import { motion } from "framer-motion";
import { Power, Play, Square, Zap, Activity, Wifi, WifiOff, Cpu } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { MOCK_CHARGERS, useOcppSimulator } from "@/hooks/useOcppSimulator";
import type { ChargerStatus } from "@/lib/ocpp";
import { toast } from "sonner";
import { useApp } from "@/store/AppStore";

const STATUS_COLOR: Record<ChargerStatus, string> = {
  Available: "text-primary border-primary/40 bg-primary/10",
  Preparing: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  Charging: "text-secondary border-secondary/40 bg-secondary/10",
  SuspendedEV: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  Finishing: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  Faulted: "text-destructive border-destructive/40 bg-destructive/10",
  Unavailable: "text-muted-foreground border-white/10 bg-muted/30",
};

const OcppSimulator = () => {
  const { user } = useApp();
  const [chargerIdx, setChargerIdx] = useState(0);
  const charger = MOCK_CHARGERS[chargerIdx];
  const sim = useOcppSimulator(charger);
  const idTag = `RFID-${(user.vehicle?.plate || "DRV001").replace(/\s/g, "").toUpperCase()}`;

  const handleConnect = async () => {
    await sim.connect();
    toast.success(`${charger.name} conectado ao CSMS`);
  };

  const handleStart = async () => {
    await sim.startCharging(idTag);
    toast.success("Transação iniciada");
  };

  const handleStop = async () => {
    await sim.stopCharging(idTag);
    toast.success("Sessão salva no histórico");
  };

  const elapsedMin = sim.state.startedAt
    ? Math.max(0, Math.round((Date.now() - sim.state.startedAt) / 60000))
    : 0;

  return (
    <PageShell title="Simulador OCPP" subtitle="OCPP 1.6J · Modo desenvolvedor">
      {/* Status banner */}
      <section
        className={`glass-card p-4 flex items-center justify-between border ${
          sim.connected ? "border-primary/40" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {sim.connected
            ? <Wifi size={16} className="text-primary" />
            : <WifiOff size={16} className="text-muted-foreground" />}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              CSMS WebSocket (simulado)
            </p>
            <p className="text-sm font-medium">
              {sim.connected ? "Conectado" : "Desconectado"}
            </p>
          </div>
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${STATUS_COLOR[sim.state.status]}`}>
          {sim.state.status}
        </span>
      </section>

      {/* Seleção de charger */}
      <section className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono px-1">
          Charge Point
        </p>
        <div className="space-y-2">
          {MOCK_CHARGERS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setChargerIdx(i)}
              disabled={sim.connected && i !== chargerIdx}
              className={`w-full glass-card p-3 text-left flex items-center gap-3 transition-all ${
                i === chargerIdx ? "border-primary/40 shadow-bloom-soft" : "hover:border-white/20"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="size-10 rounded-xl bg-muted/40 border border-white/10 flex items-center justify-center">
                <Cpu size={14} className={i === chargerIdx ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  {c.id} · {c.vendor} {c.model} · {c.maxPowerKw}kW
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Telemetria ao vivo */}
      {sim.state.status === "Charging" && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 grid grid-cols-3 gap-3 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-bloom opacity-30" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Energia</p>
            <p className="text-2xl font-light text-primary mt-1 font-mono tabular-nums">
              {(sim.state.energyWh / 1000).toFixed(2)}
              <span className="text-xs ml-1">kWh</span>
            </p>
          </div>
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Potência</p>
            <p className="text-2xl font-light text-secondary mt-1 font-mono tabular-nums">
              {sim.state.powerKw.toFixed(0)}<span className="text-xs ml-1">kW</span>
            </p>
          </div>
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Tempo</p>
            <p className="text-2xl font-light mt-1 font-mono tabular-nums">
              {elapsedMin}<span className="text-xs ml-1">min</span>
            </p>
          </div>
        </motion.section>
      )}

      {/* Controles */}
      <section className="grid grid-cols-2 gap-2">
        {!sim.connected ? (
          <button
            onClick={handleConnect}
            className="col-span-2 bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Power size={14} strokeWidth={2.5} /> Conectar ao CSMS
          </button>
        ) : sim.state.status === "Available" ? (
          <>
            <button
              onClick={handleStart}
              className="col-span-2 bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Play size={14} strokeWidth={2.5} /> Iniciar transação ({idTag})
            </button>
          </>
        ) : sim.state.status === "Charging" ? (
          <button
            onClick={handleStop}
            className="col-span-2 bg-destructive text-destructive-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Square size={14} strokeWidth={2.5} /> Encerrar transação
          </button>
        ) : (
          <button
            disabled
            className="col-span-2 glass-card py-4 rounded-2xl text-sm flex items-center justify-center gap-2 opacity-60"
          >
            <Activity size={14} className="animate-pulse" /> {sim.state.status}…
          </button>
        )}
        {sim.connected && (
          <button
            onClick={sim.disconnect}
            className="col-span-2 glass-card py-2 rounded-2xl text-xs text-muted-foreground hover:text-foreground"
          >
            Desconectar do CSMS
          </button>
        )}
      </section>

      {/* Console raw OCPP */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Zap size={11} className="text-primary" />
            Console OCPP
          </h2>
          <span className="text-[9px] font-mono text-muted-foreground">{sim.log.length} frames</span>
        </div>
        <div className="glass-card p-3 max-h-96 overflow-auto font-mono text-[10px] space-y-1 bg-background/60">
          {sim.log.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma frame ainda. Conecte para iniciar.
            </p>
          ) : (
            sim.log.map((entry) => (
              <div key={entry.id} className="flex gap-2 border-b border-white/5 pb-1 last:border-0">
                <span className={`flex-shrink-0 ${entry.direction.startsWith("→") ? "text-primary" : "text-secondary"}`}>
                  {entry.direction}
                </span>
                <code className="text-muted-foreground break-all flex-1">{entry.pretty}</code>
              </div>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default OcppSimulator;
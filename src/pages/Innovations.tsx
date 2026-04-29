import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Lightbulb, BatteryCharging, Sun, Zap, Clock, ArrowRight, Check } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";

type Tab = "share" | "rescue" | "grid";

const Innovations = () => {
  const [tab, setTab] = useState<Tab>("share");
  const [sharing, setSharing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "share", label: "Volt-Sharing", icon: Home },
    { id: "rescue", label: "Rescue Move", icon: BatteryCharging },
    { id: "grid", label: "Smart Grid", icon: Sun },
  ];

  const requestRescue = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      setRequested(true);
      toast.success("Powerbank a caminho · ETA 18 min");
    }, 1400);
  };

  return (
    <PageShell title="Inovações" subtitle="Diferenciais DriverVolt">
      <nav className="grid grid-cols-3 gap-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`glass-card py-3 flex flex-col items-center gap-1.5 transition-all ${
                active ? "border-primary/50 shadow-bloom-soft" : "hover:border-white/20"
              }`}
            >
              <t.icon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[9px] font-mono uppercase tracking-wider ${active ? "text-primary" : "text-muted-foreground"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

      {tab === "share" && (
        <motion.section
          key="share"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-bloom opacity-40" aria-hidden />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-mono">Airbnb da recarga</p>
              <h2 className="text-xl font-light mt-1">Volt-Sharing</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Disponibilize seu carregador residencial em horários ociosos e gere renda passiva.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div>
                  <p className="text-2xl font-light font-mono text-primary tabular-nums">R$ 312</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Receita mês</p>
                </div>
                <div>
                  <p className="text-2xl font-light font-mono text-foreground tabular-nums">14</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Sessões</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Carregador residencial</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">22kW AC · Tipo 2</p>
            </div>
            <button
              onClick={() => {
                setSharing((s) => !s);
                toast(sharing ? "Compartilhamento pausado" : "Carregador disponível na rede");
              }}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                sharing ? "bg-primary text-primary-foreground" : "glass-card hover:border-primary/30"
              }`}
            >
              {sharing ? "Ativo" : "Inativo"}
            </button>
          </div>

          <div className="glass-card p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Janela disponível</p>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-primary" />
              <span className="font-mono">22:00 — 06:00</span>
              <span className="text-muted-foreground ml-auto text-[10px] font-mono">Tarifa branca</span>
            </div>
            <div className="text-xs text-muted-foreground">Preço sugerido: <span className="text-primary font-mono">R$ 0,89/kWh</span></div>
          </div>
        </motion.section>
      )}

      {tab === "rescue" && (
        <motion.section
          key="rescue"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-warning/10" aria-hidden />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest text-warning font-mono">Powerbank Móvel</p>
              <h2 className="text-xl font-light mt-1">Rescue Move</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Pane seca? Acionamos uma unidade móvel com bateria suficiente para você chegar ao próximo eletroposto.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recarga emergencial</span>
              <span className="font-mono">15 kWh · ~80km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ETA estimado</span>
              <span className="font-mono text-primary">18 min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Preço</span>
              <span className="font-mono">R$ 0 (Plano Gold) · R$ 89 demais</span>
            </div>
          </div>

          <button
            onClick={requestRescue}
            disabled={requesting || requested}
            className="w-full bg-gradient-to-r from-destructive to-warning text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow disabled:opacity-60"
          >
            {requesting ? (
              <>
                <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Acionando...
              </>
            ) : requested ? (
              <>
                <Check size={14} strokeWidth={2.5} /> Powerbank a caminho
              </>
            ) : (
              <>
                <BatteryCharging size={14} strokeWidth={2.5} /> Acionar resgate
              </>
            )}
          </button>
        </motion.section>
      )}

      {tab === "grid" && (
        <motion.section
          key="grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-aurora opacity-15" aria-hidden />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-widest text-primary font-mono">Smart Grid</p>
              <h2 className="text-xl font-light mt-1">Tarifa otimizada</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Receba sugestões de horários de recarga baseados na tarifa branca e na produção excedente da sua usina solar.
              </p>
            </div>
          </div>

          <div className="glass-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Próximas 24h</p>
            <div className="grid grid-cols-12 gap-1 items-end h-24">
              {Array.from({ length: 24 }).map((_, h) => {
                const cost = h >= 18 && h <= 21 ? 1.2 : h >= 0 && h <= 5 ? 0.4 : 0.7;
                const opt = cost === 0.4;
                return (
                  <div key={h} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm ${opt ? "bg-primary shadow-bloom" : cost > 1 ? "bg-destructive/60" : "bg-muted-foreground/40"}`}
                      style={{ height: `${cost * 60}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </div>

          <div className="glass-card p-5 flex items-start gap-3 border-primary/20">
            <Lightbulb size={16} className="text-primary mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="text-foreground">Melhor janela: <span className="text-primary font-semibold">02:00 — 05:00</span></p>
              <p className="text-muted-foreground mt-1">Economia estimada de <span className="text-primary">R$ 18,40</span> nesta sessão.</p>
            </div>
          </div>

          <button className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
            <Zap size={14} strokeWidth={2.5} /> Agendar recarga inteligente
          </button>
        </motion.section>
      )}
    </PageShell>
  );
};

export default Innovations;
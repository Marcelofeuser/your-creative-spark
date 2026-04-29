import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ScanLine, FileText, AlertTriangle, Calendar, Gauge, Droplet, CircleDot, Camera, Check } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";

interface MaintItem {
  id: string;
  icon: typeof Wrench;
  label: string;
  detail: string;
  status: "ok" | "soon" | "due";
  km: number;
}

const items: MaintItem[] = [
  { id: "tires", icon: CircleDot, label: "Pneus", detail: "Rodízio em 2.300 km", status: "ok", km: 28200 },
  { id: "susp", icon: Gauge, label: "Suspensão", detail: "Inspeção em 8.000 km", status: "ok", km: 28200 },
  { id: "cool", icon: Droplet, label: "Fluido de arrefecimento", detail: "Trocar em 600 km", status: "soon", km: 29800 },
  { id: "brake", icon: Wrench, label: "Pastilhas de freio", detail: "Atrasado · 350 km", status: "due", km: 30350 },
];

const Cockpit = () => {
  const [docs, setDocs] = useState({ cnh: false, crv: false });
  const [scanning, setScanning] = useState<"cnh" | "crv" | null>(null);
  const [fines, setFines] = useState<{ id: string; title: string; value: string; date: string }[]>([]);
  const [ipva, setIpva] = useState<{ value: string; due: string } | null>(null);
  const [loadingFines, setLoadingFines] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setFines([
        { id: "f1", title: "Avanço de sinal · Av. Faria Lima", value: "R$ 293,47", date: "12 abr 2026" },
      ]);
      setIpva({ value: "R$ 1.842,00", due: "30 jun 2026" });
      setLoadingFines(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const scanDoc = (kind: "cnh" | "crv") => {
    setScanning(kind);
    setTimeout(() => {
      setDocs((d) => ({ ...d, [kind]: true }));
      setScanning(null);
      toast.success(`${kind.toUpperCase()} escaneada e validada`);
    }, 1400);
  };

  const statusColor = (s: MaintItem["status"]) =>
    s === "ok" ? "text-primary border-primary/30 bg-primary/10" :
    s === "soon" ? "text-warning border-warning/30 bg-warning/10" :
    "text-destructive border-destructive/30 bg-destructive/10";

  const statusLabel = (s: MaintItem["status"]) =>
    s === "ok" ? "Em dia" : s === "soon" ? "Em breve" : "Atrasado";

  return (
    <PageShell title="Central do Condutor" subtitle="Life Cycle Management">
      {/* Manutenção */}
      <section className="space-y-3" aria-labelledby="maint-heading">
        <h2 id="maint-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Manutenção do veículo
        </h2>
        <div className="space-y-2">
          {items.map((it, i) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <it.icon size={16} className="text-foreground" strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{it.label}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{it.detail}</p>
                </div>
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border ${statusColor(it.status)}`}>
                {statusLabel(it.status)}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Doc Scanner */}
      <section className="space-y-3" aria-labelledby="docs-heading">
        <h2 id="docs-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Doc Scanner
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(["cnh", "crv"] as const).map((kind) => (
            <button
              key={kind}
              onClick={() => scanDoc(kind)}
              disabled={scanning === kind}
              className="glass-card p-5 flex flex-col items-center gap-3 hover:border-primary/30 transition-all disabled:opacity-60"
            >
              <div className={`size-12 rounded-2xl flex items-center justify-center ${docs[kind] ? "bg-primary/20 border border-primary/40" : "bg-muted/50 border border-white/10"}`}>
                {docs[kind] ? (
                  <Check size={18} className="text-primary" strokeWidth={2.5} />
                ) : scanning === kind ? (
                  <ScanLine size={18} className="text-primary animate-pulse" />
                ) : (
                  <Camera size={18} className="text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{kind.toUpperCase()}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {docs[kind] ? "Validada" : scanning === kind ? "Lendo..." : "Toque para escanear"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Multas e IPVA */}
      <section className="space-y-3" aria-labelledby="legal-heading">
        <h2 id="legal-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Legal & impostos
        </h2>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning" />
              <p className="text-sm font-medium text-foreground">Multas pendentes</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Detran-SP</span>
          </div>
          {loadingFines ? (
            <div className="space-y-2">
              <div className="h-12 rounded-xl bg-muted/40 animate-pulse" />
            </div>
          ) : fines.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-3 text-center">Nenhuma multa registrada.</p>
          ) : (
            fines.map((f) => (
              <div key={f.id} className="flex justify-between items-start py-2 border-t border-border/40 first:border-0">
                <div>
                  <p className="text-sm text-foreground">{f.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{f.date}</p>
                </div>
                <span className="text-sm font-mono text-destructive">{f.value}</span>
              </div>
            ))
          )}
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center">
              <FileText size={14} className="text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">IPVA 2026</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5 flex items-center gap-1">
                <Calendar size={10} /> Vence {ipva?.due ?? "..."}
              </p>
            </div>
          </div>
          <span className="text-sm font-mono text-foreground">{ipva?.value ?? "—"}</span>
        </div>
      </section>
    </PageShell>
  );
};

export default Cockpit;
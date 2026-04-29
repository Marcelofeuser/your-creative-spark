import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Zap, Plus, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";

type Tier = "bronze" | "silver" | "gold";

interface Plan {
  id: Tier;
  name: string;
  price: string;
  tagline: string;
  accent: string;
  border: string;
  features: string[];
  cashback: string;
}

const plans: Plan[] = [
  {
    id: "bronze",
    name: "Bronze",
    price: "Grátis",
    tagline: "Comece sua jornada elétrica",
    accent: "from-amber-700/40 to-amber-900/20",
    border: "border-amber-600/30",
    cashback: "0%",
    features: [
      "Acesso ao Smart Map",
      "Pagamento via QR Code",
      "Calculadora Verde básica",
      "Suporte por chat (48h)",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: "R$ 39,90/mês",
    tagline: "Mais economia em cada recarga",
    accent: "from-zinc-300/30 to-zinc-500/10",
    border: "border-zinc-300/40",
    cashback: "5%",
    features: [
      "Tudo do Bronze",
      "5% cashback em recargas",
      "Trip Planner avançado",
      "TAG RFID inclusa",
      "Prioridade em filas",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: "R$ 89,90/mês",
    tagline: "Experiência premium completa",
    accent: "from-primary/30 to-secondary/10",
    border: "border-primary/40",
    cashback: "12%",
    features: [
      "Tudo do Silver",
      "12% cashback em recargas",
      "Rescue Move ilimitado",
      "Acesso DriverVolt Plus Club",
      "Suporte 24/7 dedicado",
      "Smart Grid Integration",
    ],
  },
];

const transactions = [
  { id: "1", title: "Recarga · Verdant Point", date: "Hoje · 14:32", value: "-R$ 48,20", sign: "out" as const },
  { id: "2", title: "Cashback Silver", date: "Ontem · 18:11", value: "+R$ 2,41", sign: "in" as const },
  { id: "3", title: "Recarga DC · Eletra Ibirapuera", date: "26 abr · 09:48", value: "-R$ 72,90", sign: "out" as const },
  { id: "4", title: "Top-up carteira", date: "24 abr · 21:02", value: "+R$ 200,00", sign: "in" as const },
];

const Wallet = () => {
  const [current, setCurrent] = useState<Tier>("silver");
  const [selected, setSelected] = useState<Tier>("gold");

  const handleUpgrade = () => {
    if (selected === current) {
      toast("Você já está neste plano.");
      return;
    }
    setCurrent(selected);
    toast.success(`Plano atualizado para ${plans.find((p) => p.id === selected)?.name} ✨`);
  };

  return (
    <PageShell title="Carteira" subtitle="Saldo & Assinaturas">
      {/* Saldo */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-bloom opacity-50" aria-hidden />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
            Saldo pré-pago
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-light text-foreground neon-glow tabular-nums">R$ 482</span>
            <span className="text-xl font-light text-primary">,30</span>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow">
              <Plus size={14} strokeWidth={2.5} /> Adicionar saldo
            </button>
            <button className="px-4 glass-card rounded-2xl flex items-center justify-center text-sm hover:border-primary/30 transition-colors">
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Plano atual */}
      <section className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-aurora flex items-center justify-center">
            <Crown size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              Plano atual
            </p>
            <p className="text-base font-medium text-foreground">
              {plans.find((p) => p.id === current)?.name}
            </p>
          </div>
        </div>
        <span className="text-xs text-primary font-mono">
          {plans.find((p) => p.id === current)?.cashback} cashback
        </span>
      </section>

      {/* Planos */}
      <section className="space-y-3" aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Escolha seu nível
        </h2>
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const isSelected = selected === plan.id;
            const isCurrent = current === plan.id;
            return (
              <motion.button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className={`w-full text-left glass-card p-5 transition-all relative overflow-hidden ${
                  isSelected ? `${plan.border} shadow-bloom-soft` : "hover:border-white/20"
                }`}
                aria-pressed={isSelected}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.accent} opacity-${isSelected ? "100" : "30"} transition-opacity`} aria-hidden />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                        {isCurrent && (
                          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-foreground">{plan.price}</p>
                      <p className="text-[10px] text-primary font-mono uppercase tracking-wider mt-0.5">
                        {plan.cashback} cashback
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground/85">
                        <Check size={12} className="text-primary flex-shrink-0" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleUpgrade}
          disabled={selected === current}
          className="w-full bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={14} strokeWidth={2.5} />
          {selected === current ? "Plano selecionado" : `Fazer upgrade para ${plans.find((p) => p.id === selected)?.name}`}
        </button>
      </section>

      {/* Histórico */}
      <section className="space-y-3" aria-labelledby="tx-heading">
        <h2 id="tx-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Movimentações recentes
        </h2>
        <div className="glass-card divide-y divide-border/50 overflow-hidden">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-foreground">{tx.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{tx.date}</p>
              </div>
              <span
                className={`text-sm font-mono tabular-nums ${
                  tx.sign === "in" ? "text-primary" : "text-foreground/80"
                }`}
              >
                {tx.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Wallet;

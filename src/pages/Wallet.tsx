import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Zap, Plus, ArrowUpRight, X, Sparkles, Gift, History } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";
import { useApp, fmtBRL, tierLabel } from "@/store/AppStore";
import type { Tier } from "@/store/types";
import { Link, useSearchParams } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

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
    features: ["Acesso ao Smart Map", "Pagamento via QR Code", "Calculadora Verde básica", "Suporte por chat (48h)"],
  },
  {
    id: "silver",
    name: "Silver",
    price: "R$ 39,90/mês",
    tagline: "Mais economia em cada recarga",
    accent: "from-zinc-300/30 to-zinc-500/10",
    border: "border-zinc-300/40",
    cashback: "5%",
    features: ["Tudo do Bronze", "5% cashback em recargas", "Trip Planner avançado", "TAG RFID inclusa", "Prioridade em filas"],
  },
  {
    id: "gold",
    name: "Gold",
    price: "R$ 89,90/mês",
    tagline: "Experiência premium completa",
    accent: "from-primary/30 to-secondary/10",
    border: "border-primary/40",
    cashback: "12%",
    features: ["Tudo do Silver", "12% cashback em recargas", "Rescue Move ilimitado", "Acesso DriverVolt Plus Club", "Suporte 24/7", "Smart Grid Integration"],
  },
];

const TIER_PRICE_ID: Record<Exclude<Tier, "bronze">, string> = {
  silver: "silver_monthly",
  gold: "gold_monthly",
};

const TOPUP_OPTIONS = [
  { value: 5000, bonus: 0, priceId: "topup_50" },
  { value: 10000, bonus: 500, priceId: "topup_100" },
  { value: 20000, bonus: 1500, priceId: "topup_200" },
  { value: 50000, bonus: 5000, priceId: "topup_500" },
] as const;

const Wallet = () => {
  const { wallet } = useApp();
  const [selected, setSelected] = useState<Tier>(wallet.currentTier);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Pagamento confirmado! Atualizando saldo...");
      const t = setTimeout(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("checkout");
        next.delete("session_id");
        setSearchParams(next, { replace: true });
        window.location.reload();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams]);

  const current = wallet.currentTier;

  const handleTopUp = () => setTopUpOpen(true);

  const startTopUp = (priceId: string) => {
    setTopUpOpen(false);
    openCheckout({ priceId });
  };

  const startUpgrade = () => {
    if (selected === "bronze" || selected === current) return;
    const priceId = TIER_PRICE_ID[selected as "silver" | "gold"];
    openCheckout({ priceId });
  };

  return (
    <PageShell title="Carteira" subtitle="Saldo & Assinaturas">
      <PaymentTestModeBanner />
      {/* Saldo */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-bloom opacity-50" aria-hidden />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">Saldo pré-pago</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-light text-foreground neon-glow tabular-nums">
              {fmtBRL(wallet.balance).split(",")[0]}
            </span>
            <span className="text-xl font-light text-primary">,{fmtBRL(wallet.balance).split(",")[1]}</span>
          </div>
          <div className="flex gap-2 mt-5">
            <button
              onClick={handleTopUp}
              className="flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow"
            >
              <Plus size={14} strokeWidth={2.5} /> Adicionar saldo
            </button>
            <button className="px-4 glass-card rounded-2xl flex items-center justify-center text-sm hover:border-primary/30 transition-colors">
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Atalho para histórico de recargas */}
      <Link
        to="/history"
        className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center">
            <History size={14} className="text-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Histórico de recargas</p>
            <p className="text-[10px] font-mono text-muted-foreground">Sessões e consumo detalhado</p>
          </div>
        </div>
        <ArrowUpRight size={14} className="text-primary" />
      </Link>

      {/* Plano atual */}
      <section className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-aurora flex items-center justify-center">
            <Crown size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Plano atual</p>
            <p className="text-base font-medium text-foreground">{tierLabel[current]}</p>
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
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.accent} ${isSelected ? "opacity-100" : "opacity-30"} transition-opacity`} aria-hidden />
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
          onClick={startUpgrade}
          disabled={selected === current}
          className="w-full bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={14} strokeWidth={2.5} />
          {selected === current ? "Plano selecionado" : `Fazer upgrade para ${tierLabel[selected]}`}
        </button>
      </section>

      {/* Histórico */}
      <section className="space-y-3" aria-labelledby="tx-heading">
        <h2 id="tx-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Movimentações recentes
        </h2>
        {wallet.transactions.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            <Sparkles size={20} className="mx-auto text-primary/50 mb-2" />
            Nenhuma movimentação ainda.
          </div>
        ) : (
          <div className="glass-card divide-y divide-border/50 overflow-hidden">
            {wallet.transactions.slice(0, 8).map((tx) => (
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
        )}
      </section>

      {/* Modal Top-up */}
      <AnimatePresence>
        {topUpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setTopUpOpen(false)}
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
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Recarga pré-paga</p>
                  <h3 className="text-lg font-light mt-1">Adicionar saldo + bônus</h3>
                </div>
                <button onClick={() => setTopUpOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TOPUP_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => startTopUp(o.priceId)}
                    className={`glass-card p-4 text-left hover:border-primary/30 transition-all ${o.bonus > 0 ? "border-primary/20" : ""}`}
                  >
                    <p className="text-sm font-medium font-mono">{fmtBRL(o.value)}</p>
                    {o.bonus > 0 ? (
                      <p className="text-[10px] font-mono text-primary uppercase tracking-wider mt-1 flex items-center gap-1">
                        <Gift size={10} /> +{fmtBRL(o.bonus)} bônus
                      </p>
                    ) : (
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">Sem bônus</p>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic text-center">
                Pagamento seguro via cartão (Stripe).
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stripe Embedded Checkout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="glass-card w-full max-w-xl my-8 p-4 space-y-3"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Pagamento</p>
                <button onClick={closeCheckout} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              {checkoutElement}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default Wallet;
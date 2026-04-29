import { motion } from "framer-motion";
import { Sun, Coffee, ShoppingBag, Utensils, Sparkles, ArrowRight, Crown } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp, tierLabel } from "@/store/AppStore";

const partners = [
  { id: "1", name: "Shell Select", icon: Coffee, discount: "15%", category: "Conveniência" },
  { id: "2", name: "Madero Burger", icon: Utensils, discount: "10%", category: "Restaurantes" },
  { id: "3", name: "Renner", icon: ShoppingBag, discount: "8%", category: "Varejo" },
  { id: "4", name: "Starbucks", icon: Coffee, discount: "12%", category: "Cafés" },
];

const PlusClub = () => {
  const { wallet } = useApp();
  const cashbackPct = wallet.currentTier === "gold" ? 12 : wallet.currentTier === "silver" ? 5 : 0;

  return (
    <PageShell title="DriverVolt Plus" subtitle="Clube de benefícios">
      {/* Hero cashback solar */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-aurora opacity-20" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Sun size={14} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Cashback Solar</span>
          </div>
          <p className="text-3xl font-light text-foreground neon-glow">R$ 84,30</p>
          <p className="text-xs text-muted-foreground mt-2">
            Acumulados este mês injetando energia solar excedente na rede DriverVolt.
          </p>
          <div className="mt-4 flex justify-between items-center text-[11px] font-mono">
            <span className="text-muted-foreground">Tarifa atual</span>
            <span className="text-primary tabular-nums">R$ 0,68 / kWh</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "62%" }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-gradient-aurora"
            />
          </div>
        </div>
      </motion.section>

      {/* Plano + cashback */}
      <section className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-aurora flex items-center justify-center">
            <Crown size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Seu plano</p>
            <p className="text-base font-medium">{tierLabel[wallet.currentTier]}</p>
          </div>
        </div>
        <span className="text-sm font-mono text-primary">{cashbackPct}% cashback</span>
      </section>

      {/* Parceiros */}
      <section className="space-y-3" aria-labelledby="partners">
        <h2 id="partners" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Parceiros · descontos progressivos
        </h2>
        <div className="space-y-2">
          {partners.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-12 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center">
                  <p.icon size={16} className="text-foreground" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase mt-0.5">{p.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary tabular-nums">{p.discount}</span>
                <ArrowRight size={14} className="text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="glass-card p-5 flex items-start gap-3 border-primary/20">
        <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-foreground/85 leading-relaxed">
          Atinja <span className="text-primary font-semibold">8 recargas/mês</span> e desbloqueie 5% extra em todos os parceiros.
        </p>
      </div>
    </PageShell>
  );
};

export default PlusClub;
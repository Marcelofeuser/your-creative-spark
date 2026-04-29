import { motion } from "framer-motion";

const stats = [
  { value: "R$ 1.482", label: "Economia estimada", tone: "text-foreground" },
  { value: "42,8 kg", label: "CO₂ restaurado", tone: "text-secondary" },
  { value: "6,4", label: "Árvores equivalentes", tone: "text-foreground" },
  { value: "98%", label: "Bio-eficiência", tone: "text-primary" },
];

export const EcoImpact = () => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    aria-labelledby="eco-heading"
    className="glass-card p-6"
  >
    <h2 id="eco-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6 px-1">
      Impacto no ecossistema
    </h2>

    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
      {stats.map((s) => (
        <div key={s.label} className="px-1">
          <span className={`block text-2xl font-light font-mono ${s.tone} tabular-nums`}>{s.value}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 block">
            {s.label}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/15">
      <p className="text-xs text-primary/85 leading-relaxed italic text-pretty">
        Sua condução silenciosa neste mês compensou a pegada de carbono de uma viagem de 400km pela Mata Atlântica.
      </p>
    </div>
  </motion.section>
);

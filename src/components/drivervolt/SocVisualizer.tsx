import { motion } from "framer-motion";

interface SocVisualizerProps {
  percent: number;
  rangeKm: number;
  status?: string;
}

export const SocVisualizer = ({ percent, rangeKm, status = "Fluxo Ótimo" }: SocVisualizerProps) => {
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card relative aspect-square p-8 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-bloom opacity-60" aria-hidden />
      <div
        className="absolute inset-0 opacity-20 animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.15) 30%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center">
        <div className="relative size-56 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary) / 0.6))" }}
            />
          </svg>

          <div className="size-44 rounded-full border border-primary/15 flex items-center justify-center shadow-[inset_0_0_40px_hsl(var(--primary)/0.12)]">
            <div className="text-center">
              <div className="flex items-baseline justify-center">
                <span className="text-7xl font-light tracking-tighter text-foreground neon-glow tabular-nums">
                  {Math.round(percent)}
                </span>
                <span className="text-2xl font-light text-primary ml-0.5">%</span>
              </div>
              <span className="font-mono text-[10px] text-primary/70 uppercase tracking-[0.25em] mt-2 block">
                Reserva Ativa
              </span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-muted-foreground text-sm tracking-wide font-light">
          <span className="text-foreground font-medium tabular-nums">{rangeKm}km</span>
          <span className="text-border px-3">|</span>
          <span className="text-secondary">{status}</span>
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
        <span className="size-1 rounded-full bg-primary animate-pulse-bloom" />
        <span className="size-1 rounded-full bg-primary/40" />
        <span className="size-1 rounded-full bg-primary/20" />
      </div>
    </motion.section>
  );
};

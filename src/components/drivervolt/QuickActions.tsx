import { motion } from "framer-motion";
import { Zap, Route, Leaf, Sparkles, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Zap, label: "Recarga", to: "/charge", accent: "text-primary" },
  { icon: Route, label: "Rotas", to: "/trip", accent: "text-secondary" },
  { icon: Leaf, label: "Eco", to: "/eco", accent: "text-secondary" },
  { icon: Crown, label: "Plus", to: "/plus", accent: "text-primary" },
  { icon: Sparkles, label: "Inovação", to: "/innovations", accent: "text-secondary" },
];

export const QuickActions = () => (
  <nav aria-label="Ações rápidas" className="grid grid-cols-5 gap-2">
    {actions.map((a, i) => (
      <motion.div
        key={a.label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
      >
        <Link
          to={a.to}
          className="glass-card py-3 px-1 flex flex-col items-center gap-2 transition-all duration-300 active:scale-95 hover:border-primary/30 hover:shadow-bloom-soft group"
        >
          <span className="size-8 rounded-full bg-muted/60 flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-colors">
            <a.icon className={`size-3.5 ${a.accent}`} strokeWidth={1.6} />
          </span>
          <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-foreground/90 text-center">
            {a.label}
          </span>
        </Link>
      </motion.div>
    ))}
  </nav>
);

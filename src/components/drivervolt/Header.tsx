import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex justify-between items-end px-1"
  >
    <div className="space-y-1">
      <p className="text-muted-foreground text-[11px] tracking-[0.25em] uppercase font-medium flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-primary animate-pulse-bloom" />
        Atmosfera estável
      </p>
      <h1 className="text-2xl font-light text-foreground">
        Olá, <span className="font-semibold">Kaelen</span>
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <button
        aria-label="Notificações"
        className="relative size-11 rounded-full glass-card flex items-center justify-center hover:border-primary/30 transition-colors"
      >
        <Bell size={16} className="text-foreground" strokeWidth={1.6} />
        <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-primary shadow-bloom" />
      </button>
      <div className="size-11 rounded-full border border-primary/30 p-0.5 bg-gradient-aurora">
        <div className="size-full rounded-full bg-card flex items-center justify-center font-mono text-sm text-primary">
          K
        </div>
      </div>
    </div>
  </motion.header>
);

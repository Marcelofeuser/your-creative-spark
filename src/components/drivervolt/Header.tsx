import { useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";
import { NotificationsPanel } from "./NotificationsPanel";

export const Header = () => {
  const { user, unreadCount } = useApp();
  const [open, setOpen] = useState(false);
  const firstName = user.name?.split(" ")[0] || "Driver";
  const initial = (user.name || "D").charAt(0).toUpperCase();
  return (
    <>
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
        Olá, <span className="font-semibold">{firstName}</span>
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setOpen(true)}
        aria-label="Notificações"
        className="relative size-11 rounded-full glass-card flex items-center justify-center hover:border-primary/30 transition-colors"
      >
        <Bell size={16} className="text-foreground" strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 text-[9px] font-mono font-semibold rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-bloom">
            {unreadCount}
          </span>
        )}
      </button>
      <Link to="/profile" aria-label="Perfil" className="size-11 rounded-full border border-primary/30 p-0.5 bg-gradient-aurora block">
        <div className="size-full rounded-full bg-card flex items-center justify-center font-mono text-sm text-primary">
          {initial}
        </div>
      </Link>
    </div>
  </motion.header>
    <NotificationsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
};

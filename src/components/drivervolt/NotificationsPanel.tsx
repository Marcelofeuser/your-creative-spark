import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Wrench, FileText, Bell, Sparkles, Check } from "lucide-react";
import { useApp } from "@/store/AppStore";
import type { NotificationType } from "@/store/types";

const iconFor: Record<NotificationType, typeof Zap> = {
  charge: Zap,
  maintenance: Wrench,
  legal: FileText,
  promo: Sparkles,
  system: Bell,
};

const tone: Record<NotificationType, string> = {
  charge: "text-primary bg-primary/15 border-primary/30",
  maintenance: "text-warning bg-warning/15 border-warning/30",
  legal: "text-destructive bg-destructive/15 border-destructive/30",
  promo: "text-secondary bg-secondary/15 border-secondary/30",
  system: "text-foreground bg-muted/40 border-white/10",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({ open, onClose }: Props) => {
  const { notifications, markNotifRead, markAllNotifRead, unreadCount } = useApp();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md max-h-[80vh] flex flex-col"
            role="dialog"
            aria-label="Notificações"
          >
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Notificações</p>
                <h2 className="text-lg font-light">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : "Tudo em dia"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifRead}
                    aria-label="Marcar todas como lidas"
                    className="text-xs text-primary font-mono flex items-center gap-1 hover:text-primary-glow"
                  >
                    <Check size={12} /> ler todas
                  </button>
                )}
                <button onClick={onClose} aria-label="Fechar" className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Nenhuma notificação.
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconFor[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => markNotifRead(n.id)}
                      className={`w-full text-left p-4 flex gap-3 hover:bg-white/5 transition-colors ${
                        !n.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`size-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${tone[n.type]}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                          {!n.read && <span className="size-1.5 rounded-full bg-primary shadow-bloom flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/70 mt-1">{n.date}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import { Home, Map, Zap, Wallet, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/map", icon: Map, label: "Mapa" },
  { to: "/charge", icon: Zap, label: "Recarga" },
  { to: "/cockpit", icon: Wrench, label: "Cockpit" },
  { to: "/wallet", icon: Wallet, label: "Carteira" },
];

export const BottomNav = () => (
  <nav
    aria-label="Navegação principal"
    className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50"
  >
    <div className="glass-card rounded-full px-3 py-2 flex justify-between items-center border-white/15 shadow-card-deep">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === "/"}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive ? "bg-primary/10" : "hover:bg-white/5"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <it.icon
                size={18}
                strokeWidth={1.6}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[9px] uppercase tracking-wider font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary shadow-bloom" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

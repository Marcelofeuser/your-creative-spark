import { Home, Map, Sparkles, User } from "lucide-react";
import { useState } from "react";

const items = [
  { id: "home", icon: Home, label: "Home" },
  { id: "map", icon: Map, label: "Mapa" },
  { id: "plus", icon: Sparkles, label: "Plus" },
  { id: "me", icon: User, label: "Eu" },
];

export const BottomNav = () => {
  const [active, setActive] = useState("home");
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50"
    >
      <div className="glass-card rounded-full px-3 py-2 flex justify-between items-center border-white/15 shadow-card-deep">
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive ? "bg-primary/10" : "hover:bg-white/5"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
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
            </button>
          );
        })}
      </div>
    </nav>
  );
};

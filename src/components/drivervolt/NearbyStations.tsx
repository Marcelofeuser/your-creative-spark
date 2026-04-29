import { motion } from "framer-motion";
import { Battery, MapPin } from "lucide-react";

interface Station {
  id: string;
  name: string;
  distance: string;
  power: string;
  price: string;
  status: "available" | "occupied";
}

const stations: Station[] = [
  { id: "1", name: "Verdant Point", distance: "1.2km", power: "350kW", price: "R$ 2,40/kWh", status: "available" },
  { id: "2", name: "Aether Hub", distance: "4.8km", power: "150kW", price: "R$ 1,95/kWh", status: "occupied" },
  { id: "3", name: "Eletra Ibirapuera", distance: "6.4km", power: "300kW", price: "R$ 2,10/kWh", status: "available" },
];

export const NearbyStations = () => (
  <section aria-labelledby="nearby-heading" className="space-y-3">
    <div className="flex justify-between items-center px-2">
      <h2 id="nearby-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Estações Simbióticas
      </h2>
      <button className="text-xs text-primary hover:text-primary-glow transition-colors font-mono">
        ver mapa →
      </button>
    </div>

    <div className="space-y-2.5">
      {stations.map((s, i) => (
        <motion.article
          key={s.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
          className={`glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:border-primary/20 ${
            s.status === "occupied" ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="size-12 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Battery
                className={s.status === "available" ? "text-primary" : "text-muted-foreground"}
                size={18}
                strokeWidth={1.5}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate">{s.name}</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5">
                <MapPin size={10} /> {s.distance} • {s.power}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <span
              className={`block text-xs font-medium ${
                s.status === "available" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {s.status === "available" ? "Disponível" : "Ocupado"}
            </span>
            <span className="text-[10px] text-muted-foreground/70 font-mono">{s.price}</span>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

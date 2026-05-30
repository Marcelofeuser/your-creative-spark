import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Battery, MapPin, Gauge, Plug, Unplug, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleData {
  connected: boolean;
  vehicle?: { make?: string; model?: string; year?: number; mode?: string };
  battery?: { percentRemaining?: number; range?: number; error?: string };
  charge?: { state?: string; isPluggedIn?: boolean; error?: string };
  odometer?: { distance?: number; error?: string };
  location?: { latitude?: number; longitude?: number; error?: string };
  fetchedAt?: string;
}

export const SmartcarConnect = () => {
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.functions.invoke("smartcar-vehicle");
    setLoading(false);
    if (error) {
      toast.error("Falha ao buscar dados do veículo");
      return;
    }
    setData(res as VehicleData);
  };

  useEffect(() => { refresh(); }, []);

  const connect = async () => {
    const redirectUri = `${window.location.origin}/smartcar/callback`;
    const { data: res, error } = await supabase.functions.invoke("smartcar-auth", {
      body: { action: "url", redirectUri, mode: "test" },
    });
    if (error || !(res as any)?.url) {
      toast.error("Não foi possível iniciar conexão Smartcar");
      return;
    }
    window.location.href = (res as any).url;
  };

  const disconnect = async () => {
    await supabase.functions.invoke("smartcar-auth", { body: { action: "disconnect" } });
    toast.success("Veículo desconectado");
    setData({ connected: false });
  };

  if (!data) {
    return <div className="glass-card p-4 text-xs font-mono text-muted-foreground">Carregando Smartcar…</div>;
  }

  if (!data.connected) {
    return (
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Car size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Conectar via Smartcar (OBD-II)</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Sincronize bateria, odômetro e localização em tempo real.
            </p>
          </div>
        </div>
        <button
          onClick={connect}
          className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plug size={14} /> Conectar veículo
        </button>
        <p className="text-[10px] text-muted-foreground font-mono text-center">
          Modo de teste · sandbox
        </p>
      </section>
    );
  }

  const v = data.vehicle!;
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Car size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{v.year} {v.make} {v.model}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Smartcar · {v.mode}
            </p>
          </div>
        </div>
        <button onClick={refresh} disabled={loading} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center">
          <RefreshCw size={12} className={loading ? "animate-spin text-primary" : "text-muted-foreground"} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Battery size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">SoC</span>
          </div>
          <p className="text-lg font-light text-primary mt-1 font-mono tabular-nums">
            {data.battery?.percentRemaining != null
              ? `${Math.round((data.battery.percentRemaining) * 100)}%`
              : "—"}
          </p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Gauge size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Odômetro</span>
          </div>
          <p className="text-lg font-light mt-1 font-mono tabular-nums">
            {data.odometer?.distance != null
              ? `${Math.round(data.odometer.distance)}km`
              : "—"}
          </p>
        </div>
        <div className="glass-card p-3 col-span-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={11} />
            <span className="text-[10px] uppercase tracking-widest font-mono">Localização</span>
          </div>
          <p className="text-xs font-mono tabular-nums mt-1">
            {data.location?.latitude != null
              ? `${data.location.latitude.toFixed(4)}, ${data.location.longitude?.toFixed(4)}`
              : "—"}
          </p>
        </div>
      </div>

      <button
        onClick={disconnect}
        className="w-full text-xs text-muted-foreground hover:text-destructive py-2 flex items-center justify-center gap-2"
      >
        <Unplug size={12} /> Desconectar
      </button>
    </motion.section>
  );
};
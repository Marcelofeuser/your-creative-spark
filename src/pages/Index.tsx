import { useEffect, useState } from "react";
import { Header } from "@/components/drivervolt/Header";
import { SocVisualizer } from "@/components/drivervolt/SocVisualizer";
import { QuickActions } from "@/components/drivervolt/QuickActions";
import { NearbyStations } from "@/components/drivervolt/NearbyStations";
import { EcoImpact } from "@/components/drivervolt/EcoImpact";
import { BottomNav } from "@/components/drivervolt/BottomNav";
import { useApp } from "@/store/AppStore";
import { Link } from "react-router-dom";
import { History, LifeBuoy } from "lucide-react";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`glass-card animate-pulse ${className}`} />
);

const Index = () => {
  const { trip, user } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // High contrast veicular
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("high-contrast", !!user.prefs.highContrast);
  }, [user.prefs.highContrast]);

  return (
    <main className="min-h-dvh w-full pb-32 pt-6 px-5 sm:px-8 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Header />
        {loading ? (
          <>
            <Skeleton className="aspect-square" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-40" />
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            <SocVisualizer percent={trip.startSoc} rangeKm={Math.round(trip.startSoc * 4.55)} />
            <QuickActions />
            <NearbyStations />
            <EcoImpact />
            <section className="grid grid-cols-2 gap-3">
              <Link to="/history" className="glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <div className="size-9 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center">
                  <History size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Histórico</p>
                  <p className="text-[10px] font-mono text-muted-foreground">Sessões</p>
                </div>
              </Link>
              <Link to="/support" className="glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <div className="size-9 rounded-xl bg-muted/50 border border-white/10 flex items-center justify-center">
                  <LifeBuoy size={14} className="text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Suporte</p>
                  <p className="text-[10px] font-mono text-muted-foreground">FAQ & chat</p>
                </div>
              </Link>
            </section>
          </>
        )}
        <p className="text-center text-[10px] text-muted-foreground/60 font-mono uppercase tracking-[0.3em] pt-2">
          DriverVolt · v1.0 · BR
        </p>
      </div>
      <BottomNav />
    </main>
  );
};

export default Index;

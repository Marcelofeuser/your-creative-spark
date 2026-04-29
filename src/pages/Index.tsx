import { useEffect, useState } from "react";
import { Header } from "@/components/drivervolt/Header";
import { SocVisualizer } from "@/components/drivervolt/SocVisualizer";
import { QuickActions } from "@/components/drivervolt/QuickActions";
import { NearbyStations } from "@/components/drivervolt/NearbyStations";
import { EcoImpact } from "@/components/drivervolt/EcoImpact";
import { BottomNav } from "@/components/drivervolt/BottomNav";
import { useApp } from "@/store/AppStore";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`glass-card animate-pulse ${className}`} />
);

const Index = () => {
  const { trip } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

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

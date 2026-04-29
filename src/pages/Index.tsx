import { Header } from "@/components/drivervolt/Header";
import { SocVisualizer } from "@/components/drivervolt/SocVisualizer";
import { QuickActions } from "@/components/drivervolt/QuickActions";
import { NearbyStations } from "@/components/drivervolt/NearbyStations";
import { EcoImpact } from "@/components/drivervolt/EcoImpact";
import { BottomNav } from "@/components/drivervolt/BottomNav";

const Index = () => {
  return (
    <main className="min-h-dvh w-full pb-32 pt-6 px-5 sm:px-8 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Header />
        <SocVisualizer percent={84} rangeKm={382} />
        <QuickActions />
        <NearbyStations />
        <EcoImpact />
        <p className="text-center text-[10px] text-muted-foreground/60 font-mono uppercase tracking-[0.3em] pt-2">
          DriverVolt · v1.0 · BR
        </p>
      </div>
      <BottomNav />
    </main>
  );
};

export default Index;

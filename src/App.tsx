import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Wallet from "./pages/Wallet.tsx";
import TripPlanner from "./pages/TripPlanner.tsx";
import MapPage from "./pages/MapPage.tsx";
import EcoCalculator from "./pages/EcoCalculator.tsx";
import Charge from "./pages/Charge.tsx";
import Cockpit from "./pages/Cockpit.tsx";
import PlusClub from "./pages/PlusClub.tsx";
import Innovations from "./pages/Innovations.tsx";
import { AppStoreProvider } from "./store/AppStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/trip" element={<TripPlanner />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/eco" element={<EcoCalculator />} />
            <Route path="/charge" element={<Charge />} />
            <Route path="/cockpit" element={<Cockpit />} />
            <Route path="/plus" element={<PlusClub />} />
            <Route path="/innovations" element={<Innovations />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

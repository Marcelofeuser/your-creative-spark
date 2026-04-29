import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ReactNode } from "react";
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
import Onboarding from "./pages/Onboarding.tsx";
import Profile from "./pages/Profile.tsx";
import History from "./pages/History.tsx";
import Support from "./pages/Support.tsx";
import { AppStoreProvider, useApp } from "./store/AppStore";

const queryClient = new QueryClient();

const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const { user } = useApp();
  const location = useLocation();
  if (!user.onboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<RequireOnboarding><Index /></RequireOnboarding>} />
            <Route path="/wallet" element={<RequireOnboarding><Wallet /></RequireOnboarding>} />
            <Route path="/trip" element={<RequireOnboarding><TripPlanner /></RequireOnboarding>} />
            <Route path="/map" element={<RequireOnboarding><MapPage /></RequireOnboarding>} />
            <Route path="/eco" element={<RequireOnboarding><EcoCalculator /></RequireOnboarding>} />
            <Route path="/charge" element={<RequireOnboarding><Charge /></RequireOnboarding>} />
            <Route path="/cockpit" element={<RequireOnboarding><Cockpit /></RequireOnboarding>} />
            <Route path="/plus" element={<RequireOnboarding><PlusClub /></RequireOnboarding>} />
            <Route path="/innovations" element={<RequireOnboarding><Innovations /></RequireOnboarding>} />
            <Route path="/profile" element={<RequireOnboarding><Profile /></RequireOnboarding>} />
            <Route path="/history" element={<RequireOnboarding><History /></RequireOnboarding>} />
            <Route path="/support" element={<RequireOnboarding><Support /></RequireOnboarding>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

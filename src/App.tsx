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
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Profile from "./pages/Profile.tsx";
import History from "./pages/History.tsx";
import Support from "./pages/Support.tsx";
import { AppStoreProvider, useApp } from "./store/AppStore";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { session, loadingSession } = useApp();
  const location = useLocation();
  if (loadingSession) {
    return <div className="min-h-dvh flex items-center justify-center text-xs font-mono text-muted-foreground">Carregando…</div>;
  }
  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

const RequireOnboarding = ({ children }: { children: ReactNode }) => {
  const { user, hydrating, session } = useApp();
  const location = useLocation();
  // Aguarda hidratação do servidor antes de decidir, para não redirecionar
  // incorretamente em reload de rota direta.
  if (session && hydrating) {
    return <div className="min-h-dvh flex items-center justify-center text-xs font-mono text-muted-foreground">Carregando perfil…</div>;
  }
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<RequireAuth><RequireOnboarding><Index /></RequireOnboarding></RequireAuth>} />
            <Route path="/wallet" element={<RequireAuth><RequireOnboarding><Wallet /></RequireOnboarding></RequireAuth>} />
            <Route path="/trip" element={<RequireAuth><RequireOnboarding><TripPlanner /></RequireOnboarding></RequireAuth>} />
            <Route path="/map" element={<RequireAuth><RequireOnboarding><MapPage /></RequireOnboarding></RequireAuth>} />
            <Route path="/eco" element={<RequireAuth><RequireOnboarding><EcoCalculator /></RequireOnboarding></RequireAuth>} />
            <Route path="/charge" element={<RequireAuth><RequireOnboarding><Charge /></RequireOnboarding></RequireAuth>} />
            <Route path="/cockpit" element={<RequireAuth><RequireOnboarding><Cockpit /></RequireOnboarding></RequireAuth>} />
            <Route path="/plus" element={<RequireAuth><RequireOnboarding><PlusClub /></RequireOnboarding></RequireAuth>} />
            <Route path="/innovations" element={<RequireAuth><RequireOnboarding><Innovations /></RequireOnboarding></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><RequireOnboarding><Profile /></RequireOnboarding></RequireAuth>} />
            <Route path="/history" element={<RequireAuth><RequireOnboarding><History /></RequireOnboarding></RequireAuth>} />
            <Route path="/support" element={<RequireAuth><RequireOnboarding><Support /></RequireOnboarding></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

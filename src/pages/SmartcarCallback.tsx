import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SmartcarCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Conectando ao seu veículo...");

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      toast.error(`Smartcar: ${error}`);
      navigate("/cockpit", { replace: true });
      return;
    }
    if (!code) {
      navigate("/cockpit", { replace: true });
      return;
    }
    const redirectUri = `${window.location.origin}/smartcar/callback`;
    supabase.functions
      .invoke("smartcar-auth", { body: { action: "exchange", code, redirectUri, mode: "test" } })
      .then(({ data, error }) => {
        if (error || (data as any)?.error) {
          toast.error("Falha ao conectar Smartcar");
          setStatus("Erro na conexão");
        } else {
          toast.success(`Veículo conectado: ${(data as any).make ?? ""} ${(data as any).model ?? ""}`);
        }
        setTimeout(() => navigate("/cockpit", { replace: true }), 1000);
      });
  }, [params, navigate]);

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <div className="glass-card p-8 text-center space-y-3">
        <div className="size-10 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">{status}</p>
      </div>
    </main>
  );
};

export default SmartcarCallback;
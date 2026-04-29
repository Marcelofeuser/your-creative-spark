import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada ⚡");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com Google");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh w-full px-5 sm:px-8 py-10 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col gap-6"
      >
        <div className="text-center space-y-4">
          <div className="relative mx-auto size-20 rounded-full bg-gradient-aurora p-[2px] flex items-center justify-center shadow-bloom">
            <div className="size-full rounded-full bg-card flex items-center justify-center">
              <Zap size={32} className="text-primary" strokeWidth={1.4} />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">DriverVolt</p>
            <h1 className="text-2xl font-light mt-1">
              {mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}
            </h1>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@dominio.com"
            type="email"
            required
            className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            type="password"
            required
            minLength={6}
            className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-bloom transition-shadow"
          >
            {loading ? "Carregando..." : mode === "signin" ? "Entrar" : "Criar conta"}
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full glass-card py-3 flex items-center justify-center gap-2 hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <Mail size={14} className="text-foreground" />
          <span className="text-sm">Continuar com Google</span>
        </button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors text-center"
        >
          {mode === "signin"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </motion.div>
    </main>
  );
};

export default Auth;

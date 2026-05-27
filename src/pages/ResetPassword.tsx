import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase coloca o token em hash; o SDK processa automaticamente
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Senha deve ter ao menos 6 caracteres");
    if (password !== confirm) return toast.error("Senhas não conferem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada ⚡");
    navigate("/", { replace: true });
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
            <h1 className="text-2xl font-light mt-1">Definir nova senha</h1>
          </div>
        </div>

        {!ready ? (
          <p className="text-xs text-muted-foreground text-center">
            Abra este link a partir do email de recuperação para continuar.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              type="password"
              required
              minLength={6}
              className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
            />
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirme a senha"
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
              {loading ? "Salvando..." : "Atualizar senha"}
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
};

export default ResetPassword;
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Mail, Apple, Check, Car } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    brand: "Tesla",
    model: "Model Y",
    year: 2024,
    batteryKwh: 75,
    rangeKm: 460,
    plate: "",
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Preencha nome e email");
      return;
    }
    completeOnboarding({
      name: form.name,
      email: form.email,
      vehicle: {
        brand: form.brand,
        model: form.model,
        year: form.year,
        batteryKwh: form.batteryKwh,
        rangeKm: form.rangeKm,
        plate: form.plate,
      },
    });
    toast.success(`Bem-vindo, ${form.name.split(" ")[0]} ⚡`);
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-dvh w-full px-5 sm:px-8 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* progress */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary shadow-bloom-soft" : "bg-muted"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-8 text-center"
            >
              <div className="relative mx-auto size-36 rounded-full bg-gradient-aurora p-[2px] flex items-center justify-center shadow-bloom">
                <div className="size-full rounded-full bg-card flex items-center justify-center">
                  <Zap size={56} className="text-primary" strokeWidth={1.4} />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-mono">DriverVolt</p>
                <h1 className="text-3xl font-light mt-2 text-foreground">
                  O sistema operacional<br />da vida elétrica
                </h1>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Recarga inteligente, rotas EV-first, carteira sustentável e diferenciais que mudam o jogo da mobilidade.
                </p>
              </div>
              <button
                onClick={next}
                className="w-full bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow"
              >
                Começar <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Conta</p>
                <h2 className="text-2xl font-light mt-1">Quem está dirigindo?</h2>
              </div>

              <div className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@dominio.com"
                  type="email"
                  className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">ou continuar com</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Mail, label: "Google" },
                  { icon: Apple, label: "Apple" },
                  { icon: Mail, label: "Email" },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => toast(`${p.label} (mock)`)}
                    className="glass-card py-3 flex flex-col items-center gap-1.5 hover:border-primary/30 transition-all"
                  >
                    <p.icon size={16} className="text-foreground" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{p.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={back} className="flex-1 glass-card py-3 rounded-2xl text-sm">Voltar</button>
                <button
                  onClick={next}
                  disabled={!form.name.trim() || !form.email.trim()}
                  className="flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Continuar <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="vehicle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Veículo elétrico</p>
                <h2 className="text-2xl font-light mt-1">Cadastre seu EV</h2>
              </div>

              <div className="glass-card p-5 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Car size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{form.brand} {form.model}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{form.batteryKwh} kWh · {form.rangeKm} km</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Marca" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
                <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Modelo" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40" />
                <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} placeholder="Ano" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono" />
                <input value={form.plate} onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value.toUpperCase() }))} placeholder="Placa" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono uppercase" />
                <input type="number" value={form.batteryKwh} onChange={(e) => setForm((f) => ({ ...f, batteryKwh: Number(e.target.value) }))} placeholder="Bateria (kWh)" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono" />
                <input type="number" value={form.rangeKm} onChange={(e) => setForm((f) => ({ ...f, rangeKm: Number(e.target.value) }))} placeholder="Autonomia (km)" className="bg-muted/40 border border-border rounded-2xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 font-mono" />
              </div>

              <div className="flex gap-2">
                <button onClick={back} className="flex-1 glass-card py-3 rounded-2xl text-sm">Voltar</button>
                <button
                  onClick={finish}
                  className="flex-1 bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Check size={14} strokeWidth={2.5} /> Finalizar
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Onboarding;
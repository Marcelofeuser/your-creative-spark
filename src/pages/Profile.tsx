import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Car, LogOut, Shield, Bell, Mic, Eye, Check } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { useApp, tierLabel } from "@/store/AppStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser, updatePrefs, logout, wallet } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone });

  const save = () => {
    updateUser(form);
    setEditing(false);
    toast.success("Perfil atualizado");
  };

  const handleLogout = () => {
    logout();
    navigate("/onboarding", { replace: true });
    toast("Sessão encerrada");
  };

  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <PageShell title="Perfil" subtitle="Conta & preferências">
      {/* Avatar */}
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 flex flex-col items-center gap-3 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-bloom opacity-30" aria-hidden />
        <div className="relative size-20 rounded-full bg-gradient-aurora p-[2px]">
          <div className="size-full rounded-full bg-card flex items-center justify-center text-3xl font-light text-primary">
            {initial}
          </div>
        </div>
        <div className="relative text-center">
          <p className="text-lg font-medium">{user.name || "Sem nome"}</p>
          <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
          <span className="mt-2 inline-block text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
            Plano {tierLabel[wallet.currentTier]}
          </span>
        </div>
      </motion.section>

      {/* Dados */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Dados pessoais</h2>
          <button onClick={() => setEditing((e) => !e)} className="text-xs text-primary font-mono">
            {editing ? "cancelar" : "editar"}
          </button>
        </div>
        {editing ? (
          <div className="space-y-2">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefone" className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40" />
            <button onClick={save} className="w-full bg-gradient-aurora text-primary-foreground py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Check size={14} strokeWidth={2.5} /> Salvar
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><User size={14} className="text-muted-foreground" /> <span>{user.name || "—"}</span></div>
            <div className="flex items-center gap-3"><Mail size={14} className="text-muted-foreground" /> <span>{user.email || "—"}</span></div>
            <div className="flex items-center gap-3"><Phone size={14} className="text-muted-foreground" /> <span>{user.phone || "—"}</span></div>
          </div>
        )}
      </section>

      {/* Veículo */}
      <section className="glass-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Car size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Veículo elétrico</p>
            {user.vehicle ? (
              <>
                <p className="text-sm font-medium truncate">{user.vehicle.brand} {user.vehicle.model} · {user.vehicle.year}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {user.vehicle.batteryKwh}kWh · {user.vehicle.rangeKm}km {user.vehicle.plate && `· ${user.vehicle.plate}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhum veículo cadastrado</p>
            )}
          </div>
        </div>
      </section>

      {/* Preferências */}
      <section className="glass-card p-5 space-y-1">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Preferências</h2>
        {[
          { key: "notifications" as const, icon: Bell, label: "Notificações push" },
          { key: "voiceSearch" as const, icon: Mic, label: "Busca por voz" },
          { key: "highContrast" as const, icon: Eye, label: "Alto contraste veicular" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => updatePrefs({ [p.key]: !user.prefs[p.key] })}
            className="w-full flex items-center gap-3 py-3 border-b border-border/40 last:border-0 text-left"
          >
            <p.icon size={14} className="text-muted-foreground" />
            <span className="text-sm flex-1">{p.label}</span>
            <span className={`relative w-10 h-5 rounded-full transition-colors ${user.prefs[p.key] ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-background transition-all ${user.prefs[p.key] ? "left-5" : "left-0.5"}`} />
            </span>
          </button>
        ))}
      </section>

      {/* Privacidade & Logout */}
      <section className="space-y-2">
        <button className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
          <Shield size={14} className="text-primary" />
          <span className="text-sm">Privacidade & Segurança</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-destructive/40 transition-colors text-destructive"
        >
          <LogOut size={14} />
          <span className="text-sm">Sair da conta</span>
        </button>
      </section>
    </PageShell>
  );
};

export default Profile;
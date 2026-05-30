import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Nfc, CreditCard, Plus, Trash2, Zap, Shield, X, Check, Cpu, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";
import { useApp, fmtBRL } from "@/store/AppStore";
import { Link } from "react-router-dom";

type Method = "qr" | "nfc" | "tag";

interface Tag {
  id: string;
  label: string;
  serial: string;
  active: boolean;
}

const TAGS_KEY = "drivervolt:tags";

const loadTags = (): Tag[] => {
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    return raw ? JSON.parse(raw) : [
      { id: "t1", label: "Carro Principal · Model Y", serial: "RF-9821-AX", active: true },
      { id: "t2", label: "Reserva · Bolt EV", serial: "RF-7140-BC", active: false },
    ];
  } catch {
    return [];
  }
};

const Charge = () => {
  const { addTransaction, wallet } = useApp();
  const [method, setMethod] = useState<Method>("qr");
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tags, setTags] = useState<Tag[]>(loadTags);
  const [newTag, setNewTag] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  }, [tags]);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      const value = (Math.random() * 40 + 20).toFixed(2);
      addTransaction({
        title: `Recarga ${method.toUpperCase()} · Verdant Point`,
        date: "Agora",
        value: `-R$ ${value.replace(".", ",")}`,
        sign: "out",
      });
      toast.success(`Carregador liberado via ${method.toUpperCase()}`);
      setTimeout(() => setSuccess(false), 2400);
    }, 1800);
  };

  const addTagAction = () => {
    if (!newTag.trim()) return;
    setTags((t) => [
      ...t,
      { id: `t${Date.now()}`, label: newTag, serial: `RF-${Math.floor(Math.random() * 9000 + 1000)}-XX`, active: false },
    ]);
    setNewTag("");
    setShowAdd(false);
    toast.success("TAG RFID vinculada à conta");
  };

  const toggleTag = (id: string) =>
    setTags((t) => t.map((x) => ({ ...x, active: x.id === id })));

  const removeTag = (id: string) => {
    setTags((t) => t.filter((x) => x.id !== id));
    toast("TAG removida");
  };

  const methods: { id: Method; icon: typeof QrCode; label: string; desc: string }[] = [
    { id: "qr", icon: QrCode, label: "QR Code", desc: "Aponte para o carregador" },
    { id: "nfc", icon: Nfc, label: "NFC / Wallet", desc: "Apple Pay · Google Pay" },
    { id: "tag", icon: CreditCard, label: "TAG RFID", desc: "Aproxime sua tag física" },
  ];

  return (
    <PageShell title="Recarga" subtitle="Hardware Agnostic Pay">
      {/* Saldo rápido */}
      <section className="glass-card p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Carteira</p>
          <p className="text-lg font-light tabular-nums mt-1">{fmtBRL(wallet.balance)}</p>
        </div>
        <Shield size={16} className="text-primary" />
      </section>

      {/* Atalho para simulador OCPP */}
      <Link
        to="/ocpp"
        className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Cpu size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Simulador OCPP 1.6J</p>
            <p className="text-[10px] font-mono text-muted-foreground">Emula comunicação charger ↔ CSMS</p>
          </div>
        </div>
        <ArrowUpRight size={14} className="text-primary" />
      </Link>

      {/* Seletor de método */}
      <section className="grid grid-cols-3 gap-2">
        {methods.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`glass-card p-3 flex flex-col items-center gap-2 transition-all ${
                active ? "border-primary/50 shadow-bloom-soft" : "hover:border-white/20"
              }`}
            >
              <m.icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[10px] uppercase tracking-wider font-mono ${active ? "text-primary" : "text-muted-foreground"}`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </section>

      {/* Área de leitura */}
      <section className="glass-card aspect-square relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-bloom opacity-40" aria-hidden />

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="ok"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center gap-3"
            >
              <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary shadow-bloom">
                <Check size={32} className="text-primary" strokeWidth={3} />
              </div>
              <p className="text-sm text-primary font-mono uppercase tracking-widest">Liberado</p>
            </motion.div>
          ) : method === "qr" ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative size-48"
            >
              {/* QR mock decorativo */}
              <div className="size-full rounded-2xl bg-foreground/95 p-3 grid grid-cols-12 gap-px">
                {Array.from({ length: 144 }).map((_, i) => {
                  const filled = (i * 7919) % 3 !== 0;
                  return <span key={i} className={filled ? "bg-background" : "bg-foreground/95"} />;
                })}
              </div>
              {scanning && (
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: 180 }}
                  transition={{ duration: 1.6, ease: "linear" }}
                  className="absolute inset-x-0 top-0 h-0.5 bg-primary shadow-bloom"
                />
              )}
            </motion.div>
          ) : method === "nfc" ? (
            <motion.div
              key="nfc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center gap-3"
            >
              <div className="relative size-40 flex items-center justify-center">
                {scanning &&
                  [0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.4, opacity: 0.7 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                      className="absolute inset-0 rounded-full border-2 border-primary"
                    />
                  ))}
                <div className="size-24 rounded-full bg-primary/15 border-2 border-primary/50 flex items-center justify-center">
                  <Nfc size={36} className="text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {scanning ? "Aproxime do leitor" : "Toque para iniciar"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="tag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex flex-col items-center gap-3"
            >
              <div className="size-40 rounded-2xl bg-gradient-aurora p-0.5">
                <div className="size-full rounded-2xl bg-card flex flex-col items-center justify-center gap-2">
                  <CreditCard size={28} className="text-primary" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    {tags.find((t) => t.active)?.serial ?? "—"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                TAG ativa: {tags.find((t) => t.active)?.label ?? "nenhuma"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <button
        onClick={startScan}
        disabled={scanning || success}
        className="w-full bg-gradient-aurora text-primary-foreground py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-bloom transition-shadow disabled:opacity-60"
      >
        {scanning ? (
          <>
            <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            Liberando carregador...
          </>
        ) : (
          <>
            <Zap size={14} strokeWidth={2.5} /> Liberar carregador
          </>
        )}
      </button>

      {/* TAGs RFID */}
      <section className="space-y-3" aria-labelledby="tags-heading">
        <div className="flex items-center justify-between px-1">
          <h2 id="tags-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            TAGs RFID vinculadas
          </h2>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="text-xs text-primary font-mono flex items-center gap-1"
          >
            <Plus size={12} /> nova
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-4 flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nome do veículo / TAG"
                  className="flex-1 bg-muted/40 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary border border-border"
                />
                <button
                  onClick={addTagAction}
                  className="bg-gradient-aurora text-primary-foreground px-4 rounded-xl text-sm font-semibold"
                >
                  <Check size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tags.length === 0 ? (
          <div className="glass-card p-6 text-center text-sm text-muted-foreground">
            Nenhuma TAG vinculada.
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((t) => (
              <div
                key={t.id}
                className={`glass-card p-4 flex items-center justify-between transition-all ${
                  t.active ? "border-primary/40 shadow-bloom-soft" : "hover:border-white/20"
                }`}
              >
                <button onClick={() => toggleTag(t.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className={`size-10 rounded-xl flex items-center justify-center border ${t.active ? "bg-primary/15 border-primary/40" : "bg-muted/40 border-white/10"}`}>
                    <CreditCard size={14} className={t.active ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.label}</p>
                    <p className="text-[10px] font-mono text-muted-foreground tracking-widest">{t.serial}</p>
                  </div>
                </button>
                {t.active && (
                  <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 mr-2">
                    Ativa
                  </span>
                )}
                <button
                  onClick={() => removeTag(t.id)}
                  aria-label="Remover TAG"
                  className="size-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default Charge;
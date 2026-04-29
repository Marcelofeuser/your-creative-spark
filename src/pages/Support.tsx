import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Mail, Phone, Send, LifeBuoy } from "lucide-react";
import { PageShell } from "@/components/drivervolt/PageShell";
import { toast } from "sonner";

const faq = [
  { q: "Como funciona o cashback?", a: "Cada recarga gera cashback conforme seu plano (Bronze 0%, Silver 5%, Gold 12%) creditado automaticamente na carteira." },
  { q: "Posso usar TAG RFID em todos os carregadores?", a: "Sim. A TAG é universal dentro da rede DriverVolt e parceiros conveniados (CCS2, Type 2, CHAdeMO)." },
  { q: "Como aciono o Rescue Move?", a: "Pelo menu Inovações → Rescue Move. Plano Gold tem acionamento ilimitado; demais planos pagam R$ 89 por chamada." },
  { q: "O Trip Planner considera clima?", a: "Sim. O algoritmo cruza SoC, topografia, temperatura externa e distância entre eletropostos para sugerir paradas." },
  { q: "Smart Grid funciona com minha placa solar?", a: "Sim, integramos com inversores compatíveis para usar excedente na recarga." },
];

const Support = () => {
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!msg.trim()) return;
    toast.success("Mensagem enviada · resposta em até 24h");
    setMsg("");
  };

  return (
    <PageShell title="Suporte" subtitle="FAQ & contato">
      <section className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageCircle, label: "Chat" },
          { icon: Mail, label: "Email" },
          { icon: Phone, label: "Telefone" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => toast(`${c.label} (mock)`)}
            className="glass-card py-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all"
          >
            <c.icon size={16} className="text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{c.label}</span>
          </button>
        ))}
      </section>

      {/* FAQ */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground px-1">
          Perguntas frequentes
        </h2>
        {faq.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-foreground pr-3">{item.q}</span>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {/* Mensagem */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <LifeBuoy size={14} className="text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Mensagem direta
          </h2>
        </div>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={4}
          placeholder="Descreva sua dúvida ou solicitação..."
          className="w-full bg-muted/40 border border-border rounded-2xl px-3 py-3 text-sm focus:outline-none focus:border-primary/40 resize-none"
        />
        <button
          onClick={send}
          disabled={!msg.trim()}
          className="w-full bg-gradient-aurora text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Send size={14} strokeWidth={2.5} /> Enviar
        </button>
      </section>
    </PageShell>
  );
};

export default Support;
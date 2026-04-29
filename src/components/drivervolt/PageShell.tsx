import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "./BottomNav";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
}

export const PageShell = ({ title, subtitle, children, back = true }: PageShellProps) => (
  <main className="min-h-dvh w-full pb-32 pt-6 px-5 sm:px-8 flex flex-col items-center">
    <div className="w-full max-w-md flex flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 px-1"
      >
        {back && (
          <Link
            to="/"
            aria-label="Voltar"
            className="size-10 rounded-full glass-card flex items-center justify-center hover:border-primary/30 transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.6} />
          </Link>
        )}
        <div className="space-y-1">
          {subtitle && (
            <p className="text-muted-foreground text-[10px] tracking-[0.25em] uppercase font-medium">
              {subtitle}
            </p>
          )}
          <h1 className="text-2xl font-light text-foreground">{title}</h1>
        </div>
      </motion.header>
      {children}
    </div>
    <BottomNav />
  </main>
);

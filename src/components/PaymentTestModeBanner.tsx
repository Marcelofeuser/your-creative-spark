const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/15 border-b border-destructive/40 px-4 py-2 text-center text-xs text-destructive">
        Pagamentos em produção não configurados. Complete o go-live para aceitar pagamentos reais.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-amber-500/15 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-200">
        Modo de teste — nenhum pagamento real é processado. Use o cartão 4242 4242 4242 4242.
      </div>
    );
  }
  return null;
}
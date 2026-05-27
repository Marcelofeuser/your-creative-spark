// Credenciais demo configuráveis para modo local/teste.
// Edite estes valores ou defina VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD no .env.
export const DEMO_EMAIL =
  (import.meta.env.VITE_DEMO_EMAIL as string | undefined) ?? "demo@drivervolt.app";
export const DEMO_PASSWORD =
  (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) ?? "drivervolt123";
export const DEMO_NAME = "Demo DriverVolt";
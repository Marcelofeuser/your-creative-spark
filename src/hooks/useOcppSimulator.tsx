import { useCallback, useEffect, useRef, useState } from "react";
import {
  type OcppCharger, type OcppFrame, type ChargerStatus,
  bootNotification, statusNotification, authorize,
  startTransaction, stopTransaction, meterValues,
  callResult, frameToJson, MOCK_CHARGERS,
} from "@/lib/ocpp";
import { useApp } from "@/store/AppStore";

export interface OcppLogEntry {
  id: string;
  ts: number;
  direction: "→ CSMS" | "← CSMS";
  frame: OcppFrame;
  pretty: string;
}

export interface ChargerSessionState {
  status: ChargerStatus;
  transactionId?: number;
  startedAt?: number;
  energyWh: number;
  powerKw: number;
}

const PRICE_PER_KWH_CENTS = 250; // R$ 2,50 / kWh — tarifa pública mock

/**
 * Simulador OCPP 1.6J. Emula o fluxo completo entre charger e CSMS
 * em memória, sem WebSocket real, e persiste a sessão concluída em
 * `charge_sessions` via store.
 */
export function useOcppSimulator(charger: OcppCharger) {
  const { addSession } = useApp();
  const [log, setLog] = useState<OcppLogEntry[]>([]);
  const [state, setState] = useState<ChargerSessionState>({
    status: "Available", energyWh: 0, powerKw: 0,
  });
  const [connected, setConnected] = useState(false);
  const meterTimerRef = useRef<number | null>(null);
  const txIdRef = useRef<number>(0);

  const push = useCallback((direction: OcppLogEntry["direction"], frame: OcppFrame) => {
    setLog((l) => [
      { id: `${Date.now()}-${Math.random()}`, ts: Date.now(), direction, frame, pretty: frameToJson(frame) },
      ...l,
    ].slice(0, 200));
  }, []);

  /** Conecta + envia BootNotification + StatusNotification(Available). */
  const connect = useCallback(async () => {
    setConnected(false);
    setLog([]);
    await new Promise((r) => setTimeout(r, 400));
    const boot = bootNotification(charger);
    push("→ CSMS", boot);
    await new Promise((r) => setTimeout(r, 350));
    push("← CSMS", callResult(boot[1], {
      status: "Accepted",
      currentTime: new Date().toISOString(),
      interval: 300,
    }));
    const stat = statusNotification(charger.connectorId, "Available");
    push("→ CSMS", stat);
    push("← CSMS", callResult(stat[1], {}));
    setConnected(true);
    setState({ status: "Available", energyWh: 0, powerKw: 0 });
  }, [charger, push]);

  const disconnect = useCallback(() => {
    if (meterTimerRef.current) {
      window.clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }
    setConnected(false);
    setState({ status: "Unavailable", energyWh: 0, powerKw: 0 });
  }, []);

  /** Inicia uma transação completa: Authorize → StartTransaction → MeterValues loop. */
  const startCharging = useCallback(async (idTag: string) => {
    if (!connected) return;
    // Authorize
    const authMsg = authorize(idTag);
    push("→ CSMS", authMsg);
    await new Promise((r) => setTimeout(r, 300));
    push("← CSMS", callResult(authMsg[1], { idTagInfo: { status: "Accepted" } }));

    // Preparing
    const prep = statusNotification(charger.connectorId, "Preparing");
    push("→ CSMS", prep);
    push("← CSMS", callResult(prep[1], {}));
    setState((s) => ({ ...s, status: "Preparing" }));
    await new Promise((r) => setTimeout(r, 500));

    // StartTransaction
    const start = startTransaction({ connectorId: charger.connectorId, idTag, meterStart: 0 });
    push("→ CSMS", start);
    await new Promise((r) => setTimeout(r, 250));
    txIdRef.current += 1;
    const txId = Math.floor(Date.now() / 1000);
    push("← CSMS", callResult(start[1], {
      transactionId: txId,
      idTagInfo: { status: "Accepted" },
    }));

    // Charging
    const charging = statusNotification(charger.connectorId, "Charging");
    push("→ CSMS", charging);
    push("← CSMS", callResult(charging[1], {}));

    const startedAt = Date.now();
    setState({ status: "Charging", transactionId: txId, startedAt, energyWh: 0, powerKw: charger.maxPowerKw * 0.85 });

    // MeterValues loop a cada 3s (simula coleta a cada 5min real)
    meterTimerRef.current = window.setInterval(() => {
      setState((s) => {
        // Cada tick = ~30s de carga simulada
        const stepKwh = (s.powerKw / 60) * 0.5;
        const newEnergyWh = s.energyWh + stepKwh * 1000;
        // Curva de carga: reduz potência após 80% de uma bateria de 75kWh
        const socPct = Math.min(100, (newEnergyWh / 1000) / 75 * 100);
        let newPower = s.powerKw;
        if (socPct > 80) newPower = Math.max(20, charger.maxPowerKw * 0.3);
        else if (socPct > 60) newPower = charger.maxPowerKw * 0.65;
        const mv = meterValues({
          connectorId: charger.connectorId,
          transactionId: txId,
          energyWh: Math.round(newEnergyWh),
          powerW: Math.round(newPower * 1000),
        });
        push("→ CSMS", mv);
        push("← CSMS", callResult(mv[1], {}));
        return { ...s, energyWh: newEnergyWh, powerKw: newPower };
      });
    }, 3000);
  }, [connected, charger, push]);

  /** Encerra a transação e persiste em charge_sessions. */
  const stopCharging = useCallback(async (idTag: string) => {
    if (!state.transactionId) return;
    if (meterTimerRef.current) {
      window.clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }

    setState((s) => ({ ...s, status: "Finishing" }));
    const finishing = statusNotification(charger.connectorId, "Finishing");
    push("→ CSMS", finishing);
    push("← CSMS", callResult(finishing[1], {}));

    const stop = stopTransaction({
      transactionId: state.transactionId, idTag,
      meterStop: Math.round(state.energyWh),
    });
    push("→ CSMS", stop);
    await new Promise((r) => setTimeout(r, 300));
    push("← CSMS", callResult(stop[1], { idTagInfo: { status: "Accepted" } }));

    const avail = statusNotification(charger.connectorId, "Available");
    push("→ CSMS", avail);
    push("← CSMS", callResult(avail[1], {}));

    const durationMin = Math.max(1, Math.round(((Date.now() - (state.startedAt ?? Date.now())) / 1000 / 60)));
    const kwh = +(state.energyWh / 1000).toFixed(2);
    const costCents = Math.round(kwh * PRICE_PER_KWH_CENTS);
    await addSession({
      station: charger.name,
      date: new Date().toISOString(),
      durationMin,
      kwh,
      cost: costCents,
      power: `${charger.maxPowerKw}kW`,
      connector: "CCS2",
    });
    setState({ status: "Available", energyWh: 0, powerKw: 0 });
  }, [state, charger, push, addSession]);

  // Cleanup
  useEffect(() => () => {
    if (meterTimerRef.current) window.clearInterval(meterTimerRef.current);
  }, []);

  return { state, log, connected, connect, disconnect, startCharging, stopCharging };
}

export { MOCK_CHARGERS };
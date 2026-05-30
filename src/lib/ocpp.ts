/**
 * OCPP 1.6J — utilitários de mensagens.
 *
 * Frame format: [MessageTypeId, UniqueId, Action, Payload]
 *   2 = CALL (request)
 *   3 = CALLRESULT (response)
 *   4 = CALLERROR
 *
 * Este módulo é puramente cliente: não há servidor CSMS real. As mensagens
 * trafegam por um EventEmitter em memória que simula o WebSocket.
 */

export type OcppFrameType = 2 | 3 | 4;

export type OcppFrame =
  | [2, string, string, Record<string, unknown>] // CALL
  | [3, string, Record<string, unknown>]          // CALLRESULT
  | [4, string, string, string, Record<string, unknown>]; // CALLERROR

export type ChargerStatus =
  | "Available"
  | "Preparing"
  | "Charging"
  | "SuspendedEV"
  | "Finishing"
  | "Faulted"
  | "Unavailable";

export interface OcppCharger {
  id: string;            // chargePointId (CSMS-side)
  name: string;
  vendor: string;
  model: string;
  serial: string;
  connectorId: number;   // sempre 1 no mock
  maxPowerKw: number;
}

export const MOCK_CHARGERS: OcppCharger[] = [
  {
    id: "CP-VRD-001", name: "Verdant Point · Pinheiros",
    vendor: "EvBox", model: "Troniq 100",
    serial: "EVB-100-78213", connectorId: 1, maxPowerKw: 100,
  },
  {
    id: "CP-HYP-014", name: "Hyperion · Resende KM 312",
    vendor: "ABB", model: "Terra HP",
    serial: "ABB-HP-014023", connectorId: 1, maxPowerKw: 350,
  },
  {
    id: "CP-ELT-027", name: "Eletra · Posto Graal Aparecida",
    vendor: "Eletra", model: "DC150",
    serial: "ELT-DC150-0027", connectorId: 1, maxPowerKw: 150,
  },
];

let counter = 0;
export function nextId() {
  counter += 1;
  return `ocpp-${Date.now().toString(36)}-${counter}`;
}

export function call(action: string, payload: Record<string, unknown>): OcppFrame {
  return [2, nextId(), action, payload];
}

export function callResult(uniqueId: string, payload: Record<string, unknown>): OcppFrame {
  return [3, uniqueId, payload];
}

/** Formata uma frame OCPP para exibição no console raw. */
export function frameToJson(frame: OcppFrame) {
  return JSON.stringify(frame);
}

/** Constrói um BootNotification. */
export function bootNotification(charger: OcppCharger) {
  return call("BootNotification", {
    chargePointVendor: charger.vendor,
    chargePointModel: charger.model,
    chargePointSerialNumber: charger.serial,
    firmwareVersion: "1.6.2-evgo",
  });
}

export function statusNotification(connectorId: number, status: ChargerStatus, errorCode = "NoError") {
  return call("StatusNotification", { connectorId, errorCode, status });
}

export function authorize(idTag: string) {
  return call("Authorize", { idTag });
}

export function startTransaction(opts: { connectorId: number; idTag: string; meterStart: number }) {
  return call("StartTransaction", {
    connectorId: opts.connectorId,
    idTag: opts.idTag,
    meterStart: opts.meterStart, // Wh
    timestamp: new Date().toISOString(),
  });
}

export function meterValues(opts: { connectorId: number; transactionId: number; energyWh: number; powerW: number }) {
  return call("MeterValues", {
    connectorId: opts.connectorId,
    transactionId: opts.transactionId,
    meterValue: [{
      timestamp: new Date().toISOString(),
      sampledValue: [
        { value: String(opts.energyWh), measurand: "Energy.Active.Import.Register", unit: "Wh" },
        { value: String(opts.powerW), measurand: "Power.Active.Import", unit: "W" },
      ],
    }],
  });
}

export function stopTransaction(opts: { transactionId: number; idTag: string; meterStop: number }) {
  return call("StopTransaction", {
    transactionId: opts.transactionId,
    idTag: opts.idTag,
    meterStop: opts.meterStop,
    timestamp: new Date().toISOString(),
    reason: "Local",
  });
}
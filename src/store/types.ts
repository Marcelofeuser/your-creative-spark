export interface Stop {
  id: string;
  name: string;
  km: number;
  power: string;
  duration: string;
  socAfter: number;
}

export interface TripPlan {
  id: string;
  name: string;
  origin: string;
  destination: string;
  startSoc: number;
  stops: Stop[];
  createdAt: number;
}

export type Tier = "bronze" | "silver" | "gold";

export interface Transaction {
  id: string;
  title: string;
  date: string;
  value: string;
  sign: "in" | "out";
}

export interface WalletState {
  balance: number; // in BRL cents
  currentTier: Tier;
  transactions: Transaction[];
}

export interface TripState {
  origin: string;
  destination: string;
  startSoc: number;
  stops: Stop[];
  savedPlans: TripPlan[];
}
import { createAnonClient } from "./supabase.js";

export type RateCardEntry = {
  role: string;
  hourly_rate: number;
};

export type BudgetRange = {
  budgetMin: number;
  budgetMax: number;
  hoursLow: number;
  hoursHigh: number;
  lowRate: number;
  highRate: number;
  methodology: string;
};

export async function fetchRateCard(): Promise<RateCardEntry[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("rate_card")
    .select("role, hourly_rate")
    .order("hourly_rate", { ascending: true });

  if (error) throw new Error(`Rate card fetch failed: ${error.message}`);
  return (data ?? []).map((row) => ({
    role: row.role,
    hourly_rate: Number(row.hourly_rate),
  }));
}

/** Deterministic budget math — hours × rate card (never model-guessed). */
export function computeBudgetRange(
  hoursLow: number,
  hoursHigh: number,
  rates: RateCardEntry[]
): BudgetRange {
  if (rates.length === 0) {
    throw new Error("Rate card is empty");
  }

  const sorted = [...rates].sort((a, b) => a.hourly_rate - b.hourly_rate);
  const lowRate = sorted[0].hourly_rate;
  const highRate = sorted[sorted.length - 1].hourly_rate;

  const budgetMin = Math.round(hoursLow * lowRate);
  const budgetMax = Math.round(hoursHigh * highRate);

  return {
    budgetMin,
    budgetMax,
    hoursLow,
    hoursHigh,
    lowRate,
    highRate,
    methodology: `$${lowRate}/hr × ${hoursLow}h (low) → $${highRate}/hr × ${hoursHigh}h (high)`,
  };
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

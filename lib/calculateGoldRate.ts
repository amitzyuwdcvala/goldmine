/**
 * Gold rate calculation utilities.
 *
 * Formula:
 *   Step 1 — Base price per gram (USD):
 *     base = (spotPricePerOunce + adjustment) / 31.1035
 *
 *   Step 2 — Karat conversion:
 *     karatRate = base * karatPercentage
 *
 *   Step 3 — Final rate:
 *     finalRate = karatRate + 10   (flat $10 addition)
 */

export const TROY_OUNCE_IN_GRAMS = 31.1035;
export const TOLA_IN_GRAMS = 11.6638;
export const FLAT_ADDITION_USD = 10;

export type Adjustment = 35 | 50;
export type Karat = 24 | 22 | 18 | 14 | 10 | 9;

export const KARAT_PERCENTAGES: Record<Karat, number> = {
  24: 0.99,
  22: 0.92,
  18: 0.76,
  14: 0.595,
  10: 0.42,
  9: 0.38,
};

export const KARAT_ORDER: Karat[] = [24, 22, 18, 14, 10, 9];

/**
 * Calculates the final selling rate (USD per gram) for a given karat,
 * from a live/manual spot price per troy ounce.
 */
export function calculateGoldRate(
  spotPricePerOunce: number,
  adjustment: Adjustment,
  karat: Karat
): number {
  const base = (spotPricePerOunce + adjustment) / TROY_OUNCE_IN_GRAMS;
  const karatRate = base * KARAT_PERCENTAGES[karat];
  const finalRate = karatRate + FLAT_ADDITION_USD;
  return finalRate;
}

/** Convenience: final rates for all karats at once. */
export function calculateAllKaratRates(
  spotPricePerOunce: number,
  adjustment: Adjustment
): Record<Karat, number> {
  const result = {} as Record<Karat, number>;
  for (const karat of KARAT_ORDER) {
    result[karat] = calculateGoldRate(spotPricePerOunce, adjustment, karat);
  }
  return result;
}

/** Converts a per-gram USD rate to a per-tola USD rate. */
export function perGramToPerTola(perGram: number): number {
  return perGram * TOLA_IN_GRAMS;
}

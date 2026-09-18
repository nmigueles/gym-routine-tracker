/**
 * Rough session calorie estimate for resistance training.
 *
 * minutes ≈ sets * (0.75 work + 1.5 rest)  →  sets * 2.25
 * MET ≈ 5.0 (moderate resistance training)
 * kcal = round(MET * bodyWeightKg * (minutes / 60))
 *
 * Uses completed sets when any exist; otherwise planned total sets for the day.
 */
export const RESISTANCE_MET = 5.0;
export const MINUTES_PER_SET = 0.75 + 1.5; // work + rest

export function estimateSessionKcal(
  bodyWeightKg: number,
  setsForEstimate: number,
): number {
  if (!Number.isFinite(bodyWeightKg) || bodyWeightKg <= 0) return 0;
  if (!Number.isFinite(setsForEstimate) || setsForEstimate <= 0) return 0;
  const minutes = setsForEstimate * MINUTES_PER_SET;
  return Math.round(RESISTANCE_MET * bodyWeightKg * (minutes / 60));
}

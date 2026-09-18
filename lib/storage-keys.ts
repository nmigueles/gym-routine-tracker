/** localStorage keys used by the live gym-routine-tracker deployment */
export const STORAGE_KEYS = {
  sets: "gym-routine-sets",
  records: "gym-routine-records",
  restStartedAt: "gym-routine-rest-started-at",
  bodyWeight: "gym-routine-body-weight",
} as const;

/** Rest timer duration in seconds (matches "1:30" UI) */
export const REST_SECONDS = 90;

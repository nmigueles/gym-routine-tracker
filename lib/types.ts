export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  paired?: string;
  pairedSets?: number;
  pairedReps?: string;
  note?: string;
};

export type Day = {
  id: string;
  label: string;
  title: string;
  exercises: Exercise[];
};

/** Completed set indexes per exercise key `${dayId}-${exerciseName}` */
export type SetsState = Record<string, number[]>;

/** Weight (kg) string per exercise key `${dayId}-${exerciseName}` */
export type RecordsState = Record<string, string>;

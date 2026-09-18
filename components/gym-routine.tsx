"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Dumbbell, RotateCcw } from "lucide-react";
import { estimateSessionKcal } from "@/lib/calories";
import { DAYS } from "@/lib/routine-data";
import { REST_SECONDS, STORAGE_KEYS } from "@/lib/storage-keys";
import type { RecordsState, SetsState } from "@/lib/types";

function exerciseKey(dayId: string, name: string) {
  return `${dayId}-${name}`;
}

export function GymRoutine() {
  // Live bundle used useState("lunes") then fell back to DAYS[0].
  const [dayId, setDayId] = useState(DAYS[0]?.id ?? "martes");
  const [setsState, setSetsState] = useState<SetsState>({});
  const [records, setRecords] = useState<RecordsState>({});
  const [restLeft, setRestLeft] = useState(0);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [bodyWeight, setBodyWeight] = useState("");

  const day = useMemo(
    () => DAYS.find((d) => d.id === dayId) ?? DAYS[0],
    [dayId],
  );

  useEffect(() => {
    try {
      const rawSets = window.localStorage.getItem(STORAGE_KEYS.sets);
      const rawRecords = window.localStorage.getItem(STORAGE_KEYS.records);
      const rawWeight = window.localStorage.getItem(STORAGE_KEYS.bodyWeight);
      if (rawSets) setSetsState(JSON.parse(rawSets));
      if (rawRecords) setRecords(JSON.parse(rawRecords));
      if (rawWeight != null) setBodyWeight(rawWeight);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sets, JSON.stringify(setsState));
  }, [setsState]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.bodyWeight, bodyWeight);
  }, [bodyWeight]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEYS.restStartedAt);
    if (!raw) return;
    const started = Number(raw);
    const left = Math.max(
      0,
      REST_SECONDS - Math.floor((Date.now() - started) / 1000),
    );
    if (left > 0) {
      setRestStartedAt(started);
      setRestLeft(left);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.restStartedAt);
    }
  }, []);

  useEffect(() => {
    if (!restStartedAt) return;
    const tick = () => {
      const left = Math.max(
        0,
        REST_SECONDS - Math.floor((Date.now() - restStartedAt) / 1000),
      );
      setRestLeft(left);
      if (left === 0) {
        setRestStartedAt(null);
        window.localStorage.removeItem(STORAGE_KEYS.restStartedAt);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [restStartedAt]);

  const exercises = day.exercises;
  const doneSets = exercises.reduce(
    (acc, ex) =>
      acc + (setsState[exerciseKey(day.id, ex.name)]?.length ?? 0),
    0,
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progressPct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

  const bodyWeightKg = Number.parseFloat(bodyWeight.replace(",", "."));
  const hasBodyWeight = Number.isFinite(bodyWeightKg) && bodyWeightKg > 0;
  const setsForKcal = doneSets > 0 ? doneSets : totalSets;
  const estimatedKcal = hasBodyWeight
    ? estimateSessionKcal(bodyWeightKg, setsForKcal)
    : null;

  function resetDay() {
    setSetsState((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([k]) => !k.startsWith(`${day.id}-`)),
      ),
    );
  }

  function toggleSet(exerciseName: string, setNumber: number) {
    const key = exerciseKey(day.id, exerciseName);
    setSetsState((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(setNumber)
        ? current.filter((n) => n !== setNumber)
        : [...current, setNumber].sort((a, b) => a - b);
      return { ...prev, [key]: next };
    });
  }

  function setWeight(exerciseName: string, value: string) {
    const key = exerciseKey(day.id, exerciseName);
    setRecords((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRest() {
    if (restStartedAt) {
      setRestLeft(0);
      setRestStartedAt(null);
      window.localStorage.removeItem(STORAGE_KEYS.restStartedAt);
      return;
    }
    const started = Date.now();
    setRestStartedAt(started);
    setRestLeft(REST_SECONDS);
    window.localStorage.setItem(STORAGE_KEYS.restStartedAt, String(started));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-8 pt-5 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
              <Dumbbell className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Entrenamiento
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
                {day.title}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={resetDay}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card transition-colors active:bg-secondary"
            aria-label="Reiniciar día"
          >
            <RotateCcw className="size-5" aria-hidden />
          </button>
        </header>

        <nav
          className="grid grid-cols-2 gap-2"
          role="tablist"
          aria-label="Día de entrenamiento"
        >
          {DAYS.map((d) => {
            const selected = dayId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setDayId(d.id)}
                className={`min-h-16 rounded-2xl border px-4 text-left transition-all active:scale-[0.98] ${
                  selected
                    ? "border-foreground bg-foreground text-background shadow-md"
                    : "border-border bg-card"
                }`}
              >
                <span className="block text-lg font-bold">{d.label}</span>
                <span
                  className={`font-mono text-xs ${
                    selected ? "text-background/65" : "text-muted-foreground"
                  }`}
                >
                  {d.exercises.length} ejercicios
                </span>
              </button>
            );
          })}
        </nav>

        <section
          className="rounded-2xl border border-border bg-card p-4"
          aria-label="Progreso de la sesión"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Progreso de hoy
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {doneSets}
                <span className="text-lg font-medium text-muted-foreground">
                  {" "}
                  / {totalSets} series
                </span>
              </p>
            </div>
            <span className="font-mono text-sm font-semibold">{progressPct}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>

        <section
          className="rounded-2xl border border-border bg-card p-4"
          aria-label="Estimación de calorías"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Calorías de hoy
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {estimatedKcal != null ? (
                  <>
                    ~{estimatedKcal}
                    <span className="text-lg font-medium text-muted-foreground">
                      {" "}
                      kcal
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {hasBodyWeight ? "estimado" : "ingresá tu peso"}
              </p>
            </div>
          </div>

          <label className="mt-4 flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Peso corporal
            </span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={0.1}
                inputMode="decimal"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder="—"
                aria-label="Peso corporal en kilogramos"
                className="h-12 w-24 rounded-xl border border-border bg-card px-3 text-right text-lg font-bold tabular-nums outline-none focus:border-foreground"
              />
              <span className="font-mono text-sm text-muted-foreground">kg</span>
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-4">
          {exercises.map((ex, index) => {
            const key = exerciseKey(day.id, ex.name);
            const completed = setsState[key] ?? [];
            return (
              <article
                key={ex.name}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold leading-tight tracking-tight">
                        {ex.name}
                      </h2>
                      <p className="mt-1.5 font-mono text-sm text-muted-foreground">
                        {ex.sets} series <span className="text-border">·</span>{" "}
                        {ex.reps} repeticiones
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 font-mono text-xs font-bold tabular-nums">
                      {completed.length}/{ex.sets}
                    </span>
                  </div>

                  <label className="mt-5 flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4">
                    <span className="text-sm font-bold">Peso</span>
                    <span className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        inputMode="decimal"
                        value={records[key] ?? ""}
                        onChange={(e) => setWeight(ex.name, e.target.value)}
                        placeholder="—"
                        aria-label={`Peso para ${ex.name}`}
                        className="h-12 w-24 rounded-xl border border-border bg-card px-3 text-right text-lg font-bold tabular-nums outline-none focus:border-foreground"
                      />
                      <span className="font-mono text-sm text-muted-foreground">
                        kg
                      </span>
                    </span>
                  </label>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {Array.from({ length: ex.sets }, (_, i) => {
                      const setNumber = i + 1;
                      const on = completed.includes(setNumber);
                      return (
                        <button
                          key={setNumber}
                          type="button"
                          onClick={() => toggleSet(ex.name, setNumber)}
                          aria-label={`${on ? "Desmarcar" : "Marcar"} serie ${setNumber} de ${ex.name}`}
                          aria-pressed={on}
                          className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border text-sm font-bold transition-all active:scale-95 ${
                            on
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background"
                          }`}
                        >
                          <span className="text-lg">
                            {on ? (
                              <Check className="size-5" aria-hidden />
                            ) : (
                              setNumber
                            )}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider opacity-65">
                            Serie
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {ex.paired ? (
                  <div className="border-t border-border bg-secondary/60 px-5 py-3">
                    <p className="text-sm font-semibold">
                      Combina con: {ex.paired}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {ex.pairedSets} series · {ex.pairedReps} repeticiones
                    </p>
                  </div>
                ) : null}

                {ex.note ? (
                  <p className="border-t border-border px-5 py-3 text-sm text-muted-foreground">
                    {ex.note}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>

        <p className="pb-20 text-center font-mono text-[11px] text-muted-foreground">
          Tus datos se guardan automáticamente en este dispositivo.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-3 z-10 px-4 pb-[env(safe-area-inset-bottom)] sm:px-6">
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={toggleRest}
            className="relative flex min-h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-foreground bg-foreground px-5 font-mono text-base font-bold text-background shadow-xl shadow-foreground/20 transition-transform active:scale-[0.98]"
            aria-label={
              restStartedAt
                ? "Detener temporizador de descanso"
                : "Iniciar temporizador de descanso"
            }
          >
            <span
              className="absolute inset-y-0 left-0 bg-background/15 transition-[width] duration-1000 ease-linear"
              style={{
                width: restStartedAt
                  ? `${(restLeft / REST_SECONDS) * 100}%`
                  : "0%",
              }}
            />
            <span className="relative flex items-center gap-3">
              <Clock3 className="size-5" aria-hidden />
              {restStartedAt
                ? `Descanso  ${String(Math.floor(restLeft / 60)).padStart(2, "0")}:${String(restLeft % 60).padStart(2, "0")}`
                : "Iniciar descanso · 1:30"}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

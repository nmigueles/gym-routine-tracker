# Architecture map

## Source location

`/workspace/gym-routine-tracker/`

## Key files

- `package.json` — Next 15 / React 19 / Tailwind 4 / lucide-react
- `app/page.tsx` — server entry rendering client `GymRoutine`
- `components/gym-routine.tsx` — page UI + localStorage + rest timer + kcal estimate
- `lib/routine-data.ts` — Martes (“Empuje + piernas”) / Jueves (“Tirón + core”)
- `lib/storage-keys.ts` — sets | records | restStartedAt | bodyWeight
- `lib/calories.ts` — MET 5.0 resistance estimate (sets × 2.25 min)
- `app/globals.css` — shadcn-like tokens recovered from live CSS

## Data flow

1. `DAYS` drives day tabs and exercise cards
2. Set toggles + weights persist under `${dayId}-${exerciseName}`
3. Rest timer = 90s; start timestamp in `gym-routine-rest-started-at`
4. Body weight (kg) in `gym-routine-body-weight`; kcal uses completed sets if any, else planned

## Calorie UI constraint (Nicolas)

Must not break visual design. Same style as existing cards/buttons
(`rounded-2xl`/`3xl`, border, mono labels, dark/light). Keep UI minimal:
body weight (localStorage) + estimate kcal for current day only.

# gym-routine-tracker (recovered)

Readable reconstruction of Nicolas’s v0/Vercel app **gym-routine-tracker**.

- Vercel project: `prj_G0qCI7yTCeIm4uIHNj8ZVBSU5K84`
- Team: `team_ionnfqfRwUp3D9Bw2S8SnYXu`
- Domains: `gym-routine-tracker-delta.vercel.app`, `gym-routine-tracker-nicols-migueles-projects.vercel.app`
- v0 chat: `uca9f8I4r8k`

## How source was obtained

| Attempt | Result |
|---------|--------|
| Disk under `/workspace` / `/home/box` | Not found |
| Vercel CLI | Logged out — cannot pull |
| Vercel MCP | Project/deployments OK; **no source download**; no Git repo; meta `v0: true` |
| GitHub | No matching repo for Nicolas |
| v0 chat / download-zip | Private; needs login / `V0_API_KEY` |
| Source maps on deployment | 403 |
| **Live JS bundles** | **Success** — page chunk decompiled into this tree |

Raw artifacts live in `_recovered/`.

## Layout

| Path | Role |
|------|------|
| `app/page.tsx` | Entry → `<GymRoutine />` |
| `app/layout.tsx` | Metadata “Rutina / 01”, PWA |
| `app/globals.css` | Tailwind v4 + light/dark tokens |
| `components/gym-routine.tsx` | Full UI (days, sets, weight, rest timer) |
| `lib/routine-data.ts` | **Routine data** (Martes / Jueves) |
| `lib/storage-keys.ts` | localStorage key constants |
| `lib/types.ts` | Shared types |
| `package.json` | Next 15 + React 19 + Tailwind 4 + lucide |

## localStorage

| Key | Purpose |
|-----|---------|
| `gym-routine-sets` | Completed set indexes per `${dayId}-${exerciseName}` |
| `gym-routine-records` | Weight kg strings per same key |
| `gym-routine-rest-started-at` | Epoch ms when 90s rest timer started |

## UI patterns (calorie button later)

Keep the same visual language — do **not** break the design:

- Cards: `rounded-2xl` / `rounded-3xl`, `border border-border`, `bg-card`
- Tabs / set chips: border + selected `bg-foreground text-background`
- Section labels: `font-mono` uppercase tracking
- Bottom CTA: full-width `rounded-full` foreground button (rest timer)
- Dark/light via CSS variables in `globals.css`

**Calorie feature (not implemented yet):** minimal body-weight field
(localStorage) + estimated kcal for the **current day**, matching those
patterns.

## Redeploy

1. **Vercel CLI** (preferred once authenticated): link this folder to project
   `gym-routine-tracker` / team above, then `vercel --prod`
2. **Vercel MCP** `deploy_to_vercel` with file contents (small app)
3. **v0** chat `uca9f8I4r8k` if logged in (original authoring surface)
4. **Git** — none today; create a repo if you want git-based deploys

```bash
cd /workspace/gym-routine-tracker && npm install && npm run dev
```

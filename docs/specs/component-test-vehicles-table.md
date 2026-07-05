# Spec — Monorepo split + `component-test` Vehicles Table

- **ID:** SPEC-002
- **Status:** Approved
- **Related:** `docs/verified-scope.md` §7.1 (Placa), §10.9 (orden por placa)
- **Author:** —
- **Date:** 2026-07-05

## 0. Convention (project-wide)

All source code, identifiers, file names, comments and commit messages are written in
**English**. Only **user-visible strings** (labels, column headers, error messages, tooltips)
are in **Spanish**. This convention applies to every future feature.

## 1. Goal

1. Split the repository into a **pnpm workspace** with two packages:
   - `api/` — the existing Node/Express mock backend (moved verbatim from the current root `src/`).
   - `client/` — a new React SPA that will host the frontend.
2. Install the approved frontend stack in `client/`.
3. Deliver a **proof-of-concept example** under `client/src/component-test` that satisfies the
   acceptance criteria below.

**Out of scope (deferred to a future feature):** application architecture / folder conventions,
routing, the real map view, and API integration. The example uses local fake data only.

## 2. Target structure

```
root/
  package.json            # private workspace root; orchestration scripts
  pnpm-workspace.yaml     # packages: [api, client]
  api/                    # moved from current root
    package.json          # urban-hygiene-api (unchanged content)
    tsconfig.json
    src/                  # express app (app.ts, controllers, data, routes, ...)
  client/
    package.json          # SPA
    index.html
    vite.config.ts        # includes vitest config (jsdom)
    tsconfig.json / tsconfig.node.json
    eslint.config.js
    .prettierrc
    src/
      main.tsx            # app entry (wraps Theme + QueryClientProvider)
      App.tsx             # renders the component-test example for now
      test/setup.ts       # RTL + jest-dom setup
      component-test/
        types.ts              # VehicleRow, enums, zone map
        data.ts               # 2 fake vehicles (raw) + fetch simulation
        plate.ts              # plate validation helpers (§7.1)
        useVehiclesStore.ts   # Zustand typed store
        useVehiclesQuery.ts   # React Query loader (1.2s delay -> hydrate store)
        VehiclesTable.tsx     # TanStack Table + skeleton + editable plate cell
        PlateCell.tsx         # editable plate cell (debounced validation)
        VehiclesTable.test.tsx
        plate.test.ts
        store.test.ts
  docs/
```

## 3. Stack (installed in `client/`)

- Core: `react`, `react-dom`, `typescript`, `vite`, `@vitejs/plugin-react`
- State: `zustand`, `@tanstack/react-query`
- Maps: `leaflet`, `react-leaflet`, `@types/leaflet` (installed; map view deferred)
- UI: `@radix-ui/themes` (provides `Skeleton`), `@tanstack/react-table`
- Validation: `zod`
- Testing: `vitest`, `@testing-library/react`, `@testing-library/user-event`,
  `@testing-library/jest-dom`, `jsdom`
- DX: `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `prettier`

TypeScript runs in **strict** mode.

## 4. Domain model (`component-test`)

```ts
type VehicleType = 'TRUCK' | 'VAN' | 'PICKUP'
type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE'

interface RawVehicle {
  id: string
  type: VehicleType
  plate: string
  status: VehicleStatus
  zoneId: string
  lat: number
  lng: number
}

interface VehicleRow extends RawVehicle {
  zoneName: string // derived from zoneId via ZONES map
}
```

Zone map (subset of backend zones): `1 -> Microcentro`, `2 -> Palermo`, ...

**Two records (exactly):**

| id | type  | plate  | status      | zoneId | lat        | lng         |
|----|-------|--------|-------------|--------|------------|-------------|
| 1  | TRUCK | ABC123 | ACTIVE      | 1      | -34.613610 | -58.425660  |
| 2  | VAN   | DEF456 | MAINTENANCE | 2      | -34.6061   | -58.4354    |

## 5. State management

- **React Query** `useVehiclesQuery` simulates an async fetch that resolves after **1200 ms**,
  returning the 2 raw vehicles. `isLoading` drives the skeleton.
- On success it hydrates the **Zustand** store (`setVehicles`), deriving `zoneName` from `zoneId`.
- The **Zustand** store is the source of truth for the table and for plate edits:
  `{ vehicles: VehicleRow[]; setVehicles(raw): void; updatePlate(id, plate): void }`.

## 6. Table (TanStack Table)

Columns (headers in Spanish): **Tipo** (`type`), **Patente** (`plate`, editable),
**Estado** (`status`), **Zona** (`zoneName`), **Latitud** (`lat`), **Longitud** (`lng`).

## 7. Editable Plate cell — validation (`docs/verified-scope.md` §7.1)

Accepted formats: `AAA111` (3 letters + 3 digits) **or** `AA111AA` (2 letters, 3 digits, 2 letters).

Behaviour:

1. **Keystroke gating** — input is normalized to uppercase; a keystroke is **rejected**
   (value not updated, prompt to correct shown) if the resulting string is **not a valid prefix**
   of either accepted pattern. This is the "si se escribe algo por fuera de lo buscado, no te deja
   ingresarlo y te pide cambiarlo" requirement.
2. **Debounced validation (700 ms)** — after typing stops, the full value is validated against the
   two patterns. If invalid, a red error message is shown below the input.
3. **Empty not allowed** — committing an empty value reverts to the **previous** plate.
4. **Commit** — a valid, complete plate is written to the Zustand store via `updatePlate`.

Helpers in `plate.ts`: `isValidPlate(s)`, `isAcceptablePrefix(s)` (pure, unit-tested).

## 8. Skeleton (Radix UI)

While `isLoading` is true, render a skeleton **per column/field** using `@radix-ui/themes`
`Skeleton`, lasting **1200 ms** (tied to the query delay). After load, the real rows render.

## 9. Tests (Vitest + RTL)

1. **Table render** — after load, the 2 rows render with correct `type`, `plate`, `status`,
   `zoneName`.
2. **Skeleton render** — with fake timers, skeleton cells are present before 1200 ms; real data
   after advancing timers.
3. **Global data integrity** — store holds exactly 2 vehicles with `zoneName` derived and the
   assigned coordinates.
4. **State changes** — editing the plate to a valid value updates the store; an empty commit
   reverts to the previous plate; `plate.ts` helpers pass unit tests (valid/invalid/prefix cases).

## 10. Acceptance criteria (from request)

- [x] TanStack Table component rendering vehicles.
- [x] Typed Zustand global store deriving fake vehicle data (Tipo, Patente, Estado,
      Zona from zoneId, coordinates).
- [x] Exactly two records with the specified coordinates.
- [x] Editable Patente field.
- [x] §7.1 plate test preserved: not empty (keeps previous), invalid input blocked and prompts to
      change, 700 ms debounce validation.
- [x] Radix skeleton per field lasting 1200 ms.
- [x] Tests cover table render, skeleton, global data integrity, and state changes.
- [x] All code in English; user-visible text in Spanish.

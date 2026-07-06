# Fix — `format:check` en rojo por `.tsbuild-node/` sin ignorar + 4 archivos preexistentes fuera de estilo

- **ID:** FIX-007
- **Status:** Resuelto (aprobado y ejecutado 2026-07-06).
- **Related:** `docs/feature/05-vehicles-header.md` (spec durante cuya verificación se corrió
  `format:check`), `docs/fix/05-format-crlf-and-plate-coverage.md` (fix previo del mismo
  `format:check`, causa raíz distinta), `client/.prettierignore`, `client/.prettierrc`
- **Date:** 2026-07-06

## 1. Síntoma

El usuario corrió `pnpm --filter client format:check` localmente (fuera de esta sesión, que no
puede ejecutar `pnpm` sobre el mount conectado — ver "Diagnóstico" de
[feature 05](../feature/05-vehicles-header.md), "Hallazgos de verificación") y obtuvo:

```
[warn] .tsbuild-node/vite.config.js
[warn] src/features/vehicles/components/VehicleStatusCard.tsx
[warn] src/features/vehicles/components/VehicleStatusCards.test.tsx
[warn] src/features/vehicles/hooks/useVehicleStatusCards.test.ts
[warn] src/features/vehicles/store/useVehicleFiltersStore.ts
Code style issues found in 5 files.
```

Ninguno de los 4 archivos nuevos/modificados de `docs/feature/05-vehicles-header.md`
(`HeaderPage.tsx`, `headerPage.styles.ts`, `HeaderPage.test.tsx`, `VehiclesPage.tsx`) aparece en la
lista — se verificaron aparte, en una copia aislada del repo, y pasan `format:check` (ver spec 05,
"Hallazgos de verificación"). Los 5 archivos listados acá son **preexistentes**, de features
anteriores (02 y 04), no tocados en esta sesión.

## 2. Causa raíz

### 2.1 `.tsbuild-node/vite.config.js` — build artifact no ignorado por Prettier

`.tsbuild-node/` es la carpeta de salida de `tsc -b` (proyecto referenciado de TypeScript para el
propio `vite.config.ts`), y ya está en `.gitignore` (`client/.tsbuild-node/`) — no se commitea.
Pero `client/.prettierignore` solo excluye:

```
dist
coverage
*.tsbuildinfo
```

`.tsbuild-node/` no está en esa lista, y Prettier **no** respeta `.gitignore` automáticamente (solo
lee `.prettierignore`, salvo que se le pase `--ignore-path` explícito, que el script `format:check`
no usa). Por eso, cualquier build local que genere `.tsbuild-node/vite.config.js` hace que
`prettier --check .` lo escanee como si fuera código fuente y lo marque (es JS generado, sin el
estilo de Prettier del proyecto). No es un problema de contenido — es un directorio que nunca
debió entrar al scan.

### 2.2 4 archivos preexistentes con estilo fuera de `printWidth: 100` / semicolons

Confirmado corriendo `prettier` (sin `--check`) sobre cada archivo, en una copia aislada del repo
(mismo mecanismo de verificación de `docs/feature/05-vehicles-header.md`) y comparando el diff:

| Archivo | Problema | Origen |
|---|---|---|
| `client/src/features/vehicles/components/VehicleStatusCard.tsx` | La línea del `Flex` de la caja de ícono (`align`/`justify`/`width`/`height`/`style`) supera los 100 caracteres de `printWidth` (`client/.prettierrc`) y Prettier la parte en múltiples líneas | [feature 02](../feature/02-vehicle-statuscard.md) |
| `client/src/features/vehicles/components/VehicleStatusCards.test.tsx` | Un `;` de más al final de `expect(screen.getByText('En mantenimiento')).toBeInTheDocument();` (`.prettierrc` no usa `semi`, el resto del archivo no lleva punto y coma) | [feature 02](../feature/02-vehicle-statuscard.md) |
| `client/src/features/vehicles/hooks/useVehicleStatusCards.test.ts` | La línea de `const sum = ...` (suma de 3 valores) supera los 100 caracteres | [feature 02](../feature/02-vehicle-statuscard.md) |
| `client/src/features/vehicles/store/useVehicleFiltersStore.ts` | El `import type { CapacityFilter, VehicleStatusFilter, VehicleTypeFilter } from '../constants/vehicleFilterOptions'` supera los 100 caracteres | [feature 04](../feature/04-vehicles-filtertable.md) |

Los 4 casos son el mismo patrón: código escrito a mano en sesiones anteriores que nunca pasó por
`prettier --write` (o el editor del usuario no tiene format-on-save configurado con este
`.prettierrc`), **no** un problema de line endings como en
[FIX-005](./05-format-crlf-and-plate-coverage.md) (confirmado con `grep` de `\r`: los 4 archivos
están en LF puro). El contenido/lógica de los 4 archivos es correcto — es exclusivamente
reformateo, sin cambios de comportamiento.

## 3. Alcance del fix propuesto (no aplicado todavía)

1. **`client/.prettierignore`**: agregar una línea `.tsbuild-node` (junto a `dist`/`coverage`), para
   que cualquier build local de ese proyecto referenciado deje de entrar al scan de Prettier.
2. **`pnpm --filter client format`** (o `prettier --write` puntual sobre los 4 archivos de la
   tabla): reescribe esos 4 archivos con el estilo de `.prettierrc`, sin tocar lógica ni tests
   (mismos aserts, mismo comportamiento — confirmado en el diff de la sección 2.2, solo
   whitespace/semicolons).

Ningún archivo de `docs/feature/05-vehicles-header.md` necesita este fix — ya se verificaron y
pasan `format:check` de forma independiente.

## 4. Resultado esperado (cuando se ejecute)

- `pnpm --filter client format:check` pasa sin warnings.
- `pnpm --filter client typecheck` / `lint` / `test` siguen en verde (no se toca lógica).

## 5. Verificación

Ejecutado sobre una copia aislada del repo (mismo mecanismo que la verificación de
[feature 05](../feature/05-vehicles-header.md), por el problema de mount ya documentado):

1. `pnpm --filter client format:check`: los 5 archivos de la tabla dejan de aparecer. Quedan 5
   warnings preexistentes y **no relacionados** (`src/app/README.md`,
   `src/component-test/README.md`, `src/features/README.md`, `src/shared/README.md`,
   `src/tests/README.md`) — no estaban en el reporte original del usuario ni se tocan en este fix;
   quedan anotados para un fix aparte si se decide encararlos.
2. `pnpm --filter client typecheck` y `pnpm --filter client lint`: en verde.
3. `pnpm --filter client test` — `useVehicleStatusCards.test.ts` (6/6),
   `VehicleStatusCards.test.tsx` (2/2) y `useVehicleFiltersStore.test.ts` (7/7) en verde, mismos
   asserts que antes del fix (ningún test cambió de comportamiento).
4. Diff de los 4 archivos: solo whitespace/saltos de línea/un `;` de más, ninguna línea de lógica
   alterada (confirmado antes de aplicar, sección 2.2).

## 6. Archivos modificados

- `client/.prettierignore`: se agrega `.tsbuild-node`.
- `client/src/features/vehicles/components/VehicleStatusCard.tsx`: reformateo (dos `Flex`/elemento
  condicional que excedían `printWidth`).
- `client/src/features/vehicles/components/VehicleStatusCards.test.tsx`: se quita un `;` de más.
- `client/src/features/vehicles/hooks/useVehicleStatusCards.test.ts`: reformateo de la línea de
  `sum`.
- `client/src/features/vehicles/store/useVehicleFiltersStore.ts`: reformateo del `import type`.

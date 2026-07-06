# SPEC — Fix: `format:check` en 6 archivos de la feature Activos (SPEC-FIX-009)

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/fix/09-assets-page-format.md` (FIX-009, diagnóstico completo),
  `docs/feature/07-assets-page.md` (origen de los 6 archivos), `client/.prettierrc`

## Objetivo

Dejar `pnpm format:check` en verde reformateando, sin cambiar comportamiento, las 7 líneas que
excedían `printWidth: 100` en los 6 archivos reportados por `prettier --check .`.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/assets/api/useAssetsQuery.test.tsx` | El objeto `ASSETS[0]` pasa de una línea a multilínea (una propiedad por línea). | Línea original de 112 caracteres, por sobre `printWidth: 100`. |
| `client/src/features/assets/components/AssetsFilterBar.tsx` | El import de `ASSET_STATUS_FILTER_OPTIONS`/`ASSET_TYPE_FILTER_OPTIONS` pasa a 4 líneas (import multilínea estándar). | Línea original de 105 caracteres. |
| `client/src/features/assets/components/AssetsTable.tsx` | El `<StatusBadge colorRole={...} label={...} />` de la columna Estado pasa a 4 líneas (cada prop en su propia línea). | Línea original de 103 caracteres con indentación. |
| `client/src/features/vehicles/components/VehiclesTable.tsx` | Mismo cambio que `AssetsTable.tsx`, sobre el `<StatusBadge>` de la columna Estado de vehículos (migrado al componente compartido en el mismo spec). | Mismo motivo: línea de 103 caracteres. |
| `client/src/features/assets/store/useAssetsStore.ts` | `removeAsset` pasa de una línea a 2: `(id) =>` y el `set(...)` en la línea siguiente, indentado. | Línea original de 105 caracteres. |
| `client/src/features/assets/store/useAssetsStore.test.ts` | Los 2 objetos del array `ASSETS` pasan a multilínea; el `toEqual([{ ...ASSETS[0], status: 'DAMAGED' }, ASSETS[1]])` de `updateAsset` pasa a 4 líneas. | 3 líneas originales de 103-117 caracteres. |

No se modificó ninguna aserción de test, ninguna firma de función ni ninguna lógica de negocio: es
un cambio puramente de formato (whitespace/line-breaks), equivalente al resultado esperado de
`prettier --write .`.

## Verificación post-implementación

1. `pnpm --filter client format:check` — sin warnings en los 6 archivos listados.
2. `pnpm --filter client typecheck` y `pnpm --filter client lint` — sin regresiones (el cambio no
   toca tipos ni imports funcionales, solo saltos de línea).
3. `pnpm --filter client test` — mismas aserciones, mismo resultado que antes del fix.

## Estado de implementación

- ✅ Los 6 archivos reformateados manualmente según la tabla de arriba.
- ⏳ `pnpm --filter client format:check/typecheck/lint/test` — pendiente de confirmación local del
  usuario: el entorno de esta sesión no pudo instalar dependencias para correr Prettier/ESLint/
  Vitest directamente (misma limitación de mount ya documentada en
  [feature 07](../feature/07-assets-page.md), "Hallazgos de verificación", y en fixes anteriores
  como [fix 08](../fix/08-vehicles-page-addvehicle-coverage.md)).

# Fix — `pnpm format:check` falla en 6 archivos de `docs/feature/07-assets-page.md`

- **ID:** FIX-009
- **Status:** Resuelto — ver `docs/specs/fix-assets-page-format.md`
- **Related:** `docs/feature/07-assets-page.md` (origen de los 6 archivos), `client/.prettierrc`,
  `docs/specs/architecture.md` (Quality Gates)
- **Date:** 2026-07-06

## 1. Síntoma

`pnpm format:check` (delega a `pnpm --filter client format:check` → `prettier --check .`) reporta
código mal formateado en 6 archivos, todos nuevos o modificados por
[feature 07](../feature/07-assets-page.md):

```
[warn] src/features/assets/api/useAssetsQuery.test.tsx
[warn] src/features/assets/components/AssetsFilterBar.tsx
[warn] src/features/assets/components/AssetsTable.tsx
[warn] src/features/assets/store/useAssetsStore.test.ts
[warn] src/features/assets/store/useAssetsStore.ts
[warn] src/features/vehicles/components/VehiclesTable.tsx
[warn] Code style issues found in 6 files. Run Prettier with --write to fix.
```

`pnpm format:check` no ejecuta `--write`: solo valida y falla el proceso (`exit code 1`) si algún
archivo no coincide con el formato que Prettier aplicaría — bloquea el Quality Gate de CI
(`docs/specs/architecture.md` → "Quality Gates").

## 2. Causa raíz

Los 6 archivos fueron escritos a mano durante la implementación de
[feature 07](../feature/07-assets-page.md) sin pasar por `prettier --write` (el entorno de esa
sesión no pudo instalar dependencias para correr Prettier, ver "Hallazgos de verificación" de ese
mismo spec). Todos comparten el mismo patrón de violación contra `client/.prettierrc`
(`printWidth: 100`, `semi: false`, `singleQuote: true`, `trailingComma: "none"`):

| Archivo | Línea(s) originales | Regla violada |
|---|---|---|
| `useAssetsQuery.test.tsx` | objeto literal `ASSETS[0]` en una sola línea (112 car.) | `printWidth: 100` |
| `AssetsFilterBar.tsx` | import de `ASSET_STATUS_FILTER_OPTIONS`/`ASSET_TYPE_FILTER_OPTIONS` en una sola línea (105 car.) | `printWidth: 100` |
| `AssetsTable.tsx` | `<StatusBadge colorRole={...} label={...} />` en una sola línea dentro del `return` (103 car. con indentación) | `printWidth: 100` |
| `VehiclesTable.tsx` | mismo patrón que `AssetsTable.tsx` (introducido al migrar a `StatusBadge` compartido en el mismo spec) | `printWidth: 100` |
| `useAssetsStore.ts` | `removeAsset: (id) => set((state) => ({ ... }))` en una sola línea (105 car.) | `printWidth: 100` |
| `useAssetsStore.test.ts` | 2 objetos literales `ASSETS` en una sola línea (111-117 car.) + array `toEqual([{ ... }, ASSETS[1]])` en una sola línea (103 car.) | `printWidth: 100` |

En todos los casos el código era funcionalmente correcto (typecheck/lint no se ven afectados por
este gap, solo formato); el común denominador es una línea que excede los 100 caracteres del
`printWidth` configurado, que Prettier reformatea partiendo el literal/import/JSX en múltiples
líneas.

## 3. Alcance del fix

Reformatear manualmente las 7 líneas señaladas (partiendo objetos, imports y JSX multilínea) en los
6 archivos, replicando el resultado que produciría `prettier --write .`, sin tocar lógica de
producción ni aserciones de test. Ver `docs/specs/fix-assets-page-format.md` para el detalle
archivo por archivo.

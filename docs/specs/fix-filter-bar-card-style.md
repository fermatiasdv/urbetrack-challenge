# SPEC — Fix: diseño "bento" para la card de filtros

- **Estado:** ⚠️ Descartado por el usuario el 2026-07-06, antes de verificación visual. Reemplazado
  por [docs/specs/fix-filter-inputs-style.md](./fix-filter-inputs-style.md) (diseño de inputs
  individuales, sin card contenedora). Este documento queda solo como registro histórico de la
  decisión intermedia.
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/specs/fix-status-cards-card-style.md` (mismo lenguaje visual, aplicado
  primero a las cards de estado), `client/src/features/vehicles/components/vehiclesFilterBar.styles.ts`,
  `client/src/features/assets/components/assetsFilterBar.styles.ts`,
  `client/src/features/incidents/components/incidentsFilterBar.styles.ts`

## Objetivo

Extender a la card de filtros (barra de filtros de Vehículos, Activos e Incidentes) el mismo
diseño "bento" ya aplicado a las cards de estado: fondo con gradiente sutil, borde translúcido,
blur, radio de 24px y sombra en dos capas.

Las 3 features tienen su propio `filterBarContainerStyle`, duplicado idéntico en 3 archivos (no
hay un componente compartido de filter bar, a diferencia de `StatusSummaryCard`), así que el cambio
se replica en los 3 archivos de estilos por igual.

## Estilo nuevo (análogo a `cardContainerStyle`)

```ts
export const filterBarContainerStyle: CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)',
  border: '1px solid rgba(255,255,255,.6)',
  backdropFilter: 'blur(8px)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.05)'
}
```

Reemplaza el `filterBarContainerStyle` anterior (`surfaceContainerLowest` + `spacing.md` +
`rounded.xl` + borde `outlineVariant` + sombra de una sola capa) por los mismos valores literales
usados en `cardContainerStyle` — mismo criterio que el spec de las status cards: valores exactos,
sin pasar por `designTokens`, para mantener consistencia visual entre ambos componentes.

## Cambios

| Archivo | Cambio |
|---|---|
| `client/src/features/vehicles/components/vehiclesFilterBar.styles.ts` | `filterBarContainerStyle` reemplazado por el objeto de arriba. `filterFieldLabelStyle` sin cambios. |
| `client/src/features/assets/components/assetsFilterBar.styles.ts` | Idem. |
| `client/src/features/incidents/components/incidentsFilterBar.styles.ts` | Idem. |

No se toca `VehiclesFilterBar.tsx`, `AssetsFilterBar.tsx` ni `IncidentsFilterBar.tsx`: ya consumen
`filterBarContainerStyle` vía `style={filterBarContainerStyle}` en el `Flex` contenedor, así que el
cambio de estilo se propaga sin tocar JSX.

## Fuera de alcance

- Extraer un componente/estilo compartido para las 3 filter bars (duplicación preexistente, no
  introducida por este cambio).
- Cambios en los campos de filtro (Select, Popover, TextField) o en su lógica.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sobre los 3 archivos tocados.
2. Verificación visual: la barra de filtros en Vehículos, Activos e Incidentes muestra el mismo
   fondo, borde, blur, radio y sombra que las cards de estado.

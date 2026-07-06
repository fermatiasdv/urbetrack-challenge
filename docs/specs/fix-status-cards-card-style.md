# SPEC — Fix: nuevo estilo visual para las cards de estado

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `client/src/shared/components/StatusSummaryCard.tsx`,
  `client/src/shared/components/statusSummaryCard.styles.ts`,
  `docs/feature/07-assets-page.md` ("Generalización a `shared/`"),
  `docs/feature/02-vehicle-statuscard.md`

## Objetivo

Aplicar un nuevo estilo visual (fondo con gradiente sutil, borde translúcido, blur, radio de 24px y
sombra en dos capas) a las cards de estado, sin tocar su lógica ni sus datos.

Las 3 features (Vehículos, Activos, Incidentes) comparten un único componente de card
(`StatusSummaryCard.tsx`, usado a través de `StatusSummaryCards.tsx`), así que el cambio se hace en
un solo lugar y se propaga a las 3 páginas automáticamente.

## Estilo pedido por el usuario

```ts
const cardStyle = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FCFCFD 100%)',
  border: '1px solid rgba(255,255,255,.6)',
  backdropFilter: 'blur(8px)',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.05)'
}
```

## Cambios

| Archivo | Cambio |
|---|---|
| `client/src/shared/components/statusSummaryCard.styles.ts` | Agrega `export const cardContainerStyle: CSSProperties` con el objeto de arriba. |
| `client/src/shared/components/StatusSummaryCard.tsx` | El `<Card variant="surface" size="3">` pasa a `<Card variant="ghost" style={cardContainerStyle}>` (se quita `variant="surface"`/`size="3"` de Radix, que traían su propio fondo/padding/sombra, y se usa `variant="ghost"` para no arrastrar estilos de Radix que choquen con el `style` inline). |

Nota de tipado: el objeto pedido por el usuario se tipa como `CSSProperties` (ya usado en el resto
del archivo), pero sin un tipo más estricto por campo — decisión explícita del usuario para este
cambio puntual, se salta la regla general de tipado fuerte del proyecto.

## Fuera de alcance

- Cambios en los datos/lógica de `useVehicleStatusCards`, `useAssetStatusCards`,
  `useIncidentStatusCards`.
- Cambios en `StatusBadge.tsx` u otros componentes no relacionados a las cards de estado.
- Ajustes de layout del `Grid` en `StatusSummaryCards.tsx` (columnas, gap).

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sobre los 2 archivos tocados.
2. Verificación visual: las cards de estado en Vehículos, Activos e Incidentes muestran el nuevo
   fondo, borde, blur, radio y sombra.

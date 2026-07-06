# SPEC — Fix: nuevo diseño de inputs para las filter bars (reemplaza la card "bento")

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** [docs/specs/fix-filter-bar-card-style.md](./fix-filter-bar-card-style.md)
  (descartado por este spec), `client/src/features/vehicles/components/VehiclesFilterBar.tsx`,
  `client/src/features/assets/components/AssetsFilterBar.tsx`,
  `client/src/features/incidents/components/IncidentsFilterBar.tsx`

## Objetivo

Descartar el diseño de card contenedora (fondo gradiente + blur) de
`fix-filter-bar-card-style.md` y reemplazarlo por un diseño de inputs individuales: sin fondo/borde
en el contenedor, cada campo (texto, select, botón "Zona", botón "Restablecer") con su propia caja
(fondo blanco, borde `#E2E8F0`, radio 12px, sombra sutil).

Mismo alcance que el spec anterior: las 3 features (Vehículos, Activos, Incidentes) tienen su
propio archivo `*FilterBar.styles.ts` duplicado, se replica el cambio en los 3.

## Estilos nuevos (dados por el usuario)

```ts
export const filterContainer = { display: 'flex', gap: '12px', alignItems: 'end' }
export const field = { display: 'flex', flexDirection: 'column', gap: '6px' }
export const label = { fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '.02em' }
export const input = {
  height: '40px', padding: '0 12px', borderRadius: '12px', border: '1px solid #E2E8F0',
  background: '#FFF', fontSize: '13px', color: '#0F172A', outline: 'none',
  boxShadow: '0 1px 2px rgba(15,23,42,.03)', transition: 'all .2s ease'
}
export const plateInput = { ...input, width: '240px', fontSize: '13px', fontWeight: 500, letterSpacing: '.04em' }
export const select = { ...input, width: '180px' }
export const resetButton = {
  height: '40px', padding: '0 16px', borderRadius: '12px', border: '1px solid #E2E8F0',
  background: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 600,
  cursor: 'pointer', transition: '.2s'
}
```

Se tipan como `CSSProperties` (import de `react`) en cada archivo — necesario para que
`flexDirection`/etc. compilen como `style` de React — sin agregar tipos propios en `shared/types`
(mismo criterio de "saltear tipado estricto" ya aprobado en
[fix-status-cards-card-style.md](./fix-status-cards-card-style.md)).

`plateInput` corrige además el ancho del campo de placa: antes crecía a `flex: '1 1 240px'` (podía
llegar a ~850px en pantallas anchas); ahora queda fijo en 240px como los demás campos.

## Cambios

| Archivo | Cambio |
|---|---|
| `client/src/features/vehicles/components/vehiclesFilterBar.styles.ts` | Reemplaza `filterBarContainerStyle`/`filterFieldLabelStyle` por los 7 estilos de arriba. Se quita el import de `designTokens` (ya sin uso). |
| `client/src/features/assets/components/assetsFilterBar.styles.ts` | Idem (sin `plateInput` en uso, pero se exporta igual por consistencia con el otro archivo). |
| `client/src/features/incidents/components/incidentsFilterBar.styles.ts` | Idem. |
| `client/src/features/vehicles/components/VehiclesFilterBar.tsx` | El `Flex` externo pasa de `style={filterBarContainerStyle}` a `style={filterContainer}` (se mantiene `wrap="wrap"` y `mb="4"` como props de Radix, no estilos, para conservar el layout responsive). Cada `Flex direction="column"` de campo pasa a `style={field}` (se quita el `width` hardcodeado, ahora lo da `input`/`select`/`plateInput`). Labels usan `style={label}`. El `TextField.Root` de placa usa `style={plateInput}`. Los 3 `Select.Trigger` usan `style={select}`. El botón "Zona" usa `style={select}` (mismo look de caja que un select). El botón "Restablecer" usa `style={resetButton}`. |
| `client/src/features/assets/components/AssetsFilterBar.tsx` | Mismo patrón, sin campo de placa. |
| `client/src/features/incidents/components/IncidentsFilterBar.tsx` | Idem. |

No se cambian roles/aria-labels/textos (`combobox` "Tipo"/"Capacidad"/"Estado", `button` "Zona"/
"Restablecer", placeholder `"ABC-1234"`), así que los tests existentes
(`VehiclesFilterBar.test.tsx`, `AssetsFilterBar.test.tsx`, `IncidentsFilterBar.test.tsx`) no
requieren cambios.

## Fuera de alcance

- Extraer un componente/estilo compartido para las 3 filter bars (duplicación preexistente).
- Cambios en la lógica de filtrado o en los stores.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sobre los 6 archivos tocados.
2. Verificación visual: los campos de las 3 filter bars muestran caja blanca individual con borde
   gris claro, radio 12px y sombra sutil; el campo de placa en Vehículos ya no se estira a lo ancho
   de la pantalla.

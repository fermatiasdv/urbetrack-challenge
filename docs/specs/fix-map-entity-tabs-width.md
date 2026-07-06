# SPEC — Fix: ancho fijo del 75% para las tablas de Mapa

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `client/src/features/map/pages/MapPage.tsx`,
  `client/src/features/map/components/mapPage.styles.ts`

## Pedido del usuario

Que `MapEntityTabs` (las 3 tablas — Activos/Vehículos/Incidentes — debajo del mapa en `/`) ocupe el
75% del ancho de la pantalla, como valor fijo (no relativo al contenido ni a otro contenedor).

## Diagnóstico

`MapPage.tsx` monta `<MapEntityTabs />` como último hijo del `Flex direction="column"` de la
página, sin ningún ancho propio — hereda el 100% del `mapLayoutStyle` (`width: '100%'`) que envuelve
a toda la columna.

## Cambio

| Archivo | Cambio |
|---|---|
| `client/src/features/map/components/mapPage.styles.ts` | Nuevo `mapEntityTabsContainerStyle: CSSProperties = { width: '75%' }`. |
| `client/src/features/map/pages/MapPage.tsx` | `<MapEntityTabs />` pasa a estar envuelto en `<Box style={mapEntityTabsContainerStyle}>`, fijando su ancho al 75% de la pantalla (relativo al contenedor de la página, no al contenido de las tablas). |

No se toca `mapLayoutStyle` (`width: 100%`, usado también por la fila mapa+panel) ni el ancho del
mapa/panel — el 75% pedido es específico de `MapEntityTabs`.

## Fuera de alcance

- Ancho del mapa (`mapContainerStyle`) o del panel lateral (`panel`).
- Comportamiento responsive del 75% en pantallas muy angostas (no pedido).

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test`.
2. Verificación visual: las 3 tablas de Mapa ocupan el 75% del ancho disponible, con el mismo
   ancho fijo sin importar la pestaña activa.

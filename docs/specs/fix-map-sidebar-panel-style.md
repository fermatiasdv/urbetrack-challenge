# SPEC — Fix: rediseño del panel derecho del mapa (filtros + leyendas)

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/specs/fix-filter-inputs-style.md` (mismo lenguaje visual de inputs,
  aplicado ahora al panel del mapa), `docs/feature/13-asset-legend.md`,
  `docs/feature/14-assets-in-heatmap.md`, `docs/feature/10-maps-create.md` ("Heatmap"),
  `client/src/features/map/pages/MapPage.tsx` y todo `client/src/features/map/components/*`
  relacionado a filtros/leyendas.

## Objetivo

Rediseñar el panel a la derecha del mapa (toggle de heatmap, leyenda de activos, filtros del
heatmap y leyenda de incidentes) con el diseño "bento" dado por el usuario: panel contenedor,
secciones internas con header (título + subtítulo), tarjeta de toggle, leyendas con "dot" y
filtros en grid de 2 columnas con dropdowns rediseñados.

## Diagnóstico del estado actual

`MapPage.tsx` monta, en un `Flex` de 220px (`heatmapSidebarStyle`, `mapPage.styles.ts`), 4
componentes hermanos sin agrupación visual:

1. `AssetLegend` — siempre visible, título "Activos" + 4 dots (colores de
   `assetMarkerColor`, los mismos que los pines del mapa).
2. `HeatmapFilters` — solo si `heatmapEnabled`, dos `HeatmapFilterGroup` (Estado/Tipo de
   incidente).
3. `AssetHeatmapFilters` — solo si `heatmapEnabled`, dos `HeatmapFilterGroup` (Estado/Tipo de
   activo).
4. `HeatmapLegend` — solo si `heatmapEnabled`, título "Incidentes" + 3 dots, **y además** título
   "Activos" + los mismos 4 dots que `AssetLegend` (duplicado).

El toggle de heatmap vive aparte, en el `<Heading>` de arriba del mapa (`<input type="checkbox">`
suelto con texto "Mapa de calor").

`HeatmapFilterGroup` (compartido por 2 y 3) usa un `Popover` con `Button variant="surface"` de
trigger y un `CheckboxGroup` sin estilo propio — el "look clásico" que el usuario pide rediseñar.

## Jerarquía visual pedida por el usuario

```
☑ Mapa de calor              (toggleCard, siempre visible)
Visualiza intensidad en el mapa

ACTIVOS                       (section "Activos", siempre visible)
Filtra los activos visibles
● OK ● Completo ● Dañado ● Fuera de servicio
Estado          Tipo          (HeatmapFilters, solo si heatmapEnabled)
[Todos ▼]     [Todos ▼]
Estado activo   Tipo activo    (AssetHeatmapFilters, solo si heatmapEnabled)
[Todos ▼]     [Todos ▼]

MAPA DE CALOR                 (section "Mapa de calor", solo si heatmapEnabled)
Incidentes resaltados
● Reportado ● En progreso ● Resuelto
```

Diferencia de comportamiento respecto a hoy: `HeatmapLegend` deja de repetir los 4 dots de
activos (ya están arriba, en la sección "Activos") — pasa a mostrar únicamente los 3 estados de
incidente. Los 2 grupos de filtros (`HeatmapFilters`, `AssetHeatmapFilters`) quedan anidados
**dentro** de la caja de la sección "Activos" (no como hermanos sueltos), apilados en 2 filas de 2
columnas cada una, como pide la jerarquía.

## Estilos nuevos (dados por el usuario, en `mapSidebarPanel.styles.ts`)

`panel`, `section`, `sectionHeader`, `title`, `subtitle`, `toggleCard`, `legend`, `legendItem`,
`dot(color)`, `filters`, `label`, `select`, `dropdownMenu`, `checkboxItem`, `colors` — literales,
tal cual los pasó el usuario. Se agregan 2 helpers de layout no provistos explícitamente pero
necesarios para que `title`/`subtitle` queden apilados dentro de `sectionHeader` (que es
`justify-content: space-between`, pensado para dejar lugar a un elemento a la derecha si hiciera
falta a futuro):

```ts
export const sectionHeaderTextGroup: CSSProperties = { display: 'flex', flexDirection: 'column' }
export const toggleTextGroup: CSSProperties = { display: 'flex', flexDirection: 'column' }
```

`colors` (paleta nueva: `success/danger/warning/inactive/reported/progress/solved`) reemplaza,
**solo para los "dots" de las leyendas del panel**, a `assetMarkerColor`/`INCIDENT_STATUS_COLORS`.
No se tocan esos 2 archivos ni los colores de los pines/heatmap del mapa en sí (fuera de alcance,
ver abajo) — incluye un desvío deliberado en `OUT_OF_SERVICE` (pin: negro `#000000`, dot nuevo:
`inactive` `#475569`) y en `IN_PROGRESS` (pin: `#eab308`, dot nuevo: `progress` `#FACC15`), ambos
tal cual los valores que dio el usuario.

## Cambios (archivo por archivo)

| Archivo | Cambio |
|---|---|
| `client/src/features/map/components/mapSidebarPanel.styles.ts` (nuevo) | Los 14 estilos + paleta + 2 helpers de layout. |
| `client/src/features/map/components/HeatmapToggle.tsx` (nuevo) | Extrae el `<input type="checkbox">` + texto de `MapPage.tsx`, estilizado con `toggleCard` ("Mapa de calor" en negrita + subtítulo "Visualiza intensidad en el mapa"). Lee/escribe `useMapStore` (`heatmapEnabled`/`toggleHeatmap`) igual que antes. |
| `client/src/features/map/components/HeatmapToggle.test.tsx` (nuevo) | Cubre el toggle (estado inicial, click). |
| `client/src/features/map/components/AssetLegend.tsx` | Pasa a ser la sección completa "Activos": `section` + `sectionHeader` (título "Activos", subtítulo "Filtra los activos visibles") + `legend`/`legendItem`/`dot`. Agrega prop opcional `children` para anidar ahí mismo los 2 grupos de filtros del heatmap. Mismo `data-testid="asset-legend"` y mismos textos de status (`OK`/`Completo`/`Dañado`/`Fuera de servicio`), sin cambios para el test existente. |
| `client/src/features/map/components/AssetLegend.test.tsx` | Agrega un caso: renderiza `children` dentro de la sección. |
| `client/src/features/map/components/HeatmapFilters.tsx` | El `Flex` raíz pasa de `gap="4" align="end"` a `style={filters}` (grid 2 columnas). Mismo `data-testid="heatmap-filters"`. |
| `client/src/features/map/components/AssetHeatmapFilters.tsx` | Idem, `style={filters}`, mismo `data-testid="asset-heatmap-filters"`. |
| `client/src/features/map/components/HeatmapFilterGroup.tsx` | El `Text` de label pasa a `style={label}`; el `Button` trigger pasa a `style={select}`; `Popover.Content` pasa a `style={dropdownMenu}` (se quita el `Flex direction="column" gap="2"` interno, redundante con el propio `flexDirection`/`gap` de `dropdownMenu`); la fila "Todos" y cada `CheckboxGroup.Item` usan `style={checkboxItem}`. |
| `client/src/features/map/components/HeatmapLegend.tsx` | Se quita la sección de activos (duplicada). Pasa a ser la sección "Mapa de calor": `section` + `sectionHeader` (título "Mapa de calor", subtítulo "Incidentes resaltados") + `legend`/`legendItem`/`dot` con los 3 estados de incidente. Mismo `data-testid="heatmap-legend"`. |
| `client/src/features/map/components/HeatmapLegend.test.tsx` | Se quita la aserción de los 4 estados de activo (ya no se renderizan acá). |
| `client/src/features/map/pages/MapPage.tsx` | Quita el checkbox suelto del `<Heading>`; monta `<HeatmapToggle />` primero en el panel. El panel pasa de `style={heatmapSidebarStyle}` (220px) a `style={{ ...panel, flexShrink: 0 }}` (320px, "bento"; `flexShrink: 0` agregado localmente, no viene en el objeto `panel` dado por el usuario, para que no se achique dentro del `Flex` del mapa como sí hacía `heatmapSidebarStyle` antes). `HeatmapFilters`/`AssetHeatmapFilters` pasan a ser `children` de `<AssetLegend>` (solo si `heatmapEnabled`, igual que antes). `HeatmapLegend` sigue como hermano, gated igual que antes. |
| `client/src/features/map/components/mapPage.styles.ts` | Se quitan `heatmapSidebarStyle` y `legendSwatchStyle` (sin uso tras el cambio; `mapContainerStyle`/`mapLayoutStyle` quedan igual). |

## Fuera de alcance

- Colores de los pines/markers en el mapa (`assetMarkerColor.ts`, `incidentStatusColors.ts`,
  `HeatmapLayer.tsx`, `IncidentMarkersLayer.tsx`, `AssetMarkersLayer.tsx`): la paleta `colors`
  nueva es solo para los "dots" del panel lateral, no para los pines/gradiente del heatmap real.
- Reemplazar `Select`/`Popover` de Radix por un dropdown propio no-Radix: se sigue usando
  `Popover`+`CheckboxGroup` de Radix, solo restyleado vía `style` (mismo criterio que
  `fix-filter-inputs-style.md`).
- Cambios en `ZoneLayer`, `AssetMarkersLayer`, `IncidentMarkersLayer`, `AvailabilityAlert`,
  `MapEntityTabs`.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` sobre los archivos tocados.
2. `MapPage.test.tsx` sigue en verde sin cambios (mismos `data-testid`, mismo comportamiento de
   gating por `heatmapEnabled`).
3. Verificación visual: jerarquía igual a la pedida por el usuario (toggle arriba, sección
   "Activos" con leyenda + ambos filtros anidados, sección "Mapa de calor" solo con incidentes).

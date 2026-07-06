# SPEC — Fix: la tabla (y la alerta de disponibilidad) se corren al activar el heatmap

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/specs/fix-map-sidebar-panel-style.md` (rediseño del panel que introdujo
  este bug), `client/src/features/map/pages/MapPage.tsx`

## Pedido del usuario

1. Al tildar "Mapa de calor" en `/` (Mapa), toda la tabla de abajo (`MapEntityTabs`) se mueve hacia
   abajo — no debe moverse.
2. La alerta de "no hay vehículos disponibles" para una zona dejó de verse.

## Diagnóstico

`MapPage.tsx` arma la fila mapa+panel así:

```tsx
<Flex style={mapLayoutStyle}>
  <MapContainer style={mapContainerStyle} />  {/* height: 520px, fijo */}
  <Flex style={{ ...panel, flexShrink: 0 }}>  {/* alto variable, según contenido */}
    <HeatmapToggle />
    <AssetLegend>{heatmapEnabled && <>...filtros...</>}</AssetLegend>
    {heatmapEnabled && <HeatmapLegend />}
  </Flex>
</Flex>
```

El alto de un `Flex` (row) lo determina su hijo más alto. `MapContainer` es fijo (520px), pero el
panel de la derecha **crece** cuando `heatmapEnabled` pasa a `true` (aparecen los 2 grupos de
filtros + la sección "Mapa de calor"). Ese crecimiento estira la fila entera más allá de 520px, y
como es un elemento normal del flujo (no `position: absolute`), todo lo que viene **después** en el
`Flex direction="column"` que envuelve a toda la página —`AvailabilityAlert` y `MapEntityTabs`— se
corre hacia abajo en la misma medida.

Este mismo corrimiento explica el punto 2: la alerta no "desapareció" del DOM (su lógica en
`useAssignmentStore`/`zoneHasAvailableVehicle` no se tocó y sigue siendo correcta) — se corrió hacia
abajo junto con la tabla, quedando fuera del viewport visible sin señal de que hay contenido para
scrollear, lo que se percibe como que desapareció.

## Cambio

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/map/pages/MapPage.tsx` | El panel agrega `maxHeight: mapContainerStyle.height` (520px, misma fuente que el alto fijo del mapa) y `overflowY: 'auto'`. | Al topear el alto del panel al alto del mapa, la fila mapa+panel **nunca crece** más allá de 520px sin importar cuántas secciones/filtros aparezcan adentro — si el contenido del panel no entra, scrollea internamente en vez de estirar la fila. `AvailabilityAlert`/`MapEntityTabs` quedan siempre en la misma posición, se togglee o no el heatmap. |

## Fuera de alcance

- Cambios en `useAssignmentStore`, `zoneHasAvailableVehicle` o `useSyncAssignmentStore`: se
  revisaron y no tienen ningún bug relacionado — la alerta se sigue calculando igual que antes.
- Un rediseño del panel para que quepa todo su contenido sin scroll interno a 520px (no pedido;
  con el heatmap activo, el panel puede necesitar scroll propio si la ventana es angosta, ver
  "Gaps a resolver").

## Gaps a resolver / verificar

1. A 520px de alto, el panel completo (toggle + sección Activos con 4 dots + 2 filas de filtros +
   sección Mapa de calor con 3 dots) puede necesitar scroll interno en heatmap activo, según la
   tipografía/zoom real del navegador — se prioriza no correr la tabla (pedido explícito) sobre
   que el panel quepa siempre sin scroll.

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` — `MapPage.test.tsx` no depende de alturas
   pixel-perfect, no debería requerir cambios.
2. Verificación visual: togglear "Mapa de calor" en `/` no mueve ni `AvailabilityAlert` ni
   `MapEntityTabs`; con una zona sin vehículos `ACTIVE`, la alerta roja sigue visible en la misma
   posición de antes.

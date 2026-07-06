# SPEC — Fix: color violeta para incidentes `RESOLVED` + tooltip de activo refleja su estado real

- **Estado:** Aprobado por el usuario (2026-07-06). Implementado en esta sesión.
- **Fecha:** 2026-07-06
- **Relacionado:** [docs/verified-scope.md](../verified-scope.md) §10.6 y §10.7 (decisiones a
  revertir/actualizar), [docs/feature/10-maps-create.md](../feature/10-maps-create.md) (spec
  fundacional del mapa, "Tooltip" y "Heatmap"), `client/src/features/map/constants/incidentStatusColors.ts`,
  `client/src/features/map/components/AssetTooltip.tsx`

## Objetivo

Dos cambios independientes, pedidos directamente por el usuario:

1. Cambiar el color asociado al estado `RESOLVED` de incidente (verde) a **violeta**. Afecta,
   consistentemente, a los tres consumidores de la misma paleta: `IncidentMarkersLayer` (marcador de
   incidente independiente), `HeatmapLayer` (gradiente por estado) y `HeatmapLegend` (referencia).
2. Corregir el tooltip de activo: hoy muestra siempre el texto fijo "Estado OK" en verde cuando el
   activo no tiene incidente asociado, **sin importar el estado real del activo**. Esto produce la
   inconsistencia que reportó el usuario: un activo `FULL` (marcador rojo) sin incidente asociado
   muestra igual "Estado OK" en verde. El tooltip debe reflejar el estado real del activo (`OK`,
   `FULL` → "Completo", `DAMAGED` → "Dañado", `OUT_OF_SERVICE` → "Fuera de servicio"), con un color
   coherente con el del marcador.

## Diagnóstico

### 1. Color de `RESOLVED`

- `client/src/features/map/constants/incidentStatusColors.ts` línea 14: `RESOLVED: '#22c55e'`
  (verde). Es la única fuente de verdad consumida por:
  - `IncidentMarkersLayer.tsx` (color del marcador de un incidente independiente),
  - `HeatmapLayer.tsx` (gradiente monocromático por estado),
  - `HeatmapLegend.tsx` (swatch + etiqueta).
  Al cambiar un solo valor, los tres quedan consistentes automáticamente (ya es el diseño buscado:
  "same wording... so both readings agree", comentario existente en el archivo).
- No hay tests que aserten el hex `#22c55e` para `RESOLVED` específicamente (`assetMarkerColor.test.ts`
  testea el verde de **activo** `OK`, que es un valor y archivo distintos, no se toca).
- Esto revierte la resolución documentada en `docs/verified-scope.md` §10.7 ("`RESOLVED` verde"),
  que pasa a "`RESOLVED` violeta" por pedido directo del usuario (2026-07-06).

### 2. Tooltip de activo ("Estado OK" fijo)

- `client/src/features/map/components/AssetTooltip.tsx`: el componente solo recibe
  `associatedIncident: AssociatedIncident | null` — **no recibe el estado del activo**. Si
  `associatedIncident === null`, renderiza siempre el literal `"Estado OK"` en verde
  (`<Text color="green">`), sin mirar `asset.status`.
- Esto fue una decisión explícita documentada en `docs/verified-scope.md` §10.6 ("si el activo no
  tiene un incidente asociado, el tooltip muestra la leyenda 'Estado OK.' en verde"), pero el
  usuario ahora reporta que es confuso: un activo `FULL` (marcador rojo, `docs/feature/13-asset-legend.md`
  lo etiqueta "Completo") sin incidente asociado muestra igual "Estado OK" verde en el tooltip,
  contradiciendo el color del propio marcador.
- `client/src/features/map/utils/assetMarkerColor.ts` ya tiene todo lo necesario para el fix:
  `ASSET_STATUS_LEGEND_LABELS` (`OK`→"OK", `FULL`→"Completo", `DAMAGED`→"Dañado",
  `OUT_OF_SERVICE`→"Fuera de servicio") y los colores literales del marcador (verde/rojo/naranja/negro).
  Falta una traducción a los tokens de color que acepta `Text` de Radix Themes (no toma hex libre):
  `green`/`red`/`orange`/`gray` (Radix no tiene un rol "negro" dedicado — mismo precedente ya usado
  en `features/assets/utils/assetFormat.ts` → `assetStatusColorRole`, que mapea `OUT_OF_SERVICE` a
  `'neutral'`/gris por la misma razón).
- `AssetMarkersLayer.tsx` invoca `<AssetTooltip associatedIncident={...} />` sin pasar `asset.status`;
  hay que agregar esa prop.

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/features/map/constants/incidentStatusColors.ts` | `RESOLVED: '#22c55e'` → `RESOLVED: '#8b5cf6'` (violeta, Tailwind `violet-500`, mismo criterio de paleta que los demás valores del archivo); actualizar JSDoc ("RESOLVED verde" → "RESOLVED violeta"). | Pedido directo del usuario. |
| `client/src/features/map/components/AssetTooltip.tsx` | Agregar prop `assetStatus: AssetStatus`. Cuando `associatedIncident === null`, renderizar `ASSET_STATUS_LEGEND_LABELS[assetStatus]` con el color Radix correspondiente (`OK`→green, `FULL`→red, `DAMAGED`→orange, `OUT_OF_SERVICE`→gray) en vez del literal fijo "Estado OK" verde. Actualizar JSDoc. | Corrige la inconsistencia reportada: el tooltip debe reflejar el estado real del activo. |
| `client/src/features/map/utils/assetMarkerColor.ts` | Agregar `ASSET_STATUS_TOOLTIP_COLOR: Record<AssetStatus, 'green' \| 'red' \| 'orange' \| 'gray'>` (o similar), exportado para que `AssetTooltip` lo consuma sin duplicar la matriz de estados. | Única fuente de verdad de la relación estado→color dentro de `map` (sin importar de `features/assets`, regla de dependencia de `architecture.md`). |
| `client/src/features/map/components/AssetMarkersLayer.tsx` | Pasar `assetStatus={asset.status}` a `<AssetTooltip>`. | El tooltip necesita el estado del activo que lo contiene. |
| `client/src/features/map/components/AssetTooltip.test.tsx` | Reemplazar el caso "shows 'Estado OK'..." por casos para los 4 estados (`OK`→"OK", `FULL`→"Completo", `DAMAGED`→"Dañado", `OUT_OF_SERVICE`→"Fuera de servicio"), todos sin incidente asociado. | El test congelaba el texto fijo anterior. |
| `client/src/features/map/components/AssetMarkersLayer.test.tsx` | Agregar caso: un activo `FULL` sin incidente asociado muestra "Completo" en el tooltip (no "Estado OK"). | Cubre la integración del nuevo prop. |
| `docs/verified-scope.md` | Actualizar §10.6 (tooltip ya no es fijo "Estado OK", sino el estado real del activo) y §10.7 (`RESOLVED` pasa a violeta), marcando la actualización con fecha 2026-07-06 y motivo (pedido directo del usuario), siguiendo el mismo patrón que la actualización de §10.8 ya presente en el documento. | Mantener el documento de scope verificado como fuente de verdad vigente. |
| `docs/feature/10-maps-create.md` | Actualizar las menciones a "Estado OK en verde" (línea ~133, CA-11) y a "`RESOLVED` verde" (líneas ~140-141, "Heatmap"). | Mismo motivo, consistencia del spec fundacional. |

No se modifica `assetMarkerColor.ts` → `ASSET_MARKER_COLORS` (colores de los marcadores de activo, sin
cambios) ni la paleta de estado de vehículo. El motor automático de asignación y el sistema manual
(`docs/specs/fix-asset-assignment-ok-full-damaged.md`) no se ven afectados por este fix.

## Fuera de alcance

- Colores de marcador de activo (`ASSET_MARKER_COLORS`) — no cambian, solo el tooltip cuando no hay
  incidente asociado.
- Tooltip de incidente (con o sin activo asociado) — ya usa siempre la paleta de estado de incidente
  correcta, sin el bug reportado.
- `AssetLegend` (`docs/feature/13-asset-legend.md`) — ya muestra las etiquetas correctas por estado
  de activo, no se toca.

## Criterios de aceptación

- **CA-01:** Los incidentes `RESOLVED` (marcador independiente, heatmap y su leyenda) se ven en
  violeta (`#8b5cf6`) en vez de verde.
- **CA-02:** Un activo `OK` sin incidente asociado muestra tooltip "OK" en verde (comportamiento
  previo, sin cambio para este caso puntual).
- **CA-03:** Un activo `FULL` sin incidente asociado muestra tooltip "Completo" en rojo (coherente
  con el color de su marcador).
- **CA-04:** Un activo `DAMAGED` sin incidente asociado muestra tooltip "Dañado" en naranja.
- **CA-05:** Un activo `OUT_OF_SERVICE` sin incidente asociado muestra tooltip "Fuera de servicio"
  en gris.
- **CA-06:** Un activo con incidente asociado sigue mostrando tipo y estado del incidente, sin
  cambios (comportamiento no tocado por este fix).

## Verificación post-implementación

1. `pnpm --filter client test` — casos nuevos/actualizados en verde, sin regresión en `map`.
2. `pnpm --filter client typecheck` y `pnpm --filter client lint` en verde.
3. Revisión manual en `/` (Mapa): hover sobre un activo `FULL`/`DAMAGED`/`OUT_OF_SERVICE` sin
   incidente asociado y confirmar la etiqueta y color; activar el heatmap y confirmar violeta en
   `RESOLVED` (marcador, gradiente y leyenda).

## Estado de implementación

- ✅ `client/src/features/map/constants/incidentStatusColors.ts` — `RESOLVED` → `#8b5cf6`, JSDoc
  actualizado.
- ✅ `client/src/features/map/components/HeatmapLegend.tsx` — comentario actualizado (violeta).
- ✅ `client/src/features/map/utils/assetMarkerColor.ts` — agregado `ASSET_STATUS_TOOLTIP_COLOR`.
- ✅ `client/src/features/map/components/AssetTooltip.tsx` — nueva prop `assetStatus`, renderiza la
  etiqueta y color reales del activo en vez del literal fijo "Estado OK".
- ✅ `client/src/features/map/components/AssetMarkersLayer.tsx` — pasa `assetStatus={asset.status}`
  a `AssetTooltip`.
- ✅ `client/src/features/map/components/AssetTooltip.test.tsx` — casos para los 4 estados de
  activo sin incidente asociado, más el caso con incidente (sin cambios de comportamiento).
- ✅ `client/src/features/map/components/AssetMarkersLayer.test.tsx` — casos para "OK" y "Completo"
  en el tooltip.
- ✅ `docs/verified-scope.md` (§10.6 y §10.7, actualizadas en sus dos apariciones duplicadas en el
  documento) y `docs/feature/10-maps-create.md` (Tooltip, Heatmap, CA-11) actualizados.
- ⏳ `pnpm --filter client typecheck` / `lint` / `test` — no se pudieron correr en esta sesión: el
  bridge de archivos entre el sandbox y la carpeta montada no expone un `node_modules` completo
  (falta `.pnpm`, los scripts de `.bin` referencian rutas de la máquina Windows del usuario que no
  existen en este entorno), mismo problema de entorno ya documentado en specs previos
  (`docs/specs/fix-assignmentcontrol-incidentmarkerslayer-coverage.md`,
  `docs/specs/fix-asset-assignment-ok-full-damaged.md`). Revisé el diff manualmente (tipos, imports,
  textos y colores quedan coherentes) pero falta la confirmación real corriendo `pnpm --filter
  client typecheck && pnpm --filter client lint && pnpm --filter client test` en tu entorno.

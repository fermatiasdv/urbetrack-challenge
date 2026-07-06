# SPEC — Fix: más aire entre los links de la sidebar y overflow debajo del footer

- **Estado:** Aprobado e implementado
- **Fecha:** 2026-07-06
- **Relacionado:** `docs/fix/10-styling-general.md` (diagnóstico previo del scrollbar sobre
  "Reportar incidente"), `client/src/app/layout/Sidebar.tsx`

## Pedido del usuario

1. Los links de navegación de la sidebar están muy juntos: más espacio (gap) entre uno y otro.
2. Sacar el overflow que aparece debajo de todo, incluido sobre/alrededor del botón "Reportar
   incidente".

## Diagnóstico

`Sidebar.tsx`:

```tsx
<Box asChild flexGrow="1" overflowY="auto">
  <nav>
    <Flex direction="column" gap="1">
      {NAV_ITEMS.map(...)}
    </Flex>
  </nav>
</Box>
```

1. **Gap:** `gap="1"` en la escala de Radix Themes son 4px entre cada `Button` de link — de ahí la
   sensación de que están pegados.
2. **Overflow:** el `<nav>` está envuelto en `overflowY="auto"`, agregado originalmente como
   fallback de seguridad (`docs/fix/10-styling-general.md`, decisión 6) para el caso en que el
   contenido del nav superara el alto disponible del `flexGrow`. Con el ítem 1 de este pedido
   (más gap entre links) el nav ocupa más alto total, lo que dispara ese `overflowY="auto"` en
   ventanas de alto medio/bajo — aparece una scrollbar vertical al final del nav, visualmente
   pegada arriba del `Separator`/botón "Reportar incidente".

## Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `client/src/app/layout/Sidebar.tsx` | `gap="1"` → `gap="3"` en el `Flex direction="column"` de `NAV_ITEMS` (4px → 12px entre links). | Pedido del usuario, más aire entre links. |
| `client/src/app/layout/Sidebar.tsx` | Se quita `overflowY="auto"` del `Box asChild flexGrow="1"` que envuelve `<nav>` (queda solo `flexGrow="1"`). | Elimina la scrollbar/overflow debajo del nav — con 4 ítems y el nuevo gap de 12px el contenido sigue entrando cómodo en el alto disponible de una sidebar de `100vh`; se prioriza no tener overflow visible (pedido explícito) sobre el fallback de seguridad para ventanas extremadamente bajas. |

## Fuera de alcance

- Cambios en el ancho de la sidebar (`SIDEBAR_WIDTH`), en el header (logo/título) o en el botón
  "Reportar incidente" en sí (colores, texto, funcionalidad).
- Un mecanismo de scroll alternativo para ventanas muy bajas (no pedido).

## Verificación post-implementación

1. `pnpm --filter client typecheck` / `lint` / `test` (`Sidebar.test.tsx` no depende de gap ni de
   `overflowY`, no debería requerir cambios).
2. Verificación visual: los 4 links de navegación quedan visiblemente más espaciados; no aparece
   ninguna scrollbar dentro de la sidebar, ni por encima ni por debajo del botón "Reportar
   incidente", en una ventana de alto normal (~800px o más).

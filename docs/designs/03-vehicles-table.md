# Diseño — Tabla de vehículos

Markup de referencia (HTML + clases utilitarias tipo Tailwind + nombres de design tokens del
lineamiento M3) provisto como **fuente de verdad visual** para el cuerpo de la tabla de vehículos.
Este archivo **no es código ejecutable del proyecto** (el `client` no tiene Tailwind instalado, ver
[docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)): es el mockup que
`docs/feature/03-vehicles-table.md` traduce a los componentes reales en
`client/src/features/vehicles/`.

Las 2 filas del mockup (`KXR-9021` / Heavy Truck / Active, `BDY-4482` / Light Van / Maintenance) son
un snapshot estático de ejemplo; el spec de feature reemplaza el `<tbody>` fijo por filas generadas
dinámicamente con TanStack Table a partir de los vehículos reales del store.

```html
<tbody class="divide-y divide-outline-variant">
  <tr class="hover:bg-surface-container-low transition-colors group">
    <td class="px-gutter py-md font-bold text-primary">KXR-9021</td>
    <td class="px-gutter py-md">Heavy Truck</td>
    <td class="px-gutter py-md">5,500 KG</td>
    <td class="px-gutter py-md">
      <span class="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-label-sm text-label-sm">
        <span class="status-dot bg-[#4caf50]"></span> Active
      </span>
    </td>
    <td class="px-gutter py-md text-on-surface-variant">North-East Logistics Hub</td>
    <td class="px-gutter py-md text-right">
      <button class="p-2 rounded-lg text-primary hover:bg-primary-container hover:text-on-primary-container transition-all">
        <span class="material-symbols-outlined">more_vert</span>
      </button>
    </td>
  </tr>
  <tr class="hover:bg-surface-container-low transition-colors bg-surface-container-lowest/50">
    <td class="px-gutter py-md font-bold text-primary">BDY-4482</td>
    <td class="px-gutter py-md">Light Van</td>
    <td class="px-gutter py-md">1,200 KG</td>
    <td class="px-gutter py-md">
      <span class="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-[#fff3e0] text-[#ef6c00] font-label-sm text-label-sm">
        <span class="status-dot bg-[#ff9800]"></span> Maintenance
      </span>
    </td>
    <td class="px-gutter py-md text-on-surface-variant">Central Distribution</td>
    <td class="px-gutter py-md text-right">
      <button class="p-2 rounded-lg text-primary hover:bg-primary-container hover:text-on-primary-container transition-all">
        <span class="material-symbols-outlined">more_vert</span>
      </button>
    </td>
  </tr>
</tbody>
</table>
```

## Notas sobre la última columna (acciones)

El mockup solo muestra el botón `more_vert` (kebab menu); no detalla su contenido. Comportamiento
requerido por el usuario, a especificar en `docs/feature/03-vehicles-table.md`:

- Al hacer clic se despliega un submenú **justo debajo** de los tres puntos, con las opciones:
  - **Detalles** — abre el modal de detalle (mismo modal de `docs/scope.md` §7.1 / §7 de
    `docs/verified-scope.md`, a desarrollar).
  - **Editar** — abre el mismo modal, ya en modo edición (equivalente al flujo "Modificar" del
    modal de vehículos).
  - **Eliminar** — abre un `AlertDialog` de Radix (https://www.radix-ui.com/themes/docs/components/alert-dialog)
    preguntando confirmación. Botón **"Aceptar"** en rojo (destructivo) y botón **"No"** con el
    color secundario. Al aceptar: se cierra el modal/alerta y se elimina el vehículo (del estado
    global, sin llamada al backend — el mock no expone `DELETE`, ver
    [docs/METHODS.md](../METHODS.md) "Limitaciones conocidas"). Al rechazar: solo cierra la alerta,
    sin eliminar nada.

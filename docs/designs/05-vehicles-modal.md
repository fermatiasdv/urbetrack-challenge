# Diseño — Modal de detalle/edición de vehículo

Markup de referencia (HTML + clases utilitarias tipo Tailwind + nombres de design tokens del
lineamiento M3) provisto como **fuente de verdad visual** para el modal de detalle/edición que se
abre desde `VehicleRowActionsMenu` (opciones "Detalles"/"Editar", ver
[docs/feature/03-vehicles-table.md](../feature/03-vehicles-table.md)). Este archivo **no es código
ejecutable del proyecto** (el `client` no tiene Tailwind instalado, ver
[docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)): es el mockup que
`docs/feature/06-vehicles-modal.md` traduce a los componentes reales en
`client/src/features/vehicles/`.

```html
<!-- Radix UI Dialog / Modal Pattern -->
<div class="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-custom p-md">
<!-- Modal Overlay -->
<div class="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in duration-200">
<!-- Modal Header -->
<div class="px-lg py-md border-b border-outline-variant flex items-center justify-between">
<div class="flex items-center gap-md">
<h2 class="font-headline-sm text-headline-sm text-on-surface">CAMIÓN (AA123BB)</h2>
<div class="flex items-center gap-sm bg-error-container px-sm py-[2px] rounded-full">
<div class="w-2 h-2 rounded-full bg-error"></div>
<span class="font-label-sm text-label-sm text-on-error-container">MANTENIMIENTO</span>
</div>
</div>
<button class="text-on-surface-variant hover:text-on-surface p-xs transition-colors">
<span class="material-symbols-outlined">close</span>
</button>
</div>
<!-- Modal Body (Form) -->
<div class="p-lg">
<form class="space-y-lg">
<!-- Plate Input -->
<div class="space-y-xs">
<label class="font-label-md text-label-md text-on-surface-variant" for="plate">Patente / Plate</label>
<div class="relative">
<input class="w-full bg-surface-container-lowest border-2 border-error rounded-lg px-md py-sm font-title-md text-title-md focus:ring-0 focus:outline-none text-on-surface transition-all" id="plate" placeholder="Ingrese patente" type="text" value="AA123BB">
<span class="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-error">error</span>
</div>
<p class="font-label-sm text-label-sm text-error flex items-center gap-xs">
                            Formato de placa inválido
                        </p>
</div>
<!-- Read-only Details Grid -->
<div class="grid grid-cols-2 gap-lg pt-md">
<div class="space-y-xs">
<p class="font-label-md text-label-md text-on-surface-variant">Capacidad</p>
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">weight</span>
<p class="font-body-lg text-body-lg font-medium">5000 KG</p>
</div>
</div>
<div class="space-y-xs">
<p class="font-label-md text-label-md text-on-surface-variant">Zona Operativa</p>
<div class="flex items-center gap-sm">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">distance</span>
<p class="font-body-lg text-body-lg font-medium">Palermo</p>
</div>
</div>
</div>
<!-- Additional Context (Visual Polish) -->
<div class="bg-surface-container-low p-md rounded-lg border border-outline-variant mt-xl">
<div class="flex gap-md">
<span class="material-symbols-outlined text-on-surface-variant">info</span>
<p class="font-body-md text-body-md text-on-surface-variant italic">
                                La patente debe seguir el formato nacional vigente. Cualquier modificación requiere revisión por parte del administrador de flota.
                            </p>
</div>
</div>
</form>
</div>
<!-- Modal Footer -->
<div class="px-lg py-md bg-surface-container-low border-t border-outline-variant flex justify-end gap-md">
<button class="px-lg py-sm font-label-md text-label-md text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
                    Cancelar
                </button>
<button class="px-lg py-sm font-label-md text-label-md bg-outline-variant text-on-surface-variant opacity-50 cursor-not-allowed rounded-lg shadow-sm" disabled="">
                    Guardar
                </button>
</div>
</div>
</div>
```

## Notas

- El mockup muestra el estado de **edición con un valor de placa inválido** (borde e ícono en
  `error`, mensaje "Formato de placa inválido" y botón "Guardar" deshabilitado): es una única
  captura del flujo, no el único estado del modal. `docs/feature/06-vehicles-modal.md` define el
  resto de los estados (detalle de solo lectura, edición con placa válida) a partir de
  [docs/verified-scope.md](../verified-scope.md) §7.1, que es la fuente de verdad funcional del
  modal.
- El chip de estado (`MANTENIMIENTO`, fondo `bg-error-container`/`text-error`) es un valor de
  ejemplo del mockup, no una regla de color fija: `docs/verified-scope.md` §7.1 define
  `ACTIVE` = verde, `MAINTENANCE` = amarillo, `OUT_OF_SERVICE` = rojo, consistente con el mapeo de
  color ya usado en [docs/feature/02-vehicle-statuscard.md](../feature/02-vehicle-statuscard.md)
  punto 5 (`success`/`tertiary`/`error` de `designTokens.colors`). El spec de feature traduce el
  chip a esos 3 colores según el `status` real del vehículo, no al color fijo del mockup.
- Los `<span class="material-symbols-outlined">` (`close`, `error`, `weight`, `distance`, `info`) no
  tienen esa librería instalada en el proyecto; se mapean a `lucide-react`, mismo criterio que el
  resto de los mockups (ver
  [docs/feature/02-vehicle-statuscard.md](../feature/02-vehicle-statuscard.md) punto 4).
- El overlay difuminado (`backdrop-blur-custom`) del contenedor raíz es una clase custom que no
  existe en el proyecto (no hay Tailwind). El spec de feature define el overlay real a partir del
  pedido explícito del usuario (fondo gris translúcido, sin blur), no de esta clase del mockup.
- El `<input>` de placa y los dos bloques de solo lectura (Capacidad, Zona Operativa) se traducen a
  `TextField` de `@radix-ui/themes` (https://www.radix-ui.com/themes/docs/components/text-field) y
  a texto plano respectivamente; el modal en sí se traduce a `Dialog` de `@radix-ui/themes`
  (https://www.radix-ui.com/themes/docs/components/dialog), ya instalado en el proyecto (mismo
  paquete usado por `AlertDialog`/`DropdownMenu` en
  [docs/feature/03-vehicles-table.md](../feature/03-vehicles-table.md)).

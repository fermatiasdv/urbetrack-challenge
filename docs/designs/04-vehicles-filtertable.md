# Diseño — Barra de filtros de vehículos

Markup de referencia (HTML + clases utilitarias tipo Tailwind + nombres de design tokens del
lineamiento M3) provisto como **fuente de verdad visual** para la barra de filtros que se ubica
sobre la tabla de vehículos. Este archivo **no es código ejecutable del proyecto** (el `client` no
tiene Tailwind instalado, ver [docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)):
es el mockup que `docs/feature/04-vehicles-filtertable.md` traduce a los componentes reales en
`client/src/features/vehicles/`.

```html
<!-- Filter Bar -->
<div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm mb-md flex flex-wrap gap-md items-end">
<div class="flex-1 min-w-[240px]">
<label class="font-label-md text-label-md text-on-surface-variant mb-2 block">Search by plate</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-md">badge</span>
<input class="w-full border-outline-variant rounded-lg pl-10 py-2 focus:ring-primary focus:border-primary" placeholder="ABC-1234" type="text">
</div>
</div>
<div class="w-48">
<label class="font-label-md text-label-md text-on-surface-variant mb-2 block">Type</label>
<select class="w-full border-outline-variant rounded-lg py-2 focus:ring-primary focus:border-primary">
<option>All Types</option>
<option>Truck</option>
<option>Van</option>
<option>Pickup</option>
</select>
</div>
<div class="w-48">
<label class="font-label-md text-label-md text-on-surface-variant mb-2 block">Capacity</label>
<select class="w-full border-outline-variant rounded-lg py-2 focus:ring-primary focus:border-primary">
<option>All Capacities</option>
<option>&lt;1000kg</option>
<option>1000-2000kg</option>
<option>&gt;2000kg</option>
</select>
</div>
<div class="w-48">
<label class="font-label-md text-label-md text-on-surface-variant mb-2 block">Status</label>
<select class="w-full border-outline-variant rounded-lg py-2 focus:ring-primary focus:border-primary">
<option>All Status</option>
<option>Active</option>
<option>Maintenance</option>
<option>Out of Service</option>
</select>
</div>
<button class="px-md py-[10px] bg-surface-container-high rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
                    Reset
                </button>
</div>
```

## Notas

Los textos del mockup están en inglés genérico (`Search by plate`, `Type`, `All Types`, `Truck` /
`Van` / `Pickup`, `Capacity`, `All Capacities`, `Status`, `All Status`, `Active` / `Maintenance` /
`Out of Service`, `Reset`) y son un ejemplo de la herramienta de mockup, no el copy final: el spec
de feature ([docs/feature/04-vehicles-filtertable.md](../feature/04-vehicles-filtertable.md))
traduce las etiquetas y opciones a español, consistente con el resto de la UI
(`docs/feature/03-vehicles-table.md`, `vehicleFormat.ts`).

Los `<select>` nativos del mockup se traducen a `Select` de `@radix-ui/themes`
(https://www.radix-ui.com/themes/docs/components/select), ya instalado en el proyecto — no es un
`<select>` HTML real en la implementación.

**Adenda (2026-07-06):** este mockup no incluye un filtro de Zona, pero el usuario pidió agregarlo
explícitamente al aprobar `docs/feature/04-vehicles-filtertable.md` (consistente con
`docs/verified-scope.md` §6.2, "Zonas: una, varias o todas"). El spec de feature define su
ubicación (a continuación del filtro de Estado, antes del botón "Restablecer") y su control
(multi-select vía `Popover` + `CheckboxGroup`, no un `Select` de valor único como los otros 3).

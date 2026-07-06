# Diseño — Tarjetas de estado de vehículos (bento cards)

Markup de referencia (HTML + clases utilitarias tipo Tailwind + nombres de design tokens del
lineamiento M3) provisto como **fuente de verdad visual** para el resumen general de estados de la
flota. Este archivo **no es código ejecutable del proyecto** (el `client` no tiene Tailwind
instalado, ver [docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)): es el mockup
que `docs/feature/02-vehicle-statuscard.md` traduce a los componentes reales en
`client/src/features/vehicles/`.

Las 4 tarjetas del mockup (Total de Vehículos, Activos, En mantenimiento, Fuera de servicio) son un
snapshot estático de ejemplo; el spec de feature reemplaza los 4 bloques fijos por un único objeto
de datos mapeado dinámicamente sobre una tarjeta reutilizable.

```html
<!-- Summary Cards (Bento style) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
  <div class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
    <div class="flex justify-between items-start mb-sm">
      <span class="p-2 bg-surface-container rounded-lg text-primary">
        <span class="material-symbols-outlined">inventory</span>
      </span>
      <span class="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wider uppercase">Total de Vehiculos</span>
    </div>
    <div class="text-3xl font-bold text-on-surface">452</div>
    <div class="mt-2 text-label-md text-[#4caf50] flex items-center gap-1">
      <span class="material-symbols-outlined text-sm">trending_up</span>
      <span class="">+12 este mes</span>
    </div>
  </div>
  <div class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
    <div class="flex justify-between items-start mb-sm">
      <span class="p-2 bg-[#e8f5e9] rounded-lg text-[#2e7d32]">
        <span class="material-symbols-outlined">check_circle</span>
      </span>
      <span class="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wider uppercase">Activos</span>
    </div>
    <div class="text-3xl font-bold text-on-surface">312</div>
    <div class="mt-2 text-label-md text-on-surface-variant flex items-center gap-1">
      <span class="font-semibold text-on-surface">69%</span>
      <span class="">del total de vehiculos</span>
    </div>
  </div>
  <div class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
    <div class="flex justify-between items-start mb-sm">
      <span class="p-2 bg-[#fff3e0] rounded-lg text-[#ef6c00]">
        <span class="material-symbols-outlined">build</span>
      </span>
      <span class="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wider uppercase">En mantenimiento</span>
    </div>
    <div class="text-3xl font-bold text-on-surface">84</div>
    <div class="mt-2 text-label-md text-on-surface-variant flex items-center gap-1">
      <span class="font-semibold text-on-surface">18.5%</span>
      <span class="">Agendados para reparar</span>
    </div>
  </div>
  <div class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
    <div class="flex justify-between items-start mb-sm">
      <span class="p-2 bg-[#ffebee] rounded-lg text-[#c62828]">
        <span class="material-symbols-outlined">error_outline</span>
      </span>
      <span class="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wider uppercase">Fuera de servicio</span>
    </div>
    <div class="text-3xl font-bold text-on-surface">56</div>
    <div class="mt-2 text-label-md text-on-surface-variant flex items-center gap-1">
      <span class="font-semibold text-error">12.4%</span>
      <span class="">Prioridad crítica</span>
    </div>
  </div>
</div>
```

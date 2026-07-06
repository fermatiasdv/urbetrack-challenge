# Diseño — Sidebar (layout & estilo)

Markup de referencia (HTML + clases utilitarias tipo Tailwind + nombres de design tokens del
lineamiento M3) provisto como **fuente de verdad visual** para la sidebar de navegación. Este
archivo **no es código ejecutable del proyecto** (el `client` no tiene Tailwind instalado, ver
[docs/chore/02-visual-alignment.md](../chore/02-visual-alignment.md)): es el mockup que
`docs/feature/01-modify-sidebar.md` traduce a los componentes reales en
`client/src/app/layout/`.

```html
<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-low flex flex-col p-md z-40 shadow-sm border-r border-outline-variant">
  <div class="mb-lg px-sm">
    <div class="flex items-center gap-sm mb-xs">
      <div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
        <span class="material-symbols-outlined text-on-primary">local_shipping</span>
      </div>
      <div>
        <div class="font-title-md text-title-md font-bold text-primary">Logistics Manager</div>
        <div class="font-label-md text-label-md text-on-surface-variant">Operational Hub</div>
      </div>
    </div>
  </div>
  <nav class="flex-1 flex flex-col gap-xs">
    <button class="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold translate-x-1 duration-200">
      <span class="material-symbols-outlined">dashboard</span>
      <span class="font-label-md text-label-md">Dashboard</span>
    </button>
    <button class="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg">
      <span class="material-symbols-outlined">map</span>
      <span class="font-label-md text-label-md">Mapas</span>
    </button>
    <button class="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg">
      <span class="material-symbols-outlined">inventory_2</span>
      <span class="font-label-md text-label-md">Registro de Activos</span>
    </button>
    <button class="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg">
      <span class="material-symbols-outlined">local_shipping</span>
      <span class="font-label-md text-label-md">Vehículos</span>
    </button>
    <button class="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg">
      <span class="material-symbols-outlined">report_problem</span>
      <span class="font-label-md text-label-md">Incidentes</span>
    </button>
  </nav>
  <div class="mt-auto border-t border-outline-variant pt-md flex flex-col gap-xs">
    <button class="w-full bg-tertiary text-on-tertiary py-sm rounded-lg font-bold flex items-center justify-center gap-sm hover:opacity-90 transition-all mb-md">
      <span class="material-symbols-outlined">add_alert</span>
      <span class="font-label-md text-label-md">Report Incident</span>
    </button>
  </div>
</aside>
```

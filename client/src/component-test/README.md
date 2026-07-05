# component-test

Este directorio (`VehiclesTable`, `PlateCell`, `useVehiclesStore`, `useVehiclesQuery`, `data.ts`,
`plate.ts`, `types.ts` y sus tests) se creó **únicamente** para verificar que el stack instalado en
`client/` (Vite, React Query, Zustand, TanStack Table, Radix Themes, Zod, Vitest + RTL) funcionaba
correctamente de punta a punta, usando datos falsos locales (ver
`docs/specs/component-test-vehicles-table.md`, SPEC-002).

No es parte de ninguna feature real ni de la arquitectura definitiva del proyecto
(`docs/specs/architecture.md`) y no debe usarse como base para desarrollo nuevo.

## Ya no se ve en la vista principal

`App.tsx` dejó de renderizar `VehiclesTable`. Si en algún momento se quiere volver a verlo en
pantalla, importarlo manualmente (no commitear el cambio):

```tsx
// client/src/App.tsx (temporal)
import { VehiclesTable } from './component-test/VehiclesTable'

function App(): JSX.Element {
  return (
    <main style={{ padding: '2rem' }}>
      <VehiclesTable />
    </main>
  )
}

export default App
```

Con `pnpm dev:client` corriendo vas a ver la tabla de vehículos con datos fake (incluye un delay
simulado de carga).

## Tests

Los tests (`VehiclesTable.test.tsx`, `plate.test.ts`, `store.test.ts`) se conservan y siguen
corriendo con `pnpm test:client` — siguen sirviendo para validar que el entorno de testing
funciona.

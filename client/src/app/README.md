# app

Configuración global de la aplicación (ver [docs/specs/architecture.md](../../../docs/specs/architecture.md)).

- `providers/` — providers globales (React Query client, theming, etc.)
- `router/` — configuración de rutas (TanStack Router code-based — ver spec, sección "Ruteo y navegación")
- `layout/` — shell persistente de la app (sidebar + `Outlet`) — ver spec, sección "Ruteo y navegación"
- `store/` — estado global cruzado entre features (excepción, no la regla — ver spec, sección "Estado global y data-fetching")
- `styles/` — estilos globales

Se puebla a medida que cada spec lo requiera; no se crea contenido especulativo.

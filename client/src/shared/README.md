# shared

Código reutilizado por al menos dos features (ver [docs/specs/architecture.md](../../../docs/specs/architecture.md), sección "Regla para shared").

- `components/` — componentes de UI genéricos
- `hooks/` — hooks genéricos
- `utils/` — utilidades puras
- `types/` — tipos compartidos
- `services/` — clientes/servicios compartidos
- `lib/` — wrappers de librerías externas

No se mueve nada acá de forma anticipada: un módulo migra desde una feature a `shared/` recién cuando una segunda feature lo necesita.

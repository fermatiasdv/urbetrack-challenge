# features

Lógica funcional del dominio (ver [docs/specs/architecture.md](../../../docs/specs/architecture.md)).

Vacío por ahora a propósito: el código de `component-test/` (candidato natural a convertirse en la feature `vehicles`) se removerá/reimplementará en un spec propio más adelante — esa migración queda fuera de alcance de este scaffold.

Cada feature nueva (`incidents`, `vehicles`, `zones`, `map`, `filters`, etc.) se agrega recién cuando exista su spec aprobado, con la estructura interna definida en `docs/specs/architecture.md` (`api/`, `components/`, `hooks/`, `schemas/`, `store/`, `types/`, `pages/` — sólo los directorios que necesite).

# Fix — Rama "broken" (`.git/HEAD` corrupto) + `.git/index.lock` residual

- **ID:** FIX-002
- **Status:** Parcialmente resuelto — falta acción manual del usuario
- **Related:** `docs/chore/01-updategitignore.md`
- **Date:** 2026-07-05

## 1. Síntoma

Al implementar `docs/chore/01-updategitignore.md`, `git log` fallaba con:

```
fatal: your current branch appears to be broken
```

El chore había planteado como hipótesis que esto se debía al volumen de archivos sin ignorar
(`node_modules/`, `.pnpm-store/`, builds). Esa hipótesis resultó **incorrecta**.

## 2. Causa raíz real

`.git/HEAD` tenía bytes nulos agregados después del contenido válido:

```
ref: refs/heads/feat/install-tools\n\x00\x00
```

(en vez de terminar limpio en `\n`). Git no puede parsear esa referencia y por eso reporta la rama
como "broken" — no tiene relación con `.gitignore`, con node_modules, ni con el contenido del
repo. Es corrupción a nivel de archivo, típica de una escritura interrumpida (crash, sync a mitad
de escritura, etc.) sobre `.git/HEAD`.

Se confirmó que el hash referenciado (`d14cbc19984cf547c7abb25cdcff6a668c8cf238`) era un commit
válido (`git cat-file -t <hash>` → `commit`), es decir, el problema era puntualmente el archivo
`HEAD`, no el historial ni los objetos del repo.

Independientemente, se encontró un segundo problema no relacionado: `.git/index.lock` (0 bytes)
quedó residual de una operación de git anterior que no se completó, y bloquea cualquier operación
que necesite escribir el índice:

```
fatal: Unable to create '.../.git/index.lock': File exists.
Another git process seems to be running in this repository...
```

## 3. Fix aplicado

1. **`.git/HEAD` reescrito** con contenido limpio:
   ```
   ref: refs/heads/feat/install-tools
   ```
   Verificado con `git rev-parse HEAD`, `git log --oneline` y `git status` — los tres funcionan
   correctamente después de este cambio.

2. **`.git/index.lock`: intento de borrado fallido.** Se intentó `rm -f .git/index.lock` y falló
   con `Operation not permitted`, a pesar de que el archivo pertenece al mismo usuario
   (`uid`/`gid` coinciden). Esto indica que el archivo está lockeado a nivel del sistema operativo
   Windows (no es un problema de permisos Unix), consistente con el warning visto antes:
   ```
   warning: unable to unlink '.../.git/index.lock': Operation not permitted
   ```

## 4. Verificación

- ✅ `git log --oneline -5` — funciona, muestra el historial correctamente.
- ✅ `git status --short` — funciona, refleja el estado real del working tree.
- ✅ `git diff` — funciona.
- ❌ `git add` / `git commit` — **siguen bloqueados** por `.git/index.lock`.

## 5. Acción pendiente (requiere el usuario, en su máquina Windows)

El archivo `.git\index.lock` (dentro de la carpeta del repo) está siendo retenido por algún
proceso en Windows. Antes de borrarlo, cerrar cualquiera de estos que pueda estar con el repo
abierto:

1. Cualquier terminal donde haya quedado corriendo un comando `git` (incluso uno que parezca
   colgado o cancelado a medias).
2. Clientes de git con UI: GitHub Desktop, GitKraken, Sourcetree, la pestaña de Source Control de
   VS Code, etc.
3. Sincronización de OneDrive/Google Drive/Dropbox si la carpeta del proyecto está dentro de una
   carpeta sincronizada — estos servicios pueden mantener un handle abierto sobre archivos que
   cambian seguido.
4. Antivirus haciendo un escaneo activo de la carpeta.

Después de cerrar lo anterior:

```powershell
Remove-Item -Force .git\index.lock
```

Si `Remove-Item` también falla, reiniciar la máquina liberará cualquier handle huérfano y permitirá
borrar el archivo.

## 6. Verificación final (después de borrar `index.lock`)

1. `git add .gitignore` no debe fallar.
2. `git status` debe mostrar `.gitignore` como staged.
3. `git commit` debe completarse sin error de lock.

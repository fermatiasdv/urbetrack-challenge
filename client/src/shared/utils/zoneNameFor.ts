/**
 * Resolves a zone's display name for a `zoneId`, falling back to the raw id
 * while zones are still loading. Used by both `vehicles` and `assets`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`"), which is
 * why it lives in `shared/utils/` instead of a single feature.
 */
export function zoneNameFor(zoneId: string, zonesById: Map<string, string>): string {
  return zonesById.get(zoneId) ?? zoneId
}

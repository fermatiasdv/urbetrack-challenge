import { z } from 'zod'

/**
 * Validates the only editable field of the asset modal: `status`
 * (docs/feature/07-assets-page.md, Decisión del usuario #1 — amplía
 * docs/verified-scope.md §7.2, que originalmente definía el modal de
 * Activos como solo lectura). Mirrors `vehicleModalSchema.ts`'s use of Zod,
 * but with an enum instead of a regex since the input is a closed `Select`.
 */
export const assetModalFormSchema = z.object({
  status: z.enum(['OK', 'DAMAGED', 'FULL', 'OUT_OF_SERVICE'])
})

export type AssetModalFormValues = z.infer<typeof assetModalFormSchema>

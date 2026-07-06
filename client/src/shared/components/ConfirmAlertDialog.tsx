import type { JSX, ReactNode } from 'react'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'

export interface ConfirmAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  acceptLabel?: string
  cancelLabel?: string
  onAccept: () => void
}

/**
 * Generic confirmation dialog (e.g. for destructive "Eliminar" actions).
 * Promoted from `features/vehicles/components/DeleteVehicleAlertDialog.tsx`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`"): the copy and
 * the action performed on accept are supplied by the caller, this component
 * only renders the `AlertDialog` chrome (accept = red/destructive, cancel =
 * gray, per docs/feature/03-vehicles-table.md "Decisiones propuestas" #4 and
 * Gap 2).
 */
export function ConfirmAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  acceptLabel = 'Aceptar',
  cancelLabel = 'No',
  onAccept
}: ConfirmAlertDialogProps): JSX.Element {
  function handleAccept(): void {
    onAccept()
    onOpenChange(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="420px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">{description}</AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              {cancelLabel}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleAccept}>
              {acceptLabel}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}

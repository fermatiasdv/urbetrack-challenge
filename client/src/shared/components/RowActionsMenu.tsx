import { Fragment, type JSX } from 'react'
import { IconButton, DropdownMenu } from '@radix-ui/themes'
import { MoreVertical } from 'lucide-react'

export interface RowActionItem {
  label: string
  onSelect: () => void
  color?: 'red'
}

export interface RowActionsMenuProps {
  items: RowActionItem[]
  triggerAriaLabel: string
}

/**
 * Generic kebab menu for a table row (docs/designs/03-vehicles-table.md
 * `more_vert` button). Radix `DropdownMenu.Content` anchors right below the
 * trigger, matching "se despliega justo debajo de los puntos"
 * (docs/feature/03-vehicles-table.md "Decisiones propuestas" #3).
 *
 * Promoted from `features/vehicles/components/VehicleRowActionsMenu.tsx`
 * (docs/feature/07-assets-page.md, "Generalización a `shared/`"): this
 * component only renders a `DropdownMenu` from the `items` it's given — it
 * doesn't know about vehicles, assets, or any store. Each feature keeps a
 * thin wrapper (`VehicleRowActionsMenu`, `AssetRowActionsMenu`) that builds
 * the `items` array from its own store actions.
 */
export function RowActionsMenu({ items, triggerAriaLabel }: RowActionsMenuProps): JSX.Element {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" color="gray" aria-label={triggerAriaLabel}>
          <MoreVertical size={18} aria-hidden />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {item.color === 'red' && index > 0 ? <DropdownMenu.Separator /> : null}
            <DropdownMenu.Item color={item.color} onSelect={item.onSelect}>
              {item.label}
            </DropdownMenu.Item>
          </Fragment>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

import { useMemo, type JSX } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Table } from '@radix-ui/themes'
import type { Vehicle } from '../types/vehicle.types'
import { useVehiclesStore } from '../store/useVehiclesStore'
import { useZonesQuery } from '../api/useZonesQuery'
import {
  formatCapacity,
  vehicleStatusLabel,
  vehicleTypeLabel,
  zoneNameFor
} from '../utils/vehicleFormat'
import { statusBadgeStyleFor, statusDotStyleFor } from './vehicleStatusBadge.styles'
import { VehicleRowActionsMenu } from './VehicleRowActionsMenu'

const columnHelper = createColumnHelper<Vehicle>()

/**
 * TanStack Table over the vehicles store, translating the mockup `<tbody>`
 * (docs/designs/03-vehicles-table.md) into dynamic rows.
 * See docs/feature/03-vehicles-table.md, "Decisiones propuestas" #1-#3.
 */
export function VehiclesTable(): JSX.Element {
  const vehicles = useVehiclesStore((state) => state.vehicles)
  const { data: zones } = useZonesQuery()

  const zonesById = useMemo(() => {
    const map = new Map<string, string>()
    for (const zone of zones ?? []) {
      map.set(zone.id, zone.name)
    }
    return map
  }, [zones])

  const columns = useMemo(
    () => [
      columnHelper.accessor('plate', {
        header: 'Placa',
        cell: (info) => <strong>{info.getValue()}</strong>
      }),
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: (info) => vehicleTypeLabel(info.getValue())
      }),
      columnHelper.accessor('capacity', {
        header: 'Capacidad',
        cell: (info) => formatCapacity(info.getValue())
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const status = info.getValue()
          return (
            <span style={statusBadgeStyleFor(status)}>
              <span style={statusDotStyleFor(status)} aria-hidden />
              {vehicleStatusLabel(status)}
            </span>
          )
        }
      }),
      columnHelper.accessor('zoneId', {
        header: 'Zona',
        cell: (info) => zoneNameFor(info.getValue(), zonesById)
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => <VehicleRowActionsMenu vehicle={info.row.original} />
      })
    ],
    [zonesById]
  )

  const table = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (vehicle) => vehicle.id
  })

  return (
    <Table.Root variant="surface">
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeaderCell
                key={header.id}
                align={header.column.id === 'actions' ? 'right' : undefined}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id} data-testid="vehicle-row">
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id} align={cell.column.id === 'actions' ? 'right' : undefined}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

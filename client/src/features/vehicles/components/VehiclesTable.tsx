import { Fragment, useEffect, useMemo, useState, type JSX } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState
} from '@tanstack/react-table'
import { Table } from '@radix-ui/themes'
import type { Vehicle } from '../../../shared/types/domain.types'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { TablePagination } from '../../../shared/components/TablePagination'
import { TABLE_PAGE_SIZE } from '../../../shared/constants/tablePagination'
import { useFilteredVehicles } from '../hooks/useFilteredVehicles'
import {
  formatCapacity,
  vehicleStatusColorRole,
  vehicleStatusLabel,
  vehicleTypeLabel
} from '../utils/vehicleFormat'
import { VehicleRowActionsMenu } from './VehicleRowActionsMenu'

const columnHelper = createColumnHelper<Vehicle>()

/**
 * TanStack Table over the vehicles store, translating the mockup `<tbody>`
 * (docs/designs/03-vehicles-table.md) into dynamic rows.
 * See docs/feature/03-vehicles-table.md, "Decisiones propuestas" #1-#3.
 *
 * Reads from `useFilteredVehicles` (not `useVehiclesStore` directly) so the 5 filters of
 * `VehiclesFilterBar` apply without this component knowing how filtering works
 * (docs/feature/04-vehicles-filtertable.md, "Decisiones propuestas" #8).
 *
 * Paginated at 15 rows/página (docs/feature/09-pagination-and-create-modal.md,
 * "Decisiones propuestas" #1/#2): purely client-side, no new backend requests.
 */
export function VehiclesTable(): JSX.Element {
  const vehicles = useFilteredVehicles()
  const { data: zones } = useZonesQuery()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TABLE_PAGE_SIZE
  })

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
            <StatusBadge
              colorRole={vehicleStatusColorRole(status)}
              label={vehicleStatusLabel(status)}
            />
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
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (vehicle) => vehicle.id
  })

  // Derived from the filtered row count directly (not `table.getPageCount()`)
  // so the effects below don't need the `table` instance in their dependency
  // list at all.
  const pageCount = Math.max(1, Math.ceil(vehicles.length / TABLE_PAGE_SIZE))

  // Reset to page 1 whenever the filtered dataset changes, so a filter that
  // shrinks the total doesn't leave the table on an out-of-range page.
  useEffect(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }))
  }, [vehicles])

  // Clamp back to the last valid page if it becomes empty (e.g. after
  // deleting the only row left on the current page).
  useEffect(() => {
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount) {
      setPagination((current) => ({ ...current, pageIndex: pageCount - 1 }))
    }
  }, [pagination.pageIndex, pageCount])

  return (
    <Fragment>
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
                <Table.Cell
                  key={cell.id}
                  align={cell.column.id === 'actions' ? 'right' : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <TablePagination
        pageIndex={pagination.pageIndex}
        pageCount={pageCount}
        totalRows={vehicles.length}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={(pageIndex) => setPagination((current) => ({ ...current, pageIndex }))}
      />
    </Fragment>
  )
}

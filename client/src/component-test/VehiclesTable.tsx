import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Skeleton } from '@radix-ui/themes'
import { useVehiclesStore } from './useVehiclesStore'
import { useVehiclesQuery } from './useVehiclesQuery'
import { PlateCell } from './PlateCell'
import type { VehicleRow } from './types'

const columnHelper = createColumnHelper<VehicleRow>()

const columns = [
  columnHelper.accessor('type', { header: 'Tipo' }),
  columnHelper.accessor('plate', {
    header: 'Patente',
    cell: (info) => <PlateCell vehicle={info.row.original} />
  }),
  columnHelper.accessor('status', { header: 'Estado' }),
  columnHelper.accessor('zoneName', { header: 'Zona' }),
  columnHelper.accessor('lat', { header: 'Latitud' }),
  columnHelper.accessor('lng', { header: 'Longitud' })
]

const SKELETON_ROWS = 2

export function VehiclesTable(): JSX.Element {
  const { isLoading } = useVehiclesQuery()
  const vehicles = useVehiclesStore((state) => state.vehicles)

  const table = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} data-testid="skeleton-row">
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <Skeleton data-testid="skeleton-cell">
                      <span>&nbsp;</span>
                    </Skeleton>
                  </td>
                ))}
              </tr>
            ))
          : table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-testid="vehicle-row">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  )
}

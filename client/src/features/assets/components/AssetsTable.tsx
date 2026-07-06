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
import type { Asset } from '../../../shared/types/domain.types'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { TablePagination } from '../../../shared/components/TablePagination'
import { TABLE_PAGE_SIZE } from '../../../shared/constants/tablePagination'
import { useFilteredAssets } from '../hooks/useFilteredAssets'
import {
  assetStatusColorRole,
  assetStatusLabel,
  assetTypeLabel,
  formatCoordinate
} from '../utils/assetFormat'
import { AssetRowActionsMenu } from './AssetRowActionsMenu'

const columnHelper = createColumnHelper<Asset>()

/**
 * TanStack Table over the assets store, mirroring `VehiclesTable`
 * (docs/feature/07-assets-page.md, "Decisiones propuestas" #4). Reads from
 * `useFilteredAssets` (not `useAssetsStore` directly) so the 3 filters of
 * `AssetsFilterBar` apply without this component knowing how filtering
 * works, same pattern as `VehiclesTable`.
 */
export function AssetsTable(): JSX.Element {
  const assets = useFilteredAssets()
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
      columnHelper.accessor('type', {
        header: 'Tipo',
        cell: (info) => assetTypeLabel(info.getValue())
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const status = info.getValue()
          return (
            <StatusBadge
              colorRole={assetStatusColorRole(status)}
              label={assetStatusLabel(status)}
            />
          )
        }
      }),
      columnHelper.accessor('zoneId', {
        header: 'Zona',
        cell: (info) => zoneNameFor(info.getValue(), zonesById)
      }),
      columnHelper.accessor('address', {
        header: 'Dirección'
      }),
      columnHelper.accessor('lat', {
        header: 'Latitud',
        cell: (info) => formatCoordinate(info.getValue())
      }),
      columnHelper.accessor('lng', {
        header: 'Longitud',
        cell: (info) => formatCoordinate(info.getValue())
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => <AssetRowActionsMenu asset={info.row.original} />
      })
    ],
    [zonesById]
  )

  const table = useReactTable({
    data: assets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (asset) => asset.id
  })

  // Derived from the filtered row count directly (not `table.getPageCount()`)
  // so the effects below don't need the `table` instance in their dependency
  // list at all.
  const pageCount = Math.max(1, Math.ceil(assets.length / TABLE_PAGE_SIZE))

  // Reset to page 1 whenever the filtered dataset changes, so a filter that
  // shrinks the total doesn't leave the table on an out-of-range page.
  useEffect(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }))
  }, [assets])

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
            <Table.Row key={row.id} data-testid="asset-row">
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
        totalRows={assets.length}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={(pageIndex) => setPagination((current) => ({ ...current, pageIndex }))}
      />
    </Fragment>
  )
}

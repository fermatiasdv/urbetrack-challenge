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
import type { Incident } from '../../../shared/types/domain.types'
import { useZonesQuery } from '../../../shared/services/useZonesQuery'
import { zoneNameFor } from '../../../shared/utils/zoneNameFor'
import { StatusBadge } from '../../../shared/components/StatusBadge'
import { TablePagination } from '../../../shared/components/TablePagination'
import { TABLE_PAGE_SIZE } from '../../../shared/constants/tablePagination'
import { useFilteredIncidents } from '../hooks/useFilteredIncidents'
import {
  formatIncidentDate,
  incidentStatusColorRole,
  incidentStatusLabel,
  incidentTypeLabel
} from '../utils/incidentFormat'
import { descriptionCellStyle } from './incidentsTable.styles'
import { IncidentRowActionsMenu } from './IncidentRowActionsMenu'

const columnHelper = createColumnHelper<Incident>()

/**
 * TanStack Table over the incidents store, mirroring `AssetsTable`
 * (docs/feature/08-incidents-page.md, "Decisiones propuestas" #4), already
 * paginated at 15 rows/página from the start
 * (docs/feature/09-pagination-and-create-modal.md, "Decisiones propuestas" #2).
 *
 * Reads from `useFilteredIncidents` (not `useIncidentsStore` directly) so the
 * 3 filters of `IncidentsFilterBar` apply without this component knowing how
 * filtering works.
 */
export function IncidentsTable(): JSX.Element {
  const incidents = useFilteredIncidents()
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
        cell: (info) => incidentTypeLabel(info.getValue())
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: (info) => <span style={descriptionCellStyle}>{info.getValue()}</span>
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const status = info.getValue()
          return (
            <StatusBadge
              colorRole={incidentStatusColorRole(status)}
              label={incidentStatusLabel(status)}
            />
          )
        }
      }),
      columnHelper.accessor('zoneId', {
        header: 'Zona',
        cell: (info) => zoneNameFor(info.getValue(), zonesById)
      }),
      columnHelper.accessor('lat', {
        header: 'Latitud',
        cell: (info) => info.getValue().toFixed(4)
      }),
      columnHelper.accessor('lng', {
        header: 'Longitud',
        cell: (info) => info.getValue().toFixed(4)
      }),
      columnHelper.accessor('createdAt', {
        header: 'Fecha',
        cell: (info) => formatIncidentDate(info.getValue())
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => <IncidentRowActionsMenu incident={info.row.original} />
      })
    ],
    [zonesById]
  )

  const table = useReactTable({
    data: incidents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (incident) => incident.id
  })

  // Derived from the filtered row count directly (not `table.getPageCount()`)
  // so the effects below don't need the `table` instance in their dependency
  // list at all.
  const pageCount = Math.max(1, Math.ceil(incidents.length / TABLE_PAGE_SIZE))

  // Reset to page 1 whenever the filtered dataset changes (new filter
  // applied), so a filter that shrinks the total doesn't leave the table on
  // an out-of-range page (docs/feature/09-pagination-and-create-modal.md,
  // "Decisiones propuestas" #2).
  useEffect(() => {
    setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }))
  }, [incidents])

  // Clamp back to the last valid page if it becomes empty (e.g. after
  // deleting the only row left on the current page) — decisión del usuario
  // 2026-07-06 (docs/feature/09-pagination-and-create-modal.md, Gap 4).
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
            <Table.Row key={row.id} data-testid="incident-row">
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
        totalRows={incidents.length}
        pageSize={TABLE_PAGE_SIZE}
        onPageChange={(pageIndex) => setPagination((current) => ({ ...current, pageIndex }))}
      />
    </Fragment>
  )
}

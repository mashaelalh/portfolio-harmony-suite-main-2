import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel, // Import expanded row model
  SortingState,
  ExpandedState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState, // Import row selection state type
  useReactTable,
} from '@tanstack/react-table';
import { Risk, RiskLevel, RiskStatus } from '@/lib/store/projectStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Import Dropdown components
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ColumnsIcon } from 'lucide-react'; // Import ColumnsIcon
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox

// --- Helper Functions for Badges (can be moved or kept here) ---
const getImpactBadge = (impact: RiskLevel) => {
  switch (impact) {
    case 'high':
      return <Badge className="bg-risk-high text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-risk-medium text-white">Medium</Badge>;
    case 'low':
      return <Badge className="bg-risk-low text-white">Low</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const getStatusBadge = (status: RiskStatus) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="border-gray-200 text-gray-700">Open</Badge>;
    case 'mitigated':
      return <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">Mitigated</Badge>;
    case 'closed':
      return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Closed</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// --- Column Definitions ---
const columns: ColumnDef<Risk>[] = [
  // Add Selection Column
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40, // Small fixed size
  },
  // Add Expander Column
  {
    id: 'expander',
    header: () => null, // No header needed
    cell: ({ row }) => {
      // Only show expander if there is mitigation content
      const hasMitigation = !!row.original.mitigation;
      return hasMitigation ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection toggle
            row.getToggleExpandedHandler()();
          }}
          className="h-6 w-6 p-0"
          aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
        >
          {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      ) : null;
    },
    enableHiding: false,
    size: 40, // Set a small fixed size
  },
  {
    accessorKey: 'description',
    header: ({ column }) => { // Make header sortable
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4" // Maintain alignment
        >
          Description
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'impact',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Impact
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => getImpactBadge(row.getValue('impact')),
  },
  {
    accessorKey: 'status',
     header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
           className="-ml-4"
        >
          Status
          {column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      )
    },
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    accessorKey: 'mitigation',
    header: 'Mitigation Plan',
    cell: ({ row }) => {
        const mitigation = row.getValue('mitigation') as string | null;
        // Display truncated mitigation plan in the cell
        const truncatedMitigation = mitigation
          ? mitigation.substring(0, 50) + (mitigation.length > 50 ? '...' : '')
          : "N/A";
        return (
             <div className={cn(
                "text-sm",
                mitigation ? "" : "text-muted-foreground italic"
             )}>
                {truncatedMitigation}
             </div>
        );
    },
  },
];

// --- RiskTable Component ---
interface RiskTableProps {
  risks: Risk[];
}

const RiskTable: React.FC<RiskTableProps> = ({ risks }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: risks,
    columns,
    state: {
      sorting,
      columnFilters,
      expanded,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // getSubRows: row => row.mitigation ? [{ mitigationContent: row.mitigation }] : undefined, // Removed this - using separate row rendering
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
    getPaginationRowModel: getPaginationRowModel(),
    // Define how to determine if a row can expand (only if mitigation exists)
    getRowCanExpand: (row) => !!row.original.mitigation,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
            placeholder="Filter by description..."
            value={(table.getColumn('description')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('description')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ColumnsIcon className="mr-2 h-4 w-4" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              // Filter out columns that cannot be hidden (select, expander)
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {/* Simple way to format column ID */}
                    {column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}> {/* Use Fragment for row + expanded content */}
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Render expanded content row */}
                  {row.getIsExpanded() && (
                    <TableRow key={row.id + '-expanded'} className="bg-muted/50 hover:bg-muted/60">
                      {/* Offset for select and expander columns */}
                      <TableCell />
                      <TableCell />
                      <TableCell colSpan={columns.length - 2}> {/* Adjust colSpan */}
                        <div className="p-2 text-sm">
                          <p className="font-medium mb-1">Mitigation Plan:</p>
                          <p className="whitespace-pre-wrap">{row.original.mitigation || "No mitigation plan specified."}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Footer: Bulk Action / Selected Row Count & Pagination */}
      <div className="flex items-center justify-between space-x-2 py-1">
        <div className="flex-1 text-sm text-muted-foreground px-1">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
             <Button variant="outline" size="sm" className="ml-4 h-8">
               Bulk Action (Example)
             </Button>
           )}
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div> // This is the correct closing tag for the main div started on line 202
  );
};

export default RiskTable;

"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconDotsVertical,
  IconEdit,
  IconLayoutColumns,
  IconSearch,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Vehicle,
  EngineType,
  getEngineTypeDisplay,
  getCategoryDisplay,
} from "@/lib/types/vehicle";
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import { exportToCSV } from "@/lib/utils/export";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function VehiclesTable({
  vehicles,
  onEdit,
  onDelete,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: VehiclesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    averageConsumption: false,
    engineDisplacement: false,
    tankCapacity: false,
  });

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plate",
      header: "Plate",
      cell: ({ row }) => (
        <div className="font-medium uppercase">{row.getValue("plate")}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Brand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("brand")}</div>,
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => <div>{row.getValue("model")}</div>,
    },
    {
      accessorKey: "year",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Year
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("year") || "-"}</div>,
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) => <div>{row.getValue("mileage") || "-"}</div>,
    },
    {
      accessorKey: "averageConsumption",
      header: "Avg. Consumption",
      cell: ({ row }) => <div>{row.getValue("averageConsumption") || "-"}</div>,
    },
    {
      accessorKey: "engineDisplacement",
      header: "Engine Capacity",
      cell: ({ row }) => <div>{row.getValue("engineDisplacement") || "-"}</div>,
    },
    {
      accessorKey: "tankCapacity",
      header: "Tank Capacity",
      cell: ({ row }) => <div>{row.getValue("tankCapacity") || "-"}</div>,
    },
    {
      accessorKey: "engineType",
      header: "Engine Type",
      cell: ({ row }) => {
        const engineType = row.getValue("engineType") as EngineType;
        const getEngineColor = (type: EngineType) => {
          switch (type) {
            case EngineType.ELECTRIC:
              return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case EngineType.HYBRID:
              return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case EngineType.DIESEL:
              return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
            case EngineType.GASOLINE:
              return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            default:
              return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
          }
        };

        return (
          <Badge
            variant="outline"
            className={`${getEngineColor(engineType)} border-none`}
          >
            {getEngineTypeDisplay(engineType)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Badge variant="outline">
          {getCategoryDisplay(row.getValue("category"))}
        </Badge>
      ),
    },
    {
      accessorKey: "available",
      header: "Status",
      cell: ({ row }) => {
        const available = row.getValue("available") as boolean;
        return (
          <div className="flex items-center gap-2">
            {available ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Available</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Unavailable</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                <IconEdit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(vehicle)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: vehicles,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
    pageCount: totalPages,
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    exportToCSV(
      vehicles,
      `vehicles-${new Date().toISOString().split("T")[0]}`,
      [
        { key: "plate", label: "Plate" },
        { key: "brand", label: "Brand" },
        { key: "model", label: "Model" },
        { key: "year", label: "Year" },
        { key: "engineType", label: "Engine Type" },
        { key: "category", label: "Category" },
        { key: "available", label: "Available" },
      ]
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by plate, brand, or model..."
              value={
                (table.getColumn("plate")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) => {
                const value = event.target.value;
                table.getColumn("plate")?.setFilterValue(value);
                table.getColumn("brand")?.setFilterValue(value);
                table.getColumn("model")?.setFilterValue(value);
              }}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns className="mr-2 size-4" />
              Columns
              <IconChevronDown className="ml-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize -tracking-wider"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        entityName="vehicles"
      />
    </div>
  );
}

"use client";

import * as React from "react";
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
import { ArrowUpDown } from "lucide-react";
import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  FuelRecord,
  FuelSource,
  getAnomalyInfo,
} from "@/lib/types/fuel";

interface FuelRecordsTableProps {
  records: FuelRecord[];
  isLoading?: boolean;
  showVehicleColumn?: boolean;
}

// Source badge colors
const getSourceBadgeClass = (source: FuelSource) => {
  switch (source) {
    case FuelSource.MANUAL:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case FuelSource.SENSOR:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case FuelSource.ROUTE_COMPLETION:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "";
  }
};

const getSourceDisplayName = (source: FuelSource) => {
  switch (source) {
    case FuelSource.MANUAL:
      return "Manual";
    case FuelSource.SENSOR:
      return "Sensor";
    case FuelSource.ROUTE_COMPLETION:
      return "Route";
    default:
      return source;
  }
};

export function FuelRecordsTable({
  records,
  isLoading = false,
  showVehicleColumn = true,
}: FuelRecordsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "recordedAt", desc: true }, // Default: newest first
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const columns: ColumnDef<FuelRecord>[] = [
    {
      accessorKey: "recordedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Recorded At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("recordedAt") as string;
        try {
          return (
            <div className="text-sm">
              {new Date(date).toLocaleString()}
            </div>
          );
        } catch {
          return <div className="text-sm">Invalid date</div>;
        }
      },
    },
    {
      id: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="text-sm">
            {record.driver?.name || record.driverId || "-"}
          </div>
        );
      },
    },
    ...(showVehicleColumn
      ? [
          {
            id: "vehicle" as const,
            header: "Vehicle",
            cell: ({ row }: { row: { original: FuelRecord } }) => {
              const record = row.original;
              if (record.vehicle) {
                return (
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">
                      {record.vehicle.plate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {record.vehicle.brand} {record.vehicle.model}
                    </span>
                  </div>
                );
              }
              return <div className="text-sm">{record.vehicleId || "-"}</div>;
            },
          },
        ]
      : []),
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => {
        const record = row.original;
        if (record.routeCode) {
          return <div className="font-mono text-sm">{record.routeCode}</div>;
        }
        return <div className="text-sm text-muted-foreground">-</div>;
      },
    },
    {
      accessorKey: "liters",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Liters
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const liters = row.getValue("liters") as number | undefined;
        return (
          <div className="font-medium">
            {liters ? liters.toFixed(2) : "0.00"} L
          </div>
        );
      },
    },
    {
      accessorKey: "odometer",
      header: "Odometer",
      cell: ({ row }) => {
        const odometer = row.getValue("odometer") as number | undefined;
        return (
          <div className="text-sm">
            {odometer ? `${odometer.toFixed(1)} km` : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as FuelSource;
        return (
          <Badge className={getSourceBadgeClass(source)} variant="outline">
            {getSourceDisplayName(source)}
          </Badge>
        );
      },
    },
    {
      id: "anomaly",
      header: "Anomaly",
      cell: ({ row }) => {
        const record = row.original;
        const anomalyInfo = getAnomalyInfo(record);
        return (
          <Badge
            variant={anomalyInfo.variant}
            className={anomalyInfo.className}
          >
            {anomalyInfo.label}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: records,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by vehicle or driver..."
              value={
                (table.getColumn("vehicle")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("vehicle")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
        </div>
      </div>
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
                  No fuel records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {table.getFilteredRowModel().rows.length} of {records.length}{" "}
        records
      </div>
    </div>
  );
}

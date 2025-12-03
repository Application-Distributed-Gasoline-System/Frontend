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
import {
  MoreHorizontal,
  ArrowUpDown,
  Play,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Route,
  RouteStatus,
  MachineryType,
  formatRouteDate,
  getStatusDisplayName,
  getMachineryTypeDisplayName,
} from "@/lib/types/route";
import { useAuth } from "@/contexts/auth-context";

interface RoutesTableProps {
  routes: Route[];
  onEdit: (route: Route) => void;
  onDelete: (route: Route) => void;
  onStart: (route: Route) => void;
  onComplete: (route: Route) => void;
  onCancel: (route: Route) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// Status badge colors
const getStatusBadgeClass = (status: RouteStatus) => {
  switch (status) {
    case RouteStatus.PLANNED:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case RouteStatus.IN_PROGRESS:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case RouteStatus.COMPLETED:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case RouteStatus.CANCELLED:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "";
  }
};

// Machinery type badge colors
const getMachineryBadgeVariant = (type: MachineryType) => {
  switch (type) {
    case MachineryType.LIGHT:
      return "secondary";
    case MachineryType.HEAVY:
      return "default";
    default:
      return "outline";
  }
};

export function RoutesTable({
  routes,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  onCancel,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: RoutesTableProps) {
  const { user } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const columns: ColumnDef<Route>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("code")}</div>
      ),
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => {
        const route = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[200px]">
              {route.origin}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              → {route.destination}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "distanceKm",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Distance
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const distance = row.getValue("distanceKm") as number;
        return <div>{distance.toFixed(1)} km</div>;
      },
    },
    {
      accessorKey: "machineryType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("machineryType") as MachineryType;
        return (
          <Badge variant={getMachineryBadgeVariant(type) as any}>
            {getMachineryTypeDisplayName(type)}
          </Badge>
        );
      },
    },
    {
      id: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const route = row.original;
        return <div className="text-sm">{route.driver.name}</div>;
      },
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: ({ row }) => {
        const route = row.original;
        return <div className="font-mono text-sm">{route.vehicle.plate}</div>;
      },
    },
    {
      accessorKey: "scheduledAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Scheduled
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("scheduledAt") as string;
        return <div className="text-sm">{formatRouteDate(date)}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as RouteStatus;
        return (
          <Badge className={getStatusBadgeClass(status)} variant="outline">
            {getStatusDisplayName(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const route = row.original;
        const canEdit =
          route.status === RouteStatus.PLANNED && user?.role !== "DRIVER";
        const canStart = route.status === RouteStatus.PLANNED;
        const canComplete = route.status === RouteStatus.IN_PROGRESS;
        const canCancel =
          route.status === RouteStatus.PLANNED ||
          route.status === RouteStatus.IN_PROGRESS;
        const canDelete =
          (route.status === RouteStatus.PLANNED ||
            route.status === RouteStatus.CANCELLED) &&
          user?.role !== "DRIVER";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(route)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit route
                </DropdownMenuItem>
              )}
              {canStart && (
                <DropdownMenuItem onClick={() => onStart(route)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start route
                </DropdownMenuItem>
              )}
              {canComplete && (
                <DropdownMenuItem onClick={() => onComplete(route)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete route
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onCancel(route)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel route
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(route)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete route
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: routes,
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

  const handleLimitChange = (newLimit: string) => {
    onLimitChange(Number(newLimit));
    onPageChange(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by code..."
              value={
                (table.getColumn("code")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("code")?.setFilterValue(event.target.value)
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
                  No routes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {total > 0 ? (page - 1) * limit + 1 : 0} to{" "}
          {Math.min(page * limit, total)} of {total} routes
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select value={`${limit}`} onValueChange={handleLimitChange}>
              <SelectTrigger id="rows-per-page" className="w-20">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

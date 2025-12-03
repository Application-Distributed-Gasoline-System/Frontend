import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  entityName?: string; // "drivers", "vehicles", "routes", etc.
  pageSizeOptions?: number[]; // Custom page size options
}

export function DataTablePagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  entityName = "items",
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const handleLimitChange = (newLimit: string) => {
    onLimitChange(Number(newLimit));
    onPageChange(1); // Reset to first page when changing limit
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Showing X to Y of Z items */}
      <div className="text-sm text-muted-foreground">
        Showing {total > 0 ? (page - 1) * limit + 1 : 0} to{" "}
        {Math.min(page * limit, total)} of {total} {entityName}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-6">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select value={`${limit}`} onValueChange={handleLimitChange}>
            <SelectTrigger id="rows-per-page" className="w-20">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* First page */}
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
          >
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft className="size-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft className="size-4" />
          </Button>

          {/* Page X of Y */}
          <div className="text-sm font-medium">
            Page {page} of {totalPages}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <IconChevronRight className="size-4" />
          </Button>

          {/* Last page */}
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
  );
}

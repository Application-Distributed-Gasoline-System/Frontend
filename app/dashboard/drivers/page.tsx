"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { DriversTable } from "@/components/drivers/drivers-table";
import { DriverFormDialog } from "@/components/drivers/driver-form-dialog";
import { DeleteDriverDialog } from "@/components/drivers/delete-driver-dialog";

import { Driver, DriverFormData } from "@/lib/types/driver";
import { getDrivers, updateDriver, deleteDriver } from "@/lib/api/drivers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { IconPlus, IconSteeringWheel } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriversPage() {
  // Data state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Action loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch drivers when page or limit changes
  useEffect(() => {
    fetchDrivers();
  }, [page, limit]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const data = await getDrivers(page, limit);
      setDrivers(data.drivers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch drivers";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsFormOpen(true);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: DriverFormData) => {
    if (!selectedDriver) return;

    try {
      setIsSubmitting(true);
      await updateDriver(selectedDriver.id, data);
      toast.success("Driver updated successfully");

      setIsFormOpen(false);
      setSelectedDriver(null);
      await fetchDrivers();
    } catch (error: unknown) {
      let errorMessage = "Failed to update driver";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;

    try {
      setIsDeleting(true);
      await deleteDriver(selectedDriver.id);
      toast.success("Driver deleted successfully");

      setIsDeleteOpen(false);
      setSelectedDriver(null);

      // If we deleted the last item on the page and we're not on page 1, go back a page
      if (drivers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchDrivers();
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to delete driver";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Drivers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Drivers Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system drivers and their details
          </p>
        </div>
      </div>

      {/* Info message about auto-creation */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Drivers are automatically created when users with the DRIVER role are
          registered. You can update their details or delete them here.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <IconSteeringWheel className="size-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No drivers found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Drivers will appear here when users with DRIVER role are
              registered
          </p>
        </div>
      ) : (
        <DriversTable
          drivers={drivers}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Edit Form Dialog */}
      <DriverFormDialog
        driver={selectedDriver}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDriverDialog
        driver={selectedDriver}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

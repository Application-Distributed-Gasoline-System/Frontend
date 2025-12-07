"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { RoutesTable } from "@/components/routes/routes-table";
import { RouteFormDialog } from "@/components/routes/route-form-dialog";
import { RouteStatusDialog } from "@/components/routes/route-status-dialog";
import { DeleteRouteDialog } from "@/components/routes/delete-route-dialog";

import { Route, CreateRouteRequest } from "@/lib/types/route";
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  startRoute,
  completeRoute,
  cancelRoute,
  getRoutesByDriverId,
} from "@/lib/api/routes";
import { IconRoute2 } from "@tabler/icons-react";
import { useAuth } from "@/contexts/auth-context";

type StatusAction = "start" | "complete" | "cancel";

export default function RoutesPage() {
  // Data state
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);

  // Action loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const { user } = useAuth();

  const fetchRoutes = useCallback(async () => {
    if (!user) {
      setRoutes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      if (user.role === "DRIVER") {
        const data = await getRoutesByDriverId(user.driverId, page, limit);
        setRoutes(data.routes || []);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else {
        const data = await getRoutes(page, limit);
        setRoutes(data.routes || []);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch routes";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, user]);

  // Fetch routes when page or limit changes
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setIsFormOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsFormOpen(true);
  };

  const handleDeleteRoute = (route: Route) => {
    setSelectedRoute(route);
    setIsDeleteOpen(true);
  };

  const handleStartRoute = (route: Route) => {
    setSelectedRoute(route);
    setStatusAction("start");
    setIsStatusOpen(true);
  };

  const handleCompleteRoute = (route: Route) => {
    setSelectedRoute(route);
    setStatusAction("complete");
    setIsStatusOpen(true);
  };

  const handleCancelRoute = (route: Route) => {
    setSelectedRoute(route);
    setStatusAction("cancel");
    setIsStatusOpen(true);
  };

  const handleFormSubmit = async (data: CreateRouteRequest) => {
    try {
      setIsSubmitting(true);

      if (selectedRoute) {
        // Update existing route
        await updateRoute(selectedRoute.id, data);
        toast.success("Route updated successfully");
      } else {
        // Create new route
        await createRoute(data);
        toast.success("Route created successfully");
      }

      setIsFormOpen(false);
      setSelectedRoute(null);
      await fetchRoutes();
    } catch (error: unknown) {
      let errorMessage = selectedRoute
        ? "Failed to update route"
        : "Failed to create route";
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
    if (!selectedRoute) return;

    try {
      setIsDeleting(true);
      await deleteRoute(selectedRoute.id);
      toast.success("Route deleted successfully");

      setIsDeleteOpen(false);
      setSelectedRoute(null);

      // If we deleted the last item on the page and we're not on page 1, go back a page
      if (routes.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchRoutes();
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to delete route";
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

  const handleStatusConfirm = async (actualFuelL?: number) => {
    if (!selectedRoute || !statusAction) return;

    try {
      setIsStatusLoading(true);

      switch (statusAction) {
        case "start":
          await startRoute(selectedRoute.id);
          toast.success("Route started successfully");
          break;
        case "complete":
          if (actualFuelL === undefined) {
            toast.error("Actual fuel is required to complete the route");
            return;
          }
          await completeRoute(selectedRoute.id, actualFuelL);
          toast.success("Route completed successfully");
          break;
        case "cancel":
          await cancelRoute(selectedRoute.id);
          toast.success("Route cancelled successfully");
          break;
      }

      setIsStatusOpen(false);
      setSelectedRoute(null);
      setStatusAction(null);
      await fetchRoutes();
    } catch (error: unknown) {
      let errorMessage = "Failed to update route status";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  const canCreateRoutes = user?.role !== "DRIVER";

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
                <BreadcrumbPage>Routes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Routes Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage delivery routes and track their status
          </p>
        </div>
        {canCreateRoutes && (
          <Button onClick={handleAddRoute}>
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : routes.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <IconRoute2 className="size-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No routes found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {user?.role === "DRIVER"
              ? "You don't have any assigned routes yet"
              : "Get started by creating your first route"}
          </p>

          {canCreateRoutes && (
            <Button onClick={handleAddRoute}>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          )}
        </div>
      ) : (
        <RoutesTable
          routes={routes}
          onEdit={handleEditRoute}
          onDelete={handleDeleteRoute}
          onStart={handleStartRoute}
          onComplete={handleCompleteRoute}
          onCancel={handleCancelRoute}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Form Dialog */}
      <RouteFormDialog
        route={selectedRoute}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Status Action Dialog */}
      <RouteStatusDialog
        route={selectedRoute}
        action={statusAction}
        open={isStatusOpen}
        onOpenChange={setIsStatusOpen}
        onConfirm={handleStatusConfirm}
        isLoading={isStatusLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteRouteDialog
        route={selectedRoute}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

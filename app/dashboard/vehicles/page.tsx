"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconCar } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehiclesTable } from "@/components/vehicles/vehicles-table";
import { VehicleFormDialog } from "@/components/vehicles/vehicle-form-dialog";
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import { Vehicle, VehicleFormData } from "@/lib/types/vehicle";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/api/vehicles";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (error: unknown) {
      let errorMessage = "Failed to load vehicles";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage || "Failed to load vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  const handleSubmitVehicle = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedVehicle?.id) {
        // Update existing vehicle
        await updateVehicle(selectedVehicle.id, data);
        toast.success("Vehicle updated successfully");
      } else {
        // Create new vehicle
        await createVehicle(data);
        toast.success("Vehicle added successfully");
      }

      setIsFormOpen(false);
      await fetchVehicles();
    } catch (error: unknown) {
      let errorMessage = "Failed to save vehicles";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedVehicle?.id) return;

    try {
      setIsDeleting(true);
      await deleteVehicle(selectedVehicle.id);
      toast.success("Vehicle deleted successfully");
      setIsDeleteOpen(false);
      await fetchVehicles();
    } catch (error: unknown) {
      let errorMessage = "Failed to delete vehicles";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage || "Failed to delete vehicle");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Vehicles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Vehicle Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your fleet vehicles and their availability
          </p>
        </div>
        <Button onClick={handleAddVehicle} size="sm">
          <IconPlus className="mr-2 size-4" />
          Add Vehicle
        </Button>
      </div>
      <Separator />
      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <IconCar className="size-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No vehicles yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by adding your first vehicle to the fleet.
          </p>
          <Button onClick={handleAddVehicle}>
            <IconPlus className="mr-2 size-4" />
            Add Vehicle
          </Button>
        </div>
      ) : (
        <VehiclesTable
          vehicles={vehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteClick}
        />
      )}
      {/* Dialogs */}
      <VehicleFormDialog
        vehicle={selectedVehicle}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitVehicle}
        isLoading={isSubmitting}
      />
      <DeleteVehicleDialog
        vehicle={selectedVehicle}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

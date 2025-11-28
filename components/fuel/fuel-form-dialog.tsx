"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { FuelFormData, fuelFormSchema } from "@/lib/types/fuel";
import { Driver } from "@/lib/types/driver";
import { Vehicle } from "@/lib/types/vehicle";
import { Route, RouteStatus } from "@/lib/types/route";
import { getDrivers } from "@/lib/api/drivers";
import { getVehicles } from "@/lib/api/vehicles";
import { getRoutes } from "@/lib/api/routes";

interface FuelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FuelFormData) => Promise<void>;
  isLoading?: boolean;
}

export function FuelFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: FuelFormDialogProps) {
  // Local state for dropdowns
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const form = useForm<FuelFormData>({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: {
      driverId: "",
      vehicleId: 0,
      liters: 0.1,
      odometer: undefined,
      routeId: undefined,
    },
  });

  // Fetch drivers, vehicles, and routes when dialog opens
  useEffect(() => {
    if (open) {
      fetchDrivers();
      fetchVehicles();
      fetchRoutes();

      // Reset form to defaults
      form.reset({
        driverId: "",
        vehicleId: 0,
        liters: 0.1,
        odometer: undefined,
        routeId: undefined,
      });
    }
  }, [open, form]);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await getDrivers(1, 100);
      // Filter to only available drivers
      const availableDrivers = response.drivers.filter((d) => d.isAvailable);
      setDrivers(availableDrivers);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await getVehicles(1, 100);
      // Filter to only available vehicles
      const availableVehicles = response.vehicles.filter((v) => v.available);
      setVehicles(availableVehicles);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await getRoutes(1, 100);
      // Filter to recent routes (planned or in progress)
      const recentRoutes = response.routes.filter(
        (r) =>
          r.status === RouteStatus.PLANNED ||
          r.status === RouteStatus.IN_PROGRESS
      );
      setRoutes(recentRoutes);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleSubmit = async (data: FuelFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Fuel Record</DialogTitle>
          <DialogDescription>
            Fill in the information to create a new fuel record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Driver */}
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || loadingDrivers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingDrivers ? "Loading..." : "Select driver"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : ""}
                    disabled={isLoading || loadingVehicles}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingVehicles ? "Loading..." : "Select vehicle"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem
                          key={vehicle.id}
                          value={vehicle.id.toString()}
                        >
                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Liters and Odometer */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liters *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0.1)
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odometer (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Optional"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Route (Optional) */}
            <FormField
              control={form.control}
              name="routeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value ? parseInt(value) : undefined)
                    }
                    value={field.value ? field.value.toString() : ""}
                    disabled={isLoading || loadingRoutes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingRoutes
                              ? "Loading..."
                              : "Select route (optional)"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.code}
                        </SelectItem>
                      ))}
                      {routes.length === 0 && !loadingRoutes && (
                        <SelectItem value="no-routes" disabled>
                          No routes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optional - Associate with a route. Leave empty for none.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Fuel Record
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

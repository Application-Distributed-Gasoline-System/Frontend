"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calculator } from "lucide-react";

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
import { AddressCombobox } from "@/components/ui/address-combobox";

import {
  Route,
  RouteFormData,
  routeFormSchema,
  MachineryType,
  mapRouteFormToApi,
} from "@/lib/types/route";
import { Driver } from "@/lib/types/driver";
import { Vehicle } from "@/lib/types/vehicle";
import { getDriverById, getDrivers } from "@/lib/api/drivers";
import { getVehicles } from "@/lib/api/vehicles";
import { osrmApi } from "@/lib/api/osrm";

interface RouteFormDialogProps {
  route?: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReturnType<typeof mapRouteFormToApi>) => Promise<void>;
  isLoading?: boolean;
}

export function RouteFormDialog({
  route,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: RouteFormDialogProps) {
  const isEditMode = !!route;

  // Local state for drivers and vehicles
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      origin: "",
      destination: "",
      distanceKm: 0.1,
      machineryType: MachineryType.LIGHT,
      driverId: "",
      vehicleId: undefined as any,
      estimatedFuelL: undefined,
      originLat: undefined,
      originLon: undefined,
      destinationLat: undefined,
      destinationLon: undefined,
    },
  });

  const machineryType = useWatch({
    control: form.control,
    name: "machineryType",
  });

  useEffect(() => {
    if (machineryType) {
      fetchDrivers(machineryType);
      fetchVehicles(machineryType);

      form.setValue("driverId", "");
      form.setValue("vehicleId", 0);
    }
  }, [machineryType]);

  // Fetch drivers and vehicles when dialog opens
  useEffect(() => {
    if (open) {
      fetchDrivers(MachineryType.LIGHT);
      fetchVehicles(MachineryType.LIGHT);

      if (route) {
        // Edit mode: populate form with route data
        let scheduledAtFormatted = "";
        if (route.scheduledAt) {
          try {
            const date = new Date(route.scheduledAt);
            scheduledAtFormatted = date.toISOString().slice(0, 16);
          } catch {
            scheduledAtFormatted = "";
          }
        }

        form.reset({
          origin: route.origin,
          destination: route.destination,
          distanceKm: route.distanceKm,
          machineryType: route.machineryType,
          driverId: route.driver.id,
          vehicleId: route.vehicle.id,
          scheduledAt: scheduledAtFormatted,
          estimatedFuelL: route.estimatedFuelL,
          originLat: undefined,
          originLon: undefined,
          destinationLat: undefined,
          destinationLon: undefined,
        });
      } else {
        // Create mode: reset form
        form.reset({
          origin: "",
          destination: "",
          distanceKm: 0,
          machineryType: MachineryType.LIGHT,
          driverId: "",
          vehicleId: 0,
          scheduledAt: "",
          estimatedFuelL: undefined,
          originLat: undefined,
          originLon: undefined,
          destinationLat: undefined,
          destinationLon: undefined,
        });
      }
    }
  }, [open, route, form]);

  const fetchDrivers = async (type: MachineryType) => {
    try {
      setLoadingDrivers(true);
      const response = await getDrivers(1, 100);
      // Filter to only available drivers
      if (type === MachineryType.HEAVY) {
        const availableHeavyDrivers = response.drivers.filter(
          (d) => d.isAvailable && d.license !== "C" && d.license
        );
        setDrivers(availableHeavyDrivers);
        return;
      } else if (type === MachineryType.LIGHT) {
        const availableLightDrivers = response.drivers.filter(
          (d) => d.isAvailable && d.license === "C" && d.license
        );
        setDrivers(availableLightDrivers);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchVehicles = async (type: MachineryType) => {
    try {
      setLoadingVehicles(true);
      const response = await getVehicles(1, 100);
      // Filter to only available vehicles
      if (type === MachineryType.HEAVY) {
        const availableHeavyVehicles = response.vehicles.filter(
          (v) => v.available && v.category === MachineryType.HEAVY
        );
        setVehicles(availableHeavyVehicles);
        return;
      } else if (type === MachineryType.LIGHT) {
        const availableLightVehicles = response.vehicles.filter(
          (v) => v.available && v.category === MachineryType.LIGHT
        );
        setVehicles(availableLightVehicles);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Calculate distance when both coordinates are available
  const calculateDistance = async () => {
    const originLat = form.getValues("originLat");
    const originLon = form.getValues("originLon");
    const destinationLat = form.getValues("destinationLat");
    const destinationLon = form.getValues("destinationLon");

    if (originLat && originLon && destinationLat && destinationLon) {
      try {
        setCalculatingDistance(true);
        const result = await osrmApi.getRouteDistance(
          { lat: originLat, lon: originLon },
          { lat: destinationLat, lon: destinationLon }
        );
        form.setValue("distanceKm", result.distanceKm);
      } catch (error) {
        console.error("Failed to calculate distance:", error);
        // Fall back to straight-line distance
        const straightLine = osrmApi.calculateStraightLineDistance(
          { lat: originLat, lon: originLon },
          { lat: destinationLat, lon: destinationLon }
        );
        form.setValue("distanceKm", straightLine);
      } finally {
        setCalculatingDistance(false);
      }
    }
  };

  const handleOriginSelect = (location: {
    address: string;
    lat: number;
    lon: number;
  }) => {
    form.setValue("origin", location.address);
    form.setValue("originLat", Number(location.lat));
    form.setValue("originLon", Number(location.lon));
    calculateDistance();
  };

  const handleDestinationSelect = (location: {
    address: string;
    lat: number;
    lon: number;
  }) => {
    form.setValue("destination", location.address);
    form.setValue("destinationLat", Number(location.lat));
    form.setValue("destinationLon", Number(location.lon));
    calculateDistance();
  };

  const handleSubmit = async (data: RouteFormData) => {
    console.log("Form submitted with data:", data);
    const apiData = mapRouteFormToApi(data);
    console.log("API data:", apiData);
    await onSubmit(apiData);
    form.reset();
  };

  const handleError = (errors: any) => {
    console.log("Form validation errors:", errors);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Route" : "Create New Route"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the route information below."
              : "Fill in the information to create a new route."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, handleError)}
            className="space-y-4"
          >
            {/* Origin */}
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin *</FormLabel>
                  <FormControl>
                    <AddressCombobox
                      value={field.value}
                      onSelect={handleOriginSelect}
                      placeholder="Search for origin address..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destination */}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination *</FormLabel>
                  <FormControl>
                    <AddressCombobox
                      value={field.value}
                      onSelect={handleDestinationSelect}
                      placeholder="Search for destination address..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Distance and Machinery Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distanceKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (km) *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </FormControl>
                      {calculatingDistance && (
                        <Loader2 className="h-4 w-4 animate-spin self-center" />
                      )}
                    </div>
                    <FormDescription>
                      Auto-calculated from addresses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machineryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machinery Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MachineryType.LIGHT}>
                          Light
                        </SelectItem>
                        <SelectItem value={MachineryType.HEAVY}>
                          Heavy
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Driver and Vehicle */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Scheduled At and Estimated Fuel */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional - defaults to now
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedFuelL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Fuel (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Auto-calculated"
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
                    <FormDescription>
                      Optional - auto-calculated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isEditMode ? "Update Route" : "Create Route"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

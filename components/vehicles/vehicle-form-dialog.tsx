"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Vehicle,
  VehicleFormData,
  vehicleFormSchema,
  EngineType,
  MachineryType,
} from "@/lib/types/vehicle";
import { Loader2 } from "lucide-react";

interface VehicleFormDialogProps {
  vehicle?: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
}

export function VehicleFormDialog({
  vehicle,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: VehicleFormDialogProps) {
  const isEditing = !!vehicle;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      engineType: EngineType.GASOLINE,
      category: MachineryType.LIGHT,
      available: true,
      year: new Date().getFullYear(),
      tankCapacity: 0,
      engineDisplacement: 0,
      averageConsumption: 0,
      mileage: 0,
    },
  });

  // Reset form when dialog opens/closes or vehicle changes
  useEffect(() => {
    if (open) {
      if (vehicle) {
        form.reset({
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
          engineType: vehicle.engineType,
          category: vehicle.category,
          available: vehicle.available,
          year: vehicle.year,
          tankCapacity: vehicle.tankCapacity,
          engineDisplacement: vehicle.engineDisplacement,
          averageConsumption: vehicle.averageConsumption,
          mileage: vehicle.mileage,
        });
      } else {
        form.reset({
          plate: "",
          brand: "",
          model: "",
          engineType: EngineType.GASOLINE,
          category: MachineryType.LIGHT,
          available: true,
          year: new Date().getFullYear(),
          tankCapacity: 0,
          engineDisplacement: 0,
          averageConsumption: 0,
          mileage: 0,
        });
      }
    }
  }, [open, vehicle, form]);

  const handleSubmit = async (data: VehicleFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the vehicle information below."
              : "Fill in the details to add a new vehicle to the fleet."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plate Number */}
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-123"
                        {...field}
                        disabled={isLoading}
                        className="uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Toyota, Ford, Tesla..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Camry, F-150, Model 3..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Engine Type */}
              <FormField
                control={form.control}
                name="engineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as unknown as string}
                      value={field.value as unknown as string}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select engine type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GASOLINE">Gasoline</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as unknown as string}
                      value={field.value as unknown as string}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LIGHT">Light</SelectItem>
                        <SelectItem value="HEAVY">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fuel Capacity */}
              <FormField
                control={form.control}
                name="tankCapacity"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Fuel Capacity (gallons)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="15.5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Tank capacity in gallons
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Milleage */}
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mileage (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Milleage in kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Available Checkbox */}
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for use</FormLabel>
                    <FormDescription>
                      Check this if the vehicle is currently available for
                      operations
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Update Vehicle" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

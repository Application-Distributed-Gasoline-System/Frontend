"use client";

import { useEffect } from "react";
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

import { Driver, DriverFormData, driverFormSchema, License } from "@/lib/types/driver";

interface DriverFormDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DriverFormData) => Promise<void>;
  isLoading?: boolean;
}

export function DriverFormDialog({
  driver,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: DriverFormDialogProps) {
  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      license: null,
      phone: "",
      birthDate: "",
    },
  });

  // Reset form when dialog opens/closes or driver changes
  useEffect(() => {
    if (open && driver) {
      // Format birthDate for input[type="date"]
      let formattedBirthDate = "";
      if (driver.birthDate) {
        try {
          const date = new Date(driver.birthDate);
          formattedBirthDate = date.toISOString().split("T")[0];
        } catch {
          formattedBirthDate = "";
        }
      }

      form.reset({
        name: driver.name || "",
        license: driver.license || null,
        phone: driver.phone || "",
        birthDate: formattedBirthDate,
      });
    }
  }, [open, driver, form]);

  const handleSubmit = async (data: DriverFormData) => {
    await onSubmit(data);
    form.reset();
  };

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update the driver information below.
          </DialogDescription>
        </DialogHeader>

        {/* Read-only driver info */}
        <div className="rounded-md border bg-muted/50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Driver ID:</span>
            <span className="font-mono">{driver.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono">{driver.userId}</span>
          </div>
          {driver.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{driver.email}</span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Driver name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License */}
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                    }}
                    value={field.value || "none"}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value={License.C}>License C</SelectItem>
                      <SelectItem value={License.D}>License D</SelectItem>
                      <SelectItem value={License.E}>License E</SelectItem>
                      <SelectItem value={License.G}>License G</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Driver&apos;s license classification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number (7-15 characters)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional contact phone number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional date of birth
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
                Update Driver
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

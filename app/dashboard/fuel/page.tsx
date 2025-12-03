"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IconPlus, IconCar, IconUser } from "@tabler/icons-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FuelFormDialog } from "@/components/fuel/fuel-form-dialog";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { VehicleFuelHistory } from "@/components/fuel/vehicle-fuel-history";
import { DriverFuelHistory } from "@/components/fuel/driver-fuel-history";

import type { FuelRecord, FuelFormData } from "@/lib/types/fuel";
import { createFuelRecord } from "@/lib/api/fuel";
import { useAuth } from "@/contexts/auth-context";

export default function FuelPage() {
  // Auth context
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState("vehicle-history");
  const [recentRecords, setRecentRecords] = useState<FuelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch recent records on mount
  useEffect(() => {
    fetchRecentRecords();
  }, []);

  const fetchRecentRecords = async () => {
    try {
      setIsLoading(true);
      // Note: GET /fuel/report returns aggregated data per vehicle, not individual records
      // Since there's no GET /fuel endpoint for listing all records, we start with empty array
      // Individual records are added when users create them manually
      setRecentRecords([]);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch fuel records";
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

  const handleAddFuel = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: FuelFormData) => {
    try {
      setIsSubmitting(true);
      const createdRecord = await createFuelRecord(data);
      toast.success("Fuel record created successfully");
      setIsFormOpen(false);
      // Add the new record to the beginning of the list (newest first)
      setRecentRecords((prev) => [createdRecord, ...prev]);
    } catch (error: unknown) {
      let errorMessage = "Failed to create fuel record";
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Fuel Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Management</h1>
          <p className="text-muted-foreground">
            {user?.role === "DRIVER"
              ? "View your fuel consumption records"
              : "Track fuel consumption and detect anomalies"}
          </p>
        </div>
        {/* Only show Add Fuel Record button for ADMIN/DISPATCHER */}
        {user?.role !== "DRIVER" && (
          <Button onClick={handleAddFuel}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Fuel Record
          </Button>
        )}
      </div>

      <Separator />

      {/* Conditional Content Based on Role */}
      {user?.role === "DRIVER" ? (
        /* DRIVER VIEW: No tabs, just their fuel records */
        <DriverFuelHistory autoFilterUserId={user.driverId} />
      ) : (
        /* ADMIN/DISPATCHER VIEW: Tabbed interface */
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="vehicle-history" className="gap-2">
              <IconCar className="h-4 w-4" />
              Vehicle History
            </TabsTrigger>
            <TabsTrigger value="driver-history" className="gap-2">
              <IconUser className="h-4 w-4" />
              Driver History
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Vehicle History */}
          <TabsContent value="vehicle-history" className="space-y-4">
            <VehicleFuelHistory />
          </TabsContent>

          {/* Tab 2: Driver History */}
          <TabsContent value="driver-history" className="space-y-4">
            <DriverFuelHistory />
          </TabsContent>
        </Tabs>
      )}

      {/* Tabbed Interface */}
      {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-records" className="gap-2">
            <IconChartBar className="h-4 w-4" />
            Recent Records
          </TabsTrigger>
          <TabsTrigger value="vehicle-history" className="gap-2">
            <IconHistory className="h-4 w-4" />
            Vehicle History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent-records" className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconGasStation className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Recent Fuel Records</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Last 30 days
              </p>
            </div>
            <FuelRecordsTable
              records={recentRecords}
              isLoading={isLoading}
              showVehicleColumn={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="vehicle-history" className="space-y-4">
          <VehicleFuelHistory />
        </TabsContent>
      </Tabs> */}

      {/* Fuel Form Dialog - Only for ADMIN/DISPATCHER */}
      {user?.role !== "DRIVER" && (
        <FuelFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}

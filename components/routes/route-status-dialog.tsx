"use client";

import { useState, useEffect } from "react";
import { Loader2, Play, CheckCircle, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Route } from "@/lib/types/route";

type StatusAction = "start" | "complete" | "cancel";

interface RouteStatusDialogProps {
  route: Route | null;
  action: StatusAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (actualFuelL?: number) => Promise<void>;
  isLoading?: boolean;
}

export function RouteStatusDialog({
  route,
  action,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: RouteStatusDialogProps) {
  const [actualFuelL, setActualFuelL] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setActualFuelL("");
      setError(null);
    }
  }, [open]);

  if (!route || !action) return null;

  const getDialogConfig = () => {
    switch (action) {
      case "start":
        return {
          title: "Start Route",
          description: `Are you sure you want to start route ${route.code}? This will mark the route as in progress.`,
          icon: <Play className="h-6 w-6 text-blue-600" />,
          confirmText: "Start Route",
          confirmVariant: "default" as const,
          requiresFuel: false,
        };
      case "complete":
        return {
          title: "Complete Route",
          description: `Complete route ${route.code}. Please enter the actual fuel consumed.`,
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          confirmText: "Complete Route",
          confirmVariant: "default" as const,
          requiresFuel: true,
        };
      case "cancel":
        return {
          title: "Cancel Route",
          description: `Are you sure you want to cancel route ${route.code}? This action cannot be undone.`,
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          confirmText: "Cancel Route",
          confirmVariant: "destructive" as const,
          requiresFuel: false,
        };
      default:
        return null;
    }
  };

  const config = getDialogConfig();
  if (!config) return null;

  const handleConfirm = async () => {
    setError(null);

    if (config.requiresFuel) {
      const fuelValue = parseFloat(actualFuelL);
      if (!actualFuelL || isNaN(fuelValue) || fuelValue <= 0) {
        setError("Please enter a valid fuel amount greater than 0");
        return;
      }
      await onConfirm(fuelValue);
    } else {
      await onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {config.requiresFuel && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actualFuel">Actual Fuel Consumed (Liters) *</Label>
              <Input
                id="actualFuel"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Enter fuel consumed"
                value={actualFuelL}
                onChange={(e) => {
                  setActualFuelL(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-sm text-muted-foreground">
                Estimated: {route.estimatedFuelL.toFixed(2)} Lts
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

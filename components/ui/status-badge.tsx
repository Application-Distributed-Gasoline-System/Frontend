import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "./badge";

interface StatusBadgeProps {
  available: boolean;
  availableLabel?: string;
  unavailableLabel?: string;
}

export function StatusBadge({
  available,
  availableLabel = "Available",
  unavailableLabel = "Unavailable",
}: StatusBadgeProps) {
  return (
    <Badge
      variant={available ? "outline" : "destructive"}
      className={
        available
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      }
    >
      {available ? (
        <>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {availableLabel}
        </>
      ) : (
        <>
          <XCircle className="mr-1 h-3 w-3" />
          {unavailableLabel}
        </>
      )}
    </Badge>
  );
}

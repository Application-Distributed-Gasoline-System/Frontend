"use client";

import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { User } from "@/lib/types/user";

interface ToggleActiveDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ToggleActiveDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: ToggleActiveDialogProps) {
  if (!user) return null;

  const action = user.active ? "deactivate" : "activate";
  const actionPastTense = user.active ? "deactivated" : "activated";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user.active ? "Deactivate User" : "Activate User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} the user{" "}
            <span className="font-semibold">{user.email}</span>?
            {user.active && (
              <>
                {" "}
                This user will no longer be able to log in to the system until
                reactivated.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={user.active ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user.active ? "Deactivate" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

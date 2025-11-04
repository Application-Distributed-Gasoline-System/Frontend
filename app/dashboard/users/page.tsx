"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { ToggleActiveDialog } from "@/components/users/toggle-active-dialog";

import { User, UserFormData } from "@/lib/types/user";
import {
  getUsers,
  createUser,
  updateUser,
  setUserActive,
} from "@/lib/api/users";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Action loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch users";
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

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleToggleActive = (user: User) => {
    setSelectedUser(user);
    setIsToggleOpen(true);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedUser) {
        // Update existing user
        await updateUser(selectedUser.id, data);
        toast.success("User updated successfully");
      } else {
        // Create new user
        await createUser(data);
        toast.success("User created successfully");
      }

      setIsFormOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      let errorMessage = selectedUser
        ? "Failed to update user"
        : "Failed to create user";
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

  const handleToggleConfirm = async () => {
    if (!selectedUser) return;

    try {
      setIsToggling(true);
      await setUserActive(selectedUser.id, !selectedUser.active);

      toast.success(
        `User ${selectedUser.active ? "deactivated" : "activated"} successfully`
      );

      setIsToggleOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: unknown) {
      let errorMessage = `Failed to ${
        selectedUser.active ? "deactivate" : "activate"
      } user`;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsToggling(false);
    }
  };

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
                <BreadcrumbPage>Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Button onClick={handleAddUser} size="sm">
          <IconPlus className="mr-2 size-4" />
          Add Users
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <IconUser className="size-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by creating your first user
          </p>
          <Button onClick={handleAddUser}>
            <IconPlus className="mr-2 size-4" />
            Add Users
          </Button>
        </div>
      ) : (
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Form Dialog */}
      <UserFormDialog
        user={selectedUser}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      {/* Toggle Active Dialog */}
      <ToggleActiveDialog
        user={selectedUser}
        open={isToggleOpen}
        onOpenChange={setIsToggleOpen}
        onConfirm={handleToggleConfirm}
        isLoading={isToggling}
      />
    </div>
  );
}

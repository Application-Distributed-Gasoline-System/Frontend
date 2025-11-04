import { z } from "zod";

// User role enum - matches backend response format
export enum UserRole {
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
  DISPATCHER = "DISPATCHER",
}

// Role mapping: frontend enums to backend string numbers (for requests only)
export const ROLE_ENUM_TO_NUMBER: { [key in UserRole]: string } = {
  [UserRole.DRIVER]: "0",
  [UserRole.ADMIN]: "1",
  [UserRole.DISPATCHER]: "2",
};

// Backend API response structure (GET /api/auth/users)
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "DRIVER" | "ADMIN" | "DISPATCHER"; // String enum from backend
  active: boolean;
}

// Frontend user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active?: boolean;
}

// Zod validation schema for user form
export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  role: z.enum(UserRole),
  active: z.boolean().optional(),
});

// Type inference from schema
export type UserFormData = z.infer<typeof userFormSchema>;

// Mapping function: API response to Frontend (GET /api/auth/users)
export function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role as UserRole, 
    active: apiUser.active,
  };
}

// Mapping function: Frontend to API request payload (POST/PATCH)
export function mapUserToApiUser(user: Partial<UserFormData>): any {
  const apiUser: any = {};

  if (user.email !== undefined) apiUser.email = user.email;
  if (user.name !== undefined) apiUser.name = user.name;
  if (user.role !== undefined) apiUser.role = ROLE_ENUM_TO_NUMBER[user.role];
  if (user.active !== undefined) apiUser.active = user.active;

  return apiUser;
}

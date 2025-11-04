import { z } from "zod";

// User role enum
export enum UserRole {
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
  DISPATCHER = "DISPATCHER",
}

// Role mapping: backend string numbers to frontend enums
export const ROLE_NUMBER_TO_ENUM: { [key: string]: UserRole } = {
  "0": UserRole.DRIVER,
  "1": UserRole.ADMIN,
  "2": UserRole.DISPATCHER,
};

// Role mapping: frontend enums to backend string numbers
export const ROLE_ENUM_TO_NUMBER: { [key in UserRole]: string } = {
  [UserRole.DRIVER]: "0",
  [UserRole.ADMIN]: "1",
  [UserRole.DISPATCHER]: "2",
};

// Backend API response structure
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string; // "0", "1", or "2"
  active: boolean;
}

// Frontend user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
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
  role: z.nativeEnum(UserRole),
  active: z.boolean(),
});

// Type inference from schema
export type UserFormData = z.infer<typeof userFormSchema>;

// Mapping function: API to Frontend
export function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: ROLE_NUMBER_TO_ENUM[apiUser.role] || UserRole.DRIVER,
    active: apiUser.active,
  };
}

// Mapping function: Frontend to API
export function mapUserToApiUser(user: Partial<UserFormData>): Partial<ApiUser> {
  const apiUser: Partial<ApiUser> = {};

  if (user.email !== undefined) apiUser.email = user.email;
  if (user.name !== undefined) apiUser.name = user.name;
  if (user.role !== undefined) apiUser.role = ROLE_ENUM_TO_NUMBER[user.role];
  if (user.active !== undefined) apiUser.active = user.active;

  return apiUser;
}

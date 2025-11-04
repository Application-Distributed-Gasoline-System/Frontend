import { apiClient, makeApiCall, API_BASE_URL } from "./client";
import {
  User,
  UserFormData,
  ApiUser,
  mapApiUserToUser,
  mapUserToApiUser,
} from "../types/user";

// Get all users
export async function getUsers(): Promise<User[]> {
  // Backend returns array directly, not wrapped in an object
  const data = await makeApiCall<ApiUser[]>(
    () => apiClient.get(`${API_BASE_URL}/auth/users`),
    "Failed to fetch users"
  );

  // Map API response to frontend format
  return data.map(mapApiUserToUser);
}

// Create a new user
export async function createUser(userData: UserFormData): Promise<User> {
  // Map frontend data to backend format
  const apiUserData = {
    email: userData.email,
    password: userData.password || "", // Password is required for creation
    name: userData.name,
    role: mapUserToApiUser(userData).role, // Map role enum to string number
  };

  const data = await makeApiCall<ApiUser>(
    () => apiClient.post(`${API_BASE_URL}/auth/register`, apiUserData),
    "Failed to create user"
  );

  // Map API response to frontend format
  return mapApiUserToUser(data);
}

// Update an existing user
export async function updateUser(
  userId: string,
  userData: Partial<UserFormData>
): Promise<User> {
  // Map frontend data to backend format
  const apiUserData = {
    userId,
    ...mapUserToApiUser(userData),
  };

  const data = await makeApiCall<ApiUser>(
    () => apiClient.patch(`${API_BASE_URL}/auth/users`, apiUserData),
    "Failed to update user"
  );

  // Map API response to frontend format
  return mapApiUserToUser(data);
}

// Set user active status (activate/deactivate)
export async function setUserActive(
  userId: string,
  active: boolean
): Promise<void> {
  await makeApiCall(
    () =>
      apiClient.post(`${API_BASE_URL}/auth/set-active`, {
        userId,
        active,
      }),
    `Failed to ${active ? "activate" : "deactivate"} user`
  );
}

// Convenience function to toggle user active status
export async function toggleUserActive(user: User): Promise<void> {
  return setUserActive(user.id, !user.active);
}

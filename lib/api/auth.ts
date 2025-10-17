// Authentication API service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

// Actual API response structure
export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: {
    low: number;
    high: number;
    unsigned: boolean;
  };
}

// Decoded JWT payload structure
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: 'ADMIN' | 'DRIVER' | 'DISPATCHER';
  iat: number;
  exp: number;
}

// Internal auth response with user data
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'DRIVER' | 'DISPATCHER';
  };
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * Decode JWT token and extract payload
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw {
        message: errorData.message || 'Invalid credentials',
        statusCode: response.status,
      } as ApiError;
    }

    const data: ApiAuthResponse = await response.json();

    // Decode JWT to extract user information
    const payload = decodeJWT(data.accessToken);
    if (!payload) {
      throw {
        message: 'Invalid token received from server',
        statusCode: 500,
      } as ApiError;
    }

    // Construct user object from JWT payload
    // Using email as name since backend doesn't provide a separate name field
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.email.split('@')[0], // Use email prefix as display name
      role: payload.role,
    };

    return {
      user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    if ((error as ApiError).statusCode) {
      throw error;
    }
    throw {
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    } as ApiError;
  }
}

/**
 * Logout user
 */
export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Silent fail on logout - we'll clear local state anyway
    console.error('Logout error:', error);
  }
}

/**
 * Verify token validity
 */
// export async function verifyToken(token: string): Promise<boolean> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/auth/verify`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });

//     return response.ok;
//   } catch (error) {
//     return false;
//   }
// }

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw {
      message: 'Failed to refresh token',
      statusCode: response.status,
    } as ApiError;
  }

  return response.json();
}

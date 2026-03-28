/**
 * Auth-related types.
 */

export enum UserRole {
  consumer = "consumer",
  retailer = "retailer",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

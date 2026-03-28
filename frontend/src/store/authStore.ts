import { create } from "zustand";
import { decodeToken, getAccessToken, clearTokens, setTokens } from "@/lib/auth";
import { UserRole } from "@/types/auth";

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  hydrate: () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // We only have sub + role from the token — name/email come from API later
    set({
      user: {
        id: decoded.sub,
        email: "",
        role: decoded.role as UserRole,
        name: "",
      },
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));

import { User } from '@/types/user';
import { create } from 'zustand';
import Cookies from "js-cookie";

interface AuthState {
  token: string | null;
  user: Partial<User> | null;
  hasHydrated: boolean;
  login: (token: string, user: Partial<User>) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with null to avoid Server/Client mismatch
  token: null,
  user: null,
  hasHydrated: false,

  login: (token, user) => {
    Cookies.set("token", token, { expires: 7 });
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  setHydrated: () => set({ hasHydrated: true }),
}));
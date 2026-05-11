import * as React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";

import { createSafeJsonStorage } from "@/core/app/state/_shared/zustand-storage";
import { signInRequest, signOutRequest } from "@/core/app/state/slices/auth.api";
import { AuthSync } from "@/core/app/state/slices/auth.sync";

export type AuthUser = {
  id: string;
  username: string;
  email?: string;
  name: string;
  employeeId?: number;
  status: string;
};

type SignInInput = {
  login: string;
  password: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = "ems:auth_v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      signIn: async (input) => {
        set({ loading: true, error: null });
        try {
          const data = await signInRequest(input);
          set({ token: data.token, user: data.user, loading: false, error: null });
        } catch (error) {
          set({
            token: null,
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : "Could not sign in.",
          });
          throw error;
        }
      },
      signOut: async () => {
        const token = get().token;
        set({ token: null, user: null, error: null });
        if (!token) return;
        await signOutRequest(token);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createSafeJsonStorage<AuthState>(),
      partialize: (state) => ({ token: state.token, user: state.user }) as AuthState,
    },
  ),
);

export function useAuth() {
  return useAuthStore(
    (state) => ({
      token: state.token,
      user: state.user,
      loading: state.loading,
      error: state.error,
      signIn: state.signIn,
      signOut: state.signOut,
    }),
    shallow,
  );
}

export function useAuthHeader() {
  return useAuthStore((state) => (state.token ? { Authorization: `Bearer ${state.token}` } : {}));
}
export { AuthSync };

import { writable, derived } from 'svelte/store';
import type { User } from '../types/auth';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthStore>({
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  return {
    subscribe,
    login: async (username: string, password: string) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        const { user, token } = await response.json();

        update((state) => ({
          ...state,
          user,
          token,
          loading: false,
        }));

        localStorage.setItem('auth_token', token);
      } catch (error) {
        update((state) => ({
          ...state,
          user: null,
          token: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to login',
        }));
      }
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    },
    initialize: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      update((state) => ({ ...state, loading: true }));
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const user = await response.json();

        update((state) => ({
          ...state,
          user,
          token,
          loading: false,
        }));
      } catch (error) {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize auth',
        });
      }
    },
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, ($auth) => $auth.user !== null);
export const isLoading = derived(auth, ($auth) => $auth.loading);

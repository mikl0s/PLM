import { writable, derived } from 'svelte/store';
import { TautulliClient } from '../api/tautulli';
import type { LibraryStats } from '../types/library';

interface TautulliStore {
  client: TautulliClient | null;
  loading: boolean;
  error: string | null;
}

function createTautulliStore() {
  const { subscribe, set, update } = writable<TautulliStore>({
    client: null,
    loading: false,
    error: null,
  });

  return {
    subscribe,
    initialize: async (url: string, apiKey: string) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const client = new TautulliClient(url, apiKey);
        const isConnected = await client.testConnection();

        if (!isConnected) {
          throw new Error('Failed to connect to Tautulli server');
        }

        update((state) => ({
          ...state,
          client,
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          client: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize Tautulli client',
        }));
      }
    },
    getLibraryStats: async (libraryId: string): Promise<LibraryStats | null> => {
      let stats: LibraryStats | null = null;
      let error: string | null = null;

      update((state) => {
        if (!state.client) {
          error = 'Tautulli client not initialized';
          return state;
        }

        state.client
          .getLibraryStats(libraryId)
          .then((result) => {
            stats = result;
          })
          .catch((e) => {
            error = e instanceof Error ? e.message : 'Failed to fetch library stats';
          });

        return state;
      });

      if (error) throw new Error(error);
      return stats;
    },
    reset: () => {
      set({
        client: null,
        loading: false,
        error: null,
      });
    },
  };
}

export const tautulli = createTautulliStore();
export const isInitialized = derived(tautulli, ($tautulli) => $tautulli.client !== null);
export const isLoading = derived(tautulli, ($tautulli) => $tautulli.loading);

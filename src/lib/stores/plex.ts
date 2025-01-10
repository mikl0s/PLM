import { writable } from 'svelte/store';
import type { Library, MediaItem } from '$lib/types/library';
import type { PlexServer } from '$lib/types/plex';

interface PlexStore {
  initialize: (server: PlexServer) => Promise<void>;
  getLibrary: (serverId: string, libraryId: string) => Promise<Library | undefined>;
  getUnusedItems: (
    serverId: string,
    libraryId: string,
    options: {
      threshold?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    }
  ) => Promise<MediaItem[]>;
}

const isLoading = writable(false);
const currentServer = writable<PlexServer | null>(null);

const plex: PlexStore = {
  async initialize(server: PlexServer) {
    isLoading.set(true);
    try {
      // Test connection
      const response = await fetch(`${server.url}/identity`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Plex server');
      }

      currentServer.set(server);
    } finally {
      isLoading.set(false);
    }
  },

  async getLibrary(serverId: string, libraryId: string): Promise<Library | undefined> {
    isLoading.set(true);
    try {
      // Get server details
      const serverResponse = await fetch(`/api/plex/servers/${serverId}`);
      if (!serverResponse.ok) {
        throw new Error('Failed to get server details');
      }
      const server = await serverResponse.json();

      // Get library sections
      const response = await fetch(`${server.url}/library/sections/${libraryId}`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const data = await response.json();
      const library = data.MediaContainer.Directory[0];

      // Get library stats
      const statsResponse = await fetch(`${server.url}/library/sections/${libraryId}/all`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch library stats');
      }

      const statsData = await statsResponse.json();
      const items = statsData.MediaContainer.Metadata || [];
      let totalSize = 0;
      let unusedSize = 0;
      let unusedItems = 0;

      items.forEach((item: any) => {
        const media = item.Media?.[0];
        const size = media?.Part?.[0]?.size || 0;
        totalSize += size;
        if (!item.lastViewedAt) {
          unusedSize += size;
          unusedItems++;
        }
      });

      return {
        id: library.key,
        name: library.title,
        type: library.type === 'movie' ? 'movie' : library.type === 'show' ? 'show' : 'music',
        totalItems: items.length,
        unusedItems,
        totalSize,
        unusedSize,
        rootPath: library.Location?.[0]?.path || ''
      };
    } finally {
      isLoading.set(false);
    }
  },

  async getUnusedItems(
    serverId: string,
    libraryId: string,
    options: {
      threshold?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    }
  ): Promise<MediaItem[]> {
    isLoading.set(true);
    try {
      // Get server details
      const serverResponse = await fetch(`/api/plex/servers/${serverId}`);
      if (!serverResponse.ok) {
        throw new Error('Failed to get server details');
      }
      const server = await serverResponse.json();

      const response = await fetch(`${server.url}/library/sections/${libraryId}/all`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch library items');
      }

      const data = await response.json();
      const items = data.MediaContainer.Metadata || [];

      // Filter and map items
      const result = items
        .filter((item: any) => {
          // Apply search filter
          if (options.search?.toLowerCase()) {
            const searchTerm = options.search.toLowerCase();
            if (!item.title.toLowerCase().includes(searchTerm)) {
              return false;
            }
          }

          // Apply threshold filter
          if (!item.lastViewedAt) return true;
          if (options.threshold) {
            return new Date(item.lastViewedAt * 1000) < new Date(Date.now() - options.threshold);
          }
          return false;
        })
        .map((item: any) => {
          const media = item.Media?.[0];
          const part = media?.Part?.[0];
          const videoStream = part?.Stream?.find((s: any) => s.streamType === 1); // 1 = video

          return {
            id: item.ratingKey,
            title: item.title,
            year: item.year,
            addedAt: new Date(item.addedAt * 1000),
            lastViewedAt: item.lastViewedAt ? new Date(item.lastViewedAt * 1000) : undefined,
            duration: item.duration || 0,
            size: part?.size || 0,
            codec: videoStream?.codec || media?.videoCodec || '',
            resolution: media?.videoResolution,
            bitrate: media?.bitrate || 0,
            playCount: item.viewCount || 0
          };
        });

      // Sort items
      if (options.sortBy) {
        result.sort((a: MediaItem, b: MediaItem) => {
          const aValue = a[options.sortBy as keyof MediaItem];
          const bValue = b[options.sortBy as keyof MediaItem];
          const order = options.sortOrder === 'desc' ? -1 : 1;

          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return 1 * order;
          if (bValue === undefined) return -1 * order;

          // Compare values
          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
          return 0;
        });
      }

      return result;
    } finally {
      isLoading.set(false);
    }
  }
};

export { plex, isLoading, currentServer };

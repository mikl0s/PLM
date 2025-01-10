import type { PlexResponse, PlexLibrary, PlexMediaItem } from '../types/plex';
import type { Library, MediaItem } from '../types/library';

export class PlexClient {
  private baseUrl: string;
  private token: string;
  private headers: HeadersInit;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
    this.headers = {
      'X-Plex-Token': token,
      Accept: 'application/json',
    };
  }

  /**
   * Test the connection to the Plex server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/identity`, {
        headers: this.headers,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all libraries from the Plex server
   */
  async getLibraries(): Promise<Library[]> {
    const response = await fetch(`${this.baseUrl}/library/sections`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch libraries');
    }

    const data: PlexResponse<PlexLibrary> = await response.json();
    const libraries = data.MediaContainer.Directory || [];

    return libraries.map((lib) => ({
      id: lib.key,
      name: lib.title,
      type: this.mapLibraryType(lib.type),
      totalItems: 0, // Will be populated by getLibraryStats
      unusedItems: 0,
      totalSize: 0,
      unusedSize: 0,
      rootPath: lib.location[0]?.path || '',
    }));
  }

  /**
   * Get library statistics
   */
  async getLibraryStats(libraryId: string): Promise<{
    totalItems: number;
    unusedItems: number;
    totalSize: number;
    unusedSize: number;
  }> {
    const allItems = await this.getAllLibraryItems(libraryId);
    let totalSize = 0;
    let unusedSize = 0;
    const unusedItems = allItems.filter((item) => {
      const size = item.Media?.[0]?.Part?.[0]?.size || 0;
      totalSize += size;
      if (!item.lastViewedAt) {
        unusedSize += size;
        return true;
      }
      return false;
    }).length;

    return {
      totalItems: allItems.length,
      unusedItems,
      totalSize,
      unusedSize,
    };
  }

  /**
   * Get all items in a library
   */
  async getAllLibraryItems(libraryId: string): Promise<PlexMediaItem[]> {
    const items: PlexMediaItem[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `${this.baseUrl}/library/sections/${libraryId}/all?X-Plex-Container-Start=${offset}&X-Plex-Container-Size=${limit}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch library items');
      }

      const data: PlexResponse<PlexMediaItem> = await response.json();
      const batch = data.MediaContainer.Metadata || [];
      items.push(...batch);

      hasMore = batch.length === limit;
      if (hasMore) {
        offset += limit;
      }
    }

    return items;
  }

  /**
   * Get unused media items from a library
   */
  async getUnusedItems(
    libraryId: string,
    options: {
      threshold?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
    } = {}
  ): Promise<MediaItem[]> {
    const allItems = await this.getAllLibraryItems(libraryId);
    const thresholdDate = options.threshold ? new Date(Date.now() - options.threshold) : null;

    let items = allItems
      .filter((item) => {
        if (options.search?.toLowerCase()) {
          const searchTerm = options.search.toLowerCase();
          if (!item.title.toLowerCase().includes(searchTerm)) {
            return false;
          }
        }

        if (!item.lastViewedAt) return true;
        if (thresholdDate) {
          return new Date(item.lastViewedAt * 1000) < thresholdDate;
        }
        return false;
      })
      .map((item) => this.mapPlexItemToMediaItem(item));

    // Sort items
    if (options.sortBy) {
      items.sort((a, b) => {
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

    return items;
  }

  /**
   * Map Plex library type to our internal type
   */
  private mapLibraryType(type: string): 'movie' | 'show' | 'music' {
    switch (type) {
      case 'movie':
        return 'movie';
      case 'show':
        return 'show';
      case 'artist':
        return 'music';
      default:
        return 'movie';
    }
  }

  /**
   * Map Plex media item to our internal media item type
   */
  private mapPlexItemToMediaItem(item: PlexMediaItem): MediaItem {
    const media = item.Media?.[0];
    const part = media?.Part?.[0];
    const videoStream = part?.Stream?.find((s) => s.streamType === 1); // 1 = video

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
      playCount: item.viewCount || 0,
    };
  }
}

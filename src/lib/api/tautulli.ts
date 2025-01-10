import type { LibraryStats } from '../types/library';

interface TautulliResponse<T> {
  response: {
    result: 'success' | 'error';
    message?: string;
    data: T;
  };
}

interface TautulliLibraryStats {
  total_plays: number;
  total_duration: number;
  total_file_size: number;
  section_id: string;
  section_name: string;
  section_type: string;
  last_accessed: number;
  last_played: string;
  count: number;
  parent_count: number;
  child_count: number;
}

export class TautulliClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Test the connection to the Tautulli server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ version: string }>('get_server_info');
      return response.response.result === 'success';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get library statistics from Tautulli
   */
  async getLibraryStats(libraryId: string): Promise<LibraryStats> {
    const response = await this.makeRequest<TautulliLibraryStats>('get_library_stats', {
      section_id: libraryId,
    });

    if (response.response.result !== 'success') {
      throw new Error(response.response.message || 'Failed to fetch library stats');
    }

    const data = response.response.data;
    return {
      totalPlays: data.total_plays,
      totalDuration: data.total_duration,
      totalSize: data.total_file_size,
      lastAccessed: new Date(data.last_accessed * 1000),
      lastPlayed: data.last_played ? new Date(data.last_played) : undefined,
      itemCount: data.count,
      parentCount: data.parent_count,
      childCount: data.child_count,
    };
  }

  /**
   * Make a request to the Tautulli API
   */
  private async makeRequest<T>(
    cmd: string,
    params: Record<string, string | number> = {}
  ): Promise<TautulliResponse<T>> {
    const url = new URL(`${this.baseUrl}/api/v2`);
    url.searchParams.append('apikey', this.apiKey);
    url.searchParams.append('cmd', cmd);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

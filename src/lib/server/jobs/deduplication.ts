import { getPlexServers } from '../services/plex';
import { processLibrary } from '../services/fingerprint-generator';
import type { PlexServer } from '$lib/types/plex';

const SCAN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

async function scanServer(server: PlexServer): Promise<void> {
  try {
    // Get all libraries
    const response = await fetch(`${server.url}/library/sections`, {
      headers: {
        'X-Plex-Token': server.token,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch libraries');
    }

    const data = await response.json();
    const libraries = data.MediaContainer.Directory || [];

    // Process each library
    for (const library of libraries) {
      if (library.type !== 'movie' && library.type !== 'show') continue;

      // Get all items in library
      const itemsResponse = await fetch(`${server.url}/library/sections/${library.key}/all`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!itemsResponse.ok) {
        console.error(`Failed to fetch items for library ${library.title}`);
        continue;
      }

      const itemsData = await itemsResponse.json();
      const items = itemsData.MediaContainer.Metadata || [];

      // Process items
      await processLibrary(server, library.key, items);
    }
  } catch (error) {
    console.error(`Error scanning server ${server.name}:`, error);
  }
}

async function scanAllServers(): Promise<void> {
  try {
    // Get all users (in a real implementation, you'd want to handle this differently)
    const users = await getAllUsers();

    for (const user of users) {
      const servers = await getPlexServers(user.id);
      for (const server of servers) {
        await scanServer(server);
      }
    }
  } catch (error) {
    console.error('Error in deduplication scan:', error);
  }
}

// Start background job
let scanInterval: ReturnType<typeof setInterval>;

export function startDedupeScan(): void {
  // Run initial scan
  scanAllServers();

  // Schedule regular scans
  scanInterval = setInterval(scanAllServers, SCAN_INTERVAL);
}

export function stopDedupeScan(): void {
  if (scanInterval) {
    clearInterval(scanInterval);
  }
}

// Helper function to get all users (this should be implemented properly)
async function getAllUsers(): Promise<Array<{ id: string }>> {
  // This is a placeholder. In a real implementation, you'd fetch this from your database
  return [];
} 
import type { PlexServer } from '$lib/types/plex';
import type { MediaFingerprint } from '$lib/types/fingerprint';
import { addFingerprint, findDuplicates } from './fingerprint';
import crypto from 'crypto';

interface PlexMediaItem {
  ratingKey: string;
  title: string;
  year?: number;
  Media?: Array<{
    duration?: number;
    bitrate?: number;
    audioChannels?: number;
    audioCodec?: string;
    videoCodec?: string;
    videoResolution?: string;
    container?: string;
    Part?: Array<{
      size: number;
    }>;
  }>;
}

export async function generateFingerprint(
  server: PlexServer,
  libraryId: string,
  item: PlexMediaItem
): Promise<MediaFingerprint | null> {
  try {
    const media = item.Media?.[0];
    if (!media) return null;

    const size = media.Part?.[0]?.size;
    const duration = media.duration;

    if (!size || !duration) return null;

    // Create fingerprint
    const fingerprint: Omit<MediaFingerprint, 'id' | 'createdAt' | 'updatedAt'> = {
      serverId: server.id,
      libraryId,
      mediaId: item.ratingKey,
      title: item.title,
      year: item.year,
      primary: {
        size,
        duration
      },
      secondary: {
        videoCodec: media.videoCodec || '',
        resolution: media.videoResolution || '',
        audioBitrate: media.bitrate || 0,
        audioChannels: media.audioChannels || 0,
        container: media.container || ''
      },
      hash: generateHash({
        size,
        duration,
        videoCodec: media.videoCodec,
        resolution: media.videoResolution,
        audioBitrate: media.bitrate,
        audioChannels: media.audioChannels,
        container: media.container
      })
    };

    // Add fingerprint to database
    const savedFingerprint = await addFingerprint(fingerprint);

    // Find duplicates
    await findDuplicates(savedFingerprint);

    return savedFingerprint;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return null;
  }
}

function generateHash(data: Record<string, any>): string {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
}

export async function processLibrary(
  server: PlexServer,
  libraryId: string,
  items: PlexMediaItem[]
): Promise<void> {
  for (const item of items) {
    await generateFingerprint(server, libraryId, item);
  }
} 
import { MongoClient, ObjectId } from 'mongodb';
import type { MediaFingerprint, DuplicateMatch, DuplicateMatchWithDetails } from '$lib/types/fingerprint';
import { getPlexServer } from './plex';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'plm';
const FINGERPRINTS_COLLECTION = 'media_fingerprints';
const MATCHES_COLLECTION = 'duplicate_matches';

type FingerprintDoc = Omit<MediaFingerprint, 'id'> & { _id: ObjectId };
type MatchDoc = Omit<DuplicateMatch, 'id'> & { _id: ObjectId };

async function connectToDb(): Promise<MongoClient> {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export async function addFingerprint(fingerprint: Omit<MediaFingerprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFingerprint> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const fingerprints = db.collection(FINGERPRINTS_COLLECTION);

    const now = new Date();
    const doc: Omit<FingerprintDoc, '_id'> = {
      ...fingerprint,
      createdAt: now,
      updatedAt: now
    };

    const result = await fingerprints.insertOne(doc as any);
    return {
      ...doc,
      id: result.insertedId.toString()
    } as MediaFingerprint;
  } finally {
    await client.close();
  }
}

export async function findDuplicates(fingerprint: MediaFingerprint): Promise<DuplicateMatch[]> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const fingerprints = db.collection<FingerprintDoc>(FINGERPRINTS_COLLECTION);

    // Find potential matches based on primary fingerprint
    const matches = await fingerprints
      .find({
        '_id': { $ne: new ObjectId(fingerprint.id) },
        'primary.size': fingerprint.primary.size,
        'primary.duration': {
          $gte: fingerprint.primary.duration - 1000, // 1 second tolerance
          $lte: fingerprint.primary.duration + 1000
        }
      })
      .toArray();

    // Calculate confidence for each match
    const duplicateMatches: DuplicateMatch[] = [];
    for (const match of matches) {
      const confidence = calculateConfidence(fingerprint, {
        ...match,
        id: match._id.toString()
      } as MediaFingerprint);

      if (confidence >= 60) { // Minimum confidence threshold
        const now = new Date();
        const duplicateMatch: Omit<DuplicateMatch, 'id'> = {
          sourceFingerprint: fingerprint.id,
          matchedFingerprint: match._id.toString(),
          confidence,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        };

        const result = await db.collection(MATCHES_COLLECTION).insertOne(duplicateMatch as any);
        duplicateMatches.push({
          ...duplicateMatch,
          id: result.insertedId.toString()
        } as DuplicateMatch);
      }
    }

    return duplicateMatches;
  } finally {
    await client.close();
  }
}

export async function getDuplicateMatches(
  userId: string,
  status?: 'pending' | 'confirmed' | 'rejected'
): Promise<DuplicateMatchWithDetails[]> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const matches = db.collection<MatchDoc>(MATCHES_COLLECTION);
    const fingerprints = db.collection<FingerprintDoc>(FINGERPRINTS_COLLECTION);

    const query = status ? { status } : {};
    const matchDocs = await matches.find(query).sort({ confidence: -1 }).toArray();

    const detailedMatches: DuplicateMatchWithDetails[] = [];
    for (const match of matchDocs) {
      const sourceFingerprint = await fingerprints.findOne({ _id: new ObjectId(match.sourceFingerprint) });
      const matchedFingerprint = await fingerprints.findOne({ _id: new ObjectId(match.matchedFingerprint) });

      if (sourceFingerprint && matchedFingerprint) {
        const sourceServer = await getPlexServer(sourceFingerprint.serverId);
        const matchedServer = await getPlexServer(matchedFingerprint.serverId);

        if (sourceServer?.userId === userId && matchedServer?.userId === userId) {
          detailedMatches.push({
            ...match,
            id: match._id.toString(),
            sourceMedia: {
              title: sourceFingerprint.title || 'Unknown',
              year: sourceFingerprint.year,
              resolution: sourceFingerprint.secondary.resolution,
              size: sourceFingerprint.primary.size,
              server: sourceServer.name,
              library: sourceFingerprint.libraryId
            },
            matchedMedia: {
              title: matchedFingerprint.title || 'Unknown',
              year: matchedFingerprint.year,
              resolution: matchedFingerprint.secondary.resolution,
              size: matchedFingerprint.primary.size,
              server: matchedServer.name,
              library: matchedFingerprint.libraryId
            }
          });
        }
      }
    }

    return detailedMatches;
  } finally {
    await client.close();
  }
}

export async function updateMatchStatus(
  matchId: string,
  userId: string,
  status: 'confirmed' | 'rejected'
): Promise<boolean> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const matches = db.collection(MATCHES_COLLECTION);

    const now = new Date();
    const result = await matches.updateOne(
      { _id: new ObjectId(matchId) },
      {
        $set: {
          status,
          updatedAt: now,
          reviewedAt: now,
          reviewedBy: userId
        }
      }
    );

    return result.modifiedCount === 1;
  } finally {
    await client.close();
  }
}

function calculateConfidence(a: MediaFingerprint, b: MediaFingerprint): number {
  let score = 0;
  
  // Primary match (60%)
  if (a.primary.size === b.primary.size) score += 30;
  if (Math.abs(a.primary.duration - b.primary.duration) <= 1000) score += 30;
  
  // Secondary matches (40%)
  if (a.secondary.videoCodec === b.secondary.videoCodec) score += 10;
  if (a.secondary.resolution === b.secondary.resolution) score += 10;
  if (Math.abs(a.secondary.audioBitrate - b.secondary.audioBitrate) < 1000) score += 10;
  if (a.secondary.audioChannels === b.secondary.audioChannels) score += 10;
  
  return score;
} 
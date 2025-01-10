import { MongoClient, ObjectId } from 'mongodb';
import type { PlexServer, PlexCredentials } from '$lib/types/plex';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'plm';
const PLEX_SERVERS_COLLECTION = 'plex_servers';

type PlexServerDoc = Omit<PlexServer, 'id'> & { _id: ObjectId };

async function connectToDb(): Promise<MongoClient> {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export async function getPlexToken(credentials: PlexCredentials): Promise<string> {
  const clientId = 'PLM';
  const response = await fetch('https://plex.tv/api/v2/users/signin', {
    method: 'POST',
    headers: {
      'X-Plex-Client-Identifier': clientId,
      'X-Plex-Product': 'PLM',
      'X-Plex-Version': '1.0.0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: credentials.username,
      password: credentials.password
    })
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Plex');
  }

  const data = await response.json();
  return data.authToken;
}

export async function addPlexServer(
  userId: string,
  name: string,
  url: string,
  token: string
): Promise<PlexServer> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection(PLEX_SERVERS_COLLECTION);

    const now = new Date();
    const server: Omit<PlexServer, 'id'> = {
      name,
      url: url.replace(/\/$/, ''), // Remove trailing slash
      token,
      userId,
      createdAt: now,
      updatedAt: now
    };

    const result = await servers.insertOne(server);

    return {
      ...server,
      id: result.insertedId.toString()
    };
  } finally {
    await client.close();
  }
}

export async function getPlexServers(userId: string): Promise<PlexServer[]> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection<PlexServerDoc>(PLEX_SERVERS_COLLECTION);

    const result = await servers
      .find({ userId })
      .map(doc => ({
        ...doc,
        id: doc._id.toString(),
        _id: undefined
      }))
      .toArray();

    return result.map(({ _id, ...rest }) => rest);
  } finally {
    await client.close();
  }
}

export async function getPlexServer(id: string): Promise<PlexServer | null> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection<PlexServerDoc>(PLEX_SERVERS_COLLECTION);

    const server = await servers.findOne({ _id: new ObjectId(id) });
    if (!server) {
      return null;
    }

    const { _id, ...rest } = server;
    return {
      ...rest,
      id: _id.toString()
    };
  } finally {
    await client.close();
  }
}

export async function updatePlexServer(
  id: string,
  updates: Partial<Pick<PlexServer, 'name' | 'url' | 'token'>>
): Promise<PlexServer | null> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection<PlexServerDoc>(PLEX_SERVERS_COLLECTION);

    const result = await servers.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }

    const { _id, ...rest } = result;
    return {
      ...rest,
      id: _id.toString()
    };
  } finally {
    await client.close();
  }
}

export async function deletePlexServer(id: string): Promise<boolean> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection(PLEX_SERVERS_COLLECTION);

    const result = await servers.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  } finally {
    await client.close();
  }
}

export async function updateLastSync(id: string): Promise<void> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const servers = db.collection(PLEX_SERVERS_COLLECTION);

    await servers.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
  } finally {
    await client.close();
  }
} 
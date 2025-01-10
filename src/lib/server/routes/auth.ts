import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import type { User, LoginCredentials, JwtPayload } from '../../types/auth';
import { JWT_SECRET } from '$env/static/private';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'plm';
const USERS_COLLECTION = 'users';

async function connectToDb(): Promise<MongoClient> {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

export async function login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const user = await users.findOne({ username: credentials.username });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    const { password, ...userWithoutPassword } = user;
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  } finally {
    await client.close();
  }
}

export async function createUser(
  username: string,
  password: string,
  isAdmin = false
): Promise<User> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const existingUser = await users.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await users.insertOne({
      username,
      password: hashedPassword,
      isAdmin,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: result.insertedId.toString(),
      username,
      isAdmin,
      createdAt: now,
      updatedAt: now,
    };
  } finally {
    await client.close();
  }
}

export async function getUser(userId: string): Promise<User | null> {
  const client = await connectToDb();
  try {
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } finally {
    await client.close();
  }
}

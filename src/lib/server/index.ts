import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/plm');
let db: any;

// SQLite connection for Plex database
let plexDb: any;

async function connectToMongoDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function connectToPlexDB() {
  try {
    plexDb = await open({
      filename: process.env.PLEX_DATABASE_PATH || '',
      driver: sqlite3.Database,
    });
    console.log('Connected to Plex database');
  } catch (error) {
    console.error('Plex database connection error:', error);
  }
}

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

app.get('/api/libraries', authenticateToken, async (req, res) => {
  try {
    if (!plexDb) {
      return res.status(500).json({ error: 'Plex database not connected' });
    }

    const libraries = await plexDb.all(`
      SELECT 
        section_locations.root_path,
        library_sections.name,
        library_sections.section_type as type,
        COUNT(metadata_items.id) as totalItems,
        SUM(CASE WHEN metadata_items.viewed_at IS NULL THEN 1 ELSE 0 END) as unusedItems
      FROM library_sections
      JOIN section_locations ON library_sections.id = section_locations.library_section_id
      LEFT JOIN metadata_items ON library_sections.id = metadata_items.library_section_id
      GROUP BY library_sections.id
    `);

    res.json(libraries);
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ error: 'Failed to fetch libraries' });
  }
});

app.get('/api/library/:id/unused', authenticateToken, async (req, res) => {
  try {
    if (!plexDb) {
      return res.status(500).json({ error: 'Plex database not connected' });
    }

    const { id } = req.params;
    const { threshold } = req.query;
    const thresholdDate = threshold ? new Date(Date.now() - parseInt(threshold as string)) : null;

    const query = `
      SELECT 
        metadata_items.title,
        metadata_items.year,
        metadata_items.added_at,
        metadata_items.duration,
        metadata_items.viewed_at,
        media_items.size
      FROM metadata_items
      JOIN media_items ON metadata_items.id = media_items.metadata_item_id
      WHERE metadata_items.library_section_id = ?
        AND metadata_items.viewed_at IS NULL
        ${thresholdDate ? 'AND metadata_items.added_at < ?' : ''}
      ORDER BY metadata_items.added_at DESC
    `;

    const params = thresholdDate ? [id, thresholdDate.getTime() / 1000] : [id];
    const items = await plexDb.all(query, params);

    res.json(items);
  } catch (error) {
    console.error('Error fetching unused items:', error);
    res.status(500).json({ error: 'Failed to fetch unused items' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  await connectToMongoDB();
  await connectToPlexDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

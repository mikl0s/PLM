# Backend Documentation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (User data, settings, cache)
- **External APIs**:
  - Plex API for media data
  - Tautulli API for enhanced statistics
- **Authentication**: JWT with bcrypt

## Project Structure

```
src/lib/
├── server/
│   ├── index.ts           # Main server file
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
└── api/
    ├── plex.ts           # Plex API client
    └── tautulli.ts       # Tautulli API client
```

## API Endpoints

### Authentication

```typescript
POST /api/login
- Body: { username: string, password: string }
- Response: { token: string }
```

### Libraries

```typescript
GET /api/libraries
- Headers: Authorization: Bearer <token>
- Response: Library[]

GET /api/library/:id/unused
- Headers: Authorization: Bearer <token>
- Query: { threshold?: number }
- Response: MediaItem[]
```

### Settings

```typescript
GET /api/settings
- Headers: Authorization: Bearer <token>
- Response: Settings

PUT /api/settings
- Headers: Authorization: Bearer <token>
- Body: Settings
- Response: Settings
```

## External API Integration

### Plex API Client

```typescript
class PlexClient {
  constructor(
    private baseUrl: string,
    private token: string
  ) {}

  async getLibraries() {
    const response = await fetch(`${this.baseUrl}/library/sections`, {
      headers: {
        'X-Plex-Token': this.token,
        Accept: 'application/json',
      },
    });
    return response.json();
  }

  async getLibraryContent(libraryId: string) {
    const response = await fetch(`${this.baseUrl}/library/sections/${libraryId}/all`, {
      headers: {
        'X-Plex-Token': this.token,
        Accept: 'application/json',
      },
    });
    return response.json();
  }
}
```

### Tautulli API Client

```typescript
class TautulliClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async getLibraryStats(libraryId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v2?cmd=get_library_media_info&section_id=${libraryId}`,
      {
        headers: {
          'X-Api-Key': this.apiKey,
          Accept: 'application/json',
        },
      }
    );
    return response.json();
  }
}
```

## Database Connection

### MongoDB Connection

```typescript
import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(process.env.MONGODB_URI);
await mongoClient.connect();
const db = mongoClient.db();
```

## Authentication Flow

1. User submits credentials
2. Server validates against MongoDB
3. If valid, generates JWT token
4. Token required for all protected routes
5. Token expiration handled by middleware

## Error Handling

### Global Error Handler

```typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
```

### Custom Error Types

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
  }
}
```

## Security Measures

1. **Input Validation**

   - Request body validation
   - Query parameter sanitization
   - Path parameter validation

2. **Authentication**

   - Secure password hashing with bcrypt
   - JWT token validation
   - Token refresh mechanism

3. **API Security**
   - Rate limiting
   - CORS configuration
   - HTTP security headers
   - Secure storage of API tokens

## Performance Optimization

1. **Caching**

   - Media information caching
   - API response caching
   - In-memory caching for frequent requests

2. **Query Optimization**

   - MongoDB indexing
   - Batch operations
   - Parallel API requests

3. **Resource Management**
   - Connection pooling
   - Memory usage monitoring
   - Request timeout handling

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/plm

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# Plex Configuration
PLEX_URL=http://your-plex-server:32400
PLEX_TOKEN=your_plex_token

# Tautulli Configuration
TAUTULLI_URL=http://localhost:8181
TAUTULLI_API_KEY=your_api_key
```

## Logging

- Request logging with Morgan
- Error logging with Winston
- API call tracking
- Performance metrics
- Audit logging for sensitive operations

## Testing

- Unit tests with Jest
- Integration tests
- API endpoint tests
- Mock API responses

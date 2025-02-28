# Database Schema Documentation

## MongoDB Collections

### Users Collection

```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string (hashed)",
  "createdAt": "Date",
  "lastLogin": "Date"
}
```

### Settings Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "thresholdDays": "number",
  "exportFormat": "string",
  "archivedMedia": ["string"],
  "plexToken": "string",
  "plexUrl": "string",
  "tautuliUrl": "string",
  "tautuliApiKey": "string"
}
```

### MediaCache Collection

```json
{
  "_id": "ObjectId",
  "mediaKey": "string",
  "libraryId": "string",
  "mediaInfo": {
    "title": "string",
    "year": "number",
    "addedAt": "Date",
    "lastViewedAt": "Date",
    "codec": "string",
    "bitrate": "number",
    "resolution": "string",
    "duration": "number",
    "size": "number",
    "playCount": "number"
  },
  "lastUpdated": "Date"
}
```

### MediaFingerprints Collection

```json
{
  "_id": "ObjectId",
  "serverId": "ObjectId",
  "libraryId": "string",
  "mediaId": "string",
  "primary": {
    "size": "number",
    "duration": "number"
  },
  "secondary": {
    "videoCodec": "string",
    "resolution": "string",
    "audioBitrate": "number",
    "audioChannels": "number",
    "container": "string"
  },
  "hash": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DuplicateMatches Collection

```json
{
  "_id": "ObjectId",
  "sourceFingerprint": "ObjectId",
  "matchedFingerprint": "ObjectId",
  "confidence": "number",
  "status": "enum('pending', 'confirmed', 'rejected')",
  "createdAt": "Date",
  "updatedAt": "Date",
  "reviewedAt": "Date",
  "reviewedBy": "ObjectId"
}
```

## External API Data Structures

### Plex API

The application interacts with the following Plex API endpoints:

- `/library/sections`: List all libraries
- `/library/sections/{id}/all`: Get all items in a library
- `/library/metadata/{id}`: Get detailed metadata for an item

### Tautulli API

The application uses these Tautulli API endpoints for enhanced statistics:

- `/api/v2?cmd=get_libraries`: Get library statistics
- `/api/v2?cmd=get_library_media_info`: Get detailed media information
- `/api/v2?cmd=get_library_watch_time_stats`: Get watch time statistics

## Relationships

1. Users -> Settings (1:1)
2. MediaCache -> Settings (N:1)
3. MediaFingerprints -> PlexServers (N:1)
4. DuplicateMatches -> MediaFingerprints (N:2)

## Indexes

### MongoDB

- Users Collection:
  - `username`: Unique index
  - `createdAt`: Index
- MediaCache Collection:
  - `mediaKey`: Unique index
  - `libraryId`: Index
  - `lastUpdated`: Index
  - `mediaInfo.lastViewedAt`: Index

- MediaFingerprints Collection:
  - `hash`: Index
  - `serverId`: Index
  - `libraryId`: Index
  - `primary.size`: Index
  - `primary.duration`: Index

- DuplicateMatches Collection:
  - `sourceFingerprint`: Index
  - `matchedFingerprint`: Index
  - `confidence`: Index
  - `status`: Index
  - `createdAt`: Index

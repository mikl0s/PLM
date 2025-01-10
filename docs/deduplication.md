# Media Deduplication System

The PLM deduplication system helps identify and manage duplicate media content across multiple Plex servers and libraries. This document outlines how the system works and how to use it effectively.

## Overview

The deduplication system consists of several components:

1. **Fingerprint Generation**: Creates unique fingerprints for media files based on their properties
2. **Background Scanning**: Regularly scans libraries for new content and generates fingerprints
3. **Duplicate Detection**: Identifies potential duplicates using fingerprint matching
4. **Management UI**: Interface for reviewing and managing duplicate content

## How It Works

### Fingerprint Generation

Media fingerprints are generated using various file properties:

- Primary properties (60% weight):
  - File size
  - Duration

- Secondary properties (40% weight):
  - Video codec
  - Resolution
  - Audio bitrate
  - Audio channels
  - Container format

### Duplicate Detection

The system uses a confidence-based matching algorithm:

- Matches with confidence >= 60% are considered potential duplicates
- Primary property matches contribute more to the confidence score
- Secondary property matches fine-tune the confidence

### Background Scanning

- Runs every 24 hours by default
- Scans all configured Plex servers
- Processes new or modified media files
- Updates fingerprint database
- Identifies new potential duplicates

## Using the Duplicate Management UI

### Viewing Duplicates

The duplicate management page (`/duplicates`) shows all identified duplicates with:

- Match confidence percentage
- Source and matched media details
- File locations and sizes
- Media quality information

### Filtering and Sorting

You can filter duplicates by:
- Status (All/Pending/Confirmed/Rejected)
- Sort by:
  - Confidence
  - Size
  - Title
- Sort order (Ascending/Descending)

### Managing Duplicates

For each duplicate match, you can:

1. **Confirm**: Mark as a confirmed duplicate
2. **Reject**: Mark as not a duplicate
3. **Batch Actions**: Select multiple items to confirm or reject together

### Status Indicators

- **Pending**: Newly identified duplicates that need review
- **Confirmed**: Verified duplicates
- **Rejected**: False positives that aren't actual duplicates

## API Endpoints

### GET /api/duplicates
- Returns all duplicate matches for the authenticated user
- Optional status filter

### PATCH /api/duplicates/:id
- Updates the status of a duplicate match
- Status can be 'confirmed' or 'rejected'

## Database Schema

### Media Fingerprints
```typescript
interface MediaFingerprint {
  id: string;
  serverId: string;
  libraryId: string;
  mediaId: string;
  title: string;
  year?: number;
  primary: {
    size: number;
    duration: number;
  };
  secondary: {
    videoCodec: string;
    resolution: string;
    audioBitrate: number;
    audioChannels: number;
    container: string;
  };
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Duplicate Matches
```typescript
interface DuplicateMatch {
  id: string;
  sourceFingerprint: string;
  matchedFingerprint: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
```

## Best Practices

1. **Regular Review**: Check the duplicates page regularly to manage new matches
2. **Confidence Scores**: Pay extra attention to matches with high confidence scores
3. **Quality Comparison**: Consider resolution and bitrate when deciding which copy to keep
4. **Storage Location**: Consider file locations when managing duplicates across servers

## Future Improvements

1. **Smart Actions**: Automated actions based on user-defined rules
2. **Enhanced Matching**: Additional matching criteria like audio language and subtitles
3. **Integration**: Direct integration with Plex's delete functionality
4. **Statistics**: Detailed reports on storage savings and duplicate patterns 
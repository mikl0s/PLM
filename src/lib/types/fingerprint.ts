export interface MediaFingerprint {
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

export interface DuplicateMatch {
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

export interface DuplicateMatchWithDetails extends DuplicateMatch {
  sourceMedia: {
    title: string;
    year?: number;
    resolution: string;
    size: number;
    server: string;
    library: string;
  };
  matchedMedia: {
    title: string;
    year?: number;
    resolution: string;
    size: number;
    server: string;
    library: string;
  };
} 
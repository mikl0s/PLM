export interface PlexResponse<T> {
  MediaContainer: {
    size: number;
    totalSize?: number;
    offset?: number;
    allowSync?: boolean;
    identifier?: string;
    mediaTagPrefix?: string;
    mediaTagVersion?: number;
    title1?: string;
    Directory?: T[];
    Metadata?: T[];
  };
}

export interface PlexLibrary {
  key: string;
  title: string;
  type: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
  location: Array<{
    id: number;
    path: string;
  }>;
}

export interface PlexMediaItem {
  ratingKey: string;
  key: string;
  guid: string;
  studio?: string;
  type: string;
  title: string;
  titleSort?: string;
  originalTitle?: string;
  summary: string;
  rating?: number;
  viewCount?: number;
  lastViewedAt?: number;
  year?: number;
  tagline?: string;
  thumb?: string;
  art?: string;
  duration?: number;
  originallyAvailableAt?: string;
  addedAt: number;
  updatedAt: number;
  Media?: Array<{
    id: number;
    duration?: number;
    bitrate?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
    audioChannels?: number;
    audioCodec?: string;
    videoCodec?: string;
    videoResolution?: string;
    container?: string;
    videoFrameRate?: string;
    optimizedForStreaming?: number;
    Part?: Array<{
      id: number;
      key: string;
      duration?: number;
      file: string;
      size: number;
      container: string;
      videoProfile?: string;
      Stream?: Array<{
        id: number;
        streamType: number;
        default?: boolean;
        codec?: string;
        index: number;
        bitrate?: number;
        language?: string;
        languageCode?: string;
        bitDepth?: number;
        chromaLocation?: string;
        chromaSubsampling?: string;
        codedHeight?: number;
        codedWidth?: number;
        colorRange?: string;
        frameRate?: number;
        height?: number;
        level?: number;
        profile?: string;
        refFrames?: number;
        width?: number;
      }>;
    }>;
  }>;
}

export interface PlexServer {
  id: string;
  name: string;
  url: string;
  token: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
}

export interface PlexCredentials {
  username: string;
  password: string;
}

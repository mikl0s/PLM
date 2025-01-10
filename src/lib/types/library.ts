export interface Library {
  id: string;
  name: string;
  type: 'movie' | 'show' | 'music';
  totalItems: number;
  unusedItems: number;
  totalSize: number;
  unusedSize: number;
  rootPath: string;
}

export interface MediaItem {
  id: string;
  title: string;
  year?: number;
  addedAt: Date;
  lastViewedAt?: Date;
  duration: number;
  size: number;
  codec: string;
  resolution?: string;
  bitrate: number;
  playCount: number;
}

export interface LibraryStats {
  totalPlays: number;
  totalDuration: number;
  totalSize: number;
  lastAccessed: Date;
  lastPlayed?: Date;
  itemCount: number;
  parentCount: number;
  childCount: number;
}

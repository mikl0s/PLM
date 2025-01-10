# Frontend Documentation

## Technology Stack

- **Framework**: Svelte with SvelteKit
- **UI Library**: Skeleton UI
- **Styling**: Tailwind CSS
- **Theme**: Dark theme with purple accents

## Project Structure

```
src/
├── app.postcss           # Global styles
├── lib/                  # Shared utilities and components
│   ├── components/       # Reusable UI components
│   ├── stores/          # Svelte stores for state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
└── routes/              # SvelteKit routes and pages
```

## Components

### Layout Components

- `+layout.svelte`: Main app layout with navigation
- `AppShell`: Skeleton UI component for app structure
- `AppBar`: Top navigation bar

### Page Components

- `+page.svelte`: Dashboard page
- `library/[id]/+page.svelte`: Library details page
- `settings/+page.svelte`: Settings page

### Shared Components

- `LibraryCard`: Display library information
- `MediaList`: List of media items
- `ProgressBar`: Visual progress indicator
- `ExportButton`: Export functionality
- `ThresholdSelector`: Time frame selection

## State Management

### Svelte Stores

```typescript
// stores/auth.ts
export const user = writable<User | null>(null);
export const isAuthenticated = derived(user, ($user) => $user !== null);

// stores/libraries.ts
export const libraries = writable<Library[]>([]);
export const selectedLibrary = writable<Library | null>(null);

// stores/settings.ts
export const settings = writable<Settings>({
  thresholdDays: 365,
  exportFormat: 'json',
  archivedMedia: [],
});
```

## API Integration

### Endpoints

- `/api/libraries`: Fetch all libraries
- `/api/library/:id/unused`: Fetch unused media
- `/api/login`: User authentication
- `/api/settings`: User settings management

### Data Fetching

```typescript
// Example of data fetching with error handling
async function fetchLibraries() {
  try {
    const response = await fetch('/api/libraries');
    if (!response.ok) throw new Error('Failed to fetch libraries');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}
```

## Authentication

- JWT-based authentication
- Token stored in localStorage
- Protected routes redirect to login
- Automatic token refresh

## Styling

### Theme Configuration

```typescript
// Tailwind theme extends
colors: {
  'accent': {
    '50': '#f5f3ff',
    // ... other shades
    '950': '#2e1065'
  }
}
```

### Global Styles

- Dark mode by default
- Custom scrollbar styling
- Responsive design breakpoints
- Consistent spacing scale

## Error Handling

- Global error boundary
- API error handling
- Loading states
- Fallback UI components

## Performance Optimization

- Dynamic imports for routes
- Image lazy loading
- Debounced search inputs
- Cached API responses
- Skeleton loading states

## Features

### Media Deduplication
The system identifies potential duplicate media files across libraries using a composite fingerprint approach:

- **Primary Matching**
  - File size (exact match)
  - Duration (within 1-second tolerance)
  
- **Secondary Verification**
  - Video properties (codec, resolution, bitrate)
  - Audio properties (codec, channels, bitrate)
  - Container format
  
- **Confidence Scoring**
  - High (95%+): All properties match
  - Medium (80%+): Size/duration match, most properties match
  - Low (60%+): Size/duration match, some properties differ

### Implementation Details
The deduplication process runs as a background task when:
1. New media is added to a library
2. User manually triggers a scan
3. Scheduled scans (configurable)

Results are stored in MongoDB for quick access and historical tracking.

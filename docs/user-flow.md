# User Flow Documentation

## Authentication Flow

```mermaid
graph TD
    A[Start] --> B{First Time?}
    B -->|Yes| C[Create Admin Account]
    B -->|No| D[Login Screen]
    C --> D
    D --> E{Valid Credentials?}
    E -->|Yes| F[Dashboard]
    E -->|No| G[Show Error]
    G --> D
```

## Main User Journey

```mermaid
graph TD
    A[Dashboard] --> B[Select Library]
    B --> C[View Library Details]
    C --> D{Set Time Frame?}
    D -->|Yes| E[Adjust Threshold]
    D -->|No| F[Use Default]
    E --> G[View Unused Media]
    F --> G
    G --> H{Take Action}
    H -->|Export| I[Download List]
    H -->|Archive| J[Mark as Archived]
    H -->|Analyze| K[Space Savings]
```

## Library Management Flow

```mermaid
graph TD
    A[Library Card] --> B{Library Status}
    B -->|Connected| C[Show Statistics]
    B -->|Error| D[Show Error]
    C --> E[Display Items]
    E --> F{Filter Options}
    F -->|Time| G[By Last Played]
    F -->|Size| H[By File Size]
    F -->|Type| I[By Media Type]
```

## Space Analysis Flow

```mermaid
graph TD
    A[Select Media] --> B[Analyze Files]
    B --> C{Current Codec}
    C -->|H.264| D[Calculate H.265 Size]
    C -->|Other| E[Skip Analysis]
    D --> F[Show Savings]
    F --> G{Save Results?}
    G -->|Yes| H[Export Report]
    G -->|No| I[Continue Browsing]
```

## Settings Management

```mermaid
graph TD
    A[Settings Page] --> B{Configure}
    B --> C[Time Threshold]
    B --> D[Export Format]
    B --> E[Theme]
    C --> F[Save Settings]
    D --> F
    E --> F
    F --> G[Apply Changes]
```

## Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B{Check Connection}
    B -->|Success| C[Process Request]
    B -->|Failure| D[Show Error]
    C --> E{Valid Response?}
    E -->|Yes| F[Display Results]
    E -->|No| G[Show Error Message]
    D --> H[Retry Options]
    G --> H
    H --> I[Retry]
    H --> J[Cancel]
```

## Component Interactions

### Dashboard View

1. **Initial Load**

   - Check authentication
   - Load library list
   - Display statistics

2. **Library Selection**

   - Show library details
   - Load unused media
   - Calculate statistics

3. **Media Actions**
   - Export functionality
   - Archive options
   - Space analysis

### Settings Management

1. **Configuration**

   - Time threshold setting
   - Export format selection
   - Theme customization

2. **Data Management**
   - Cache clearing
   - Archive management
   - Export history

## Edge Cases

1. **Offline Mode**

   - Cache recent data
   - Show offline indicator
   - Queue changes

2. **Large Libraries**

   - Pagination
   - Lazy loading
   - Progressive rendering

3. **Error States**
   - Connection issues
   - Invalid data
   - Permission errors

# Third-Party Libraries Documentation

## Frontend Dependencies

### Core Framework

- **@sveltejs/kit**: ^2.0.0
  - SvelteKit framework for building the application
  - Handles routing, SSR, and application structure

### UI and Styling

- **@skeletonlabs/skeleton**: ^2.6.1
  - UI component library for Svelte
  - Provides pre-built components and theming
- **tailwindcss**: ^3.4.0
  - Utility-first CSS framework
  - Used for responsive design and styling
- **@tailwindcss/forms**: ^0.5.7
  - Form styling plugin for Tailwind CSS
- **autoprefixer**: ^10.4.16
  - PostCSS plugin for vendor prefixes
- **postcss**: ^8.4.32
  - CSS transformation tool

### Development Tools

- **typescript**: ^5.3.3
  - Static type checking
  - Enhanced development experience
- **vite**: ^5.0.10
  - Build tool and development server
- **@sveltejs/vite-plugin-svelte**: ^3.0.1
  - Vite plugin for Svelte integration

### Code Quality

- **eslint**: ^8.56.0
  - JavaScript/TypeScript linting
- **prettier**: ^3.1.1
  - Code formatting
- **svelte-check**: ^3.6.2
  - Type checking for Svelte files
- **husky**: ^8.0.3
  - Git hooks management
- **lint-staged**: ^15.2.0
  - Run linters on staged files

## Backend Dependencies

### Server Framework

- **express**: ^4.18.2
  - Web framework for Node.js
  - Handles HTTP requests and routing

### Database

- **mongodb**: ^6.3.0
  - MongoDB driver for Node.js
  - User data and settings storage

### API and Networking

- **node-fetch**: ^3.3.2
  - Fetch API for Node.js
  - Making HTTP requests to Plex and Tautulli
- **axios**: ^1.6.2
  - HTTP client for API requests
  - Advanced features like request/response interceptors
- **cors**: ^2.8.5
  - Cross-Origin Resource Sharing middleware
  - Secure API access

### Authentication

- **bcrypt**: ^5.1.1
  - Password hashing
  - Secure credential storage
- **jsonwebtoken**: ^9.0.2
  - JWT token generation and validation
  - User authentication

### Environment and Utilities

- **dotenv**: ^16.3.1
  - Environment variable management
  - Configuration loading
- **winston**: ^3.11.0
  - Logging framework
  - Error and request logging
- **morgan**: ^1.10.0
  - HTTP request logger middleware
  - API call tracking

## Development Dependencies

### TypeScript Support

- **@types/express**: ^4.17.21
- **@types/bcrypt**: ^5.0.2
- **@types/jsonwebtoken**: ^9.0.5
- **@types/cors**: ^2.8.17
- **@types/morgan**: ^1.9.9

### Code Quality Tools

- **@typescript-eslint/eslint-plugin**: ^6.16.0
- **@typescript-eslint/parser**: ^6.16.0
- **eslint-config-prettier**: ^9.1.0
- **eslint-plugin-svelte**: ^2.35.1
- **prettier-plugin-svelte**: ^3.1.2

### Import Management

- **import-sort-cli**: ^6.0.0
- **import-sort-parser-typescript**: ^6.0.0
- **import-sort-style-module**: ^6.0.0

## Version Management

All dependencies use Semantic Versioning (SemVer):

- Major version for breaking changes
- Minor version for new features
- Patch version for bug fixes

## Security Considerations

1. **Regular Updates**

   - Monitor for security vulnerabilities
   - Keep dependencies up to date
   - Use `pnpm audit` for security checks

2. **License Compliance**

   - All dependencies use compatible licenses
   - Main licenses used:
     - MIT
     - ISC
     - Apache-2.0

3. **Production Dependencies**
   - Minimize production dependencies
   - Use exact versions in production
   - Regular dependency audits

## Installation

```bash
# Install all dependencies
pnpm install

# Install only production dependencies
pnpm install --prod

# Update dependencies
pnpm update

# Security audit
pnpm audit
```

## Dependency Management

1. **Adding Dependencies**

   ```bash
   pnpm add package-name
   pnpm add -D package-name # dev dependency
   ```

2. **Updating Dependencies**

   ```bash
   pnpm update package-name
   pnpm update # all packages
   ```

3. **Removing Dependencies**
   ```bash
   pnpm remove package-name
   ```

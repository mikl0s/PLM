# Prompt for AI Coder: Plex Least Used Media Web App

## Objective:

Create a web application that connects to my local Plex server, fetches data from its database, and displays a list of the least-used media for each library.

## Features:

1. **Plex Server Connection:**
   - Connect to the local Plex server database.
   - Fetch data about media consumption (e.g., last watched date, play count).
2. **Library Selection:**
   - Display a list of all libraries on the Plex server (e.g., Movies, TV Shows, Music).
   - Allow users to select a library to view its least-used media.
3. **Media Analysis:**
   - Identify media with the least usage based on play count or last played date.
   - Sort media by customizable criteria (e.g., ascending by last played date).
4. **Customizable Time Frame:**
   - Enable users to set a threshold for "least used," e.g., media not played for 2+ years.
5. **Media Preview:**
   - Display media details, including title, poster, and metadata (e.g., release year).
6. **Export Options:**
   - Provide an option to export the least-used media list as a CSV, JSON, YAML, Markdown, or TXT file.
7. **Dashboard and Statistics:**
   - Use large card views for libraries, displaying metadata from Plex such as images to create a visually appealing interface.
   - Display statistics showing what percentage of each library is in use, measured at the show level for TV content (not episode level).
   - Highlight media that hasn't been watched, making it easy to identify unused content.
   - Include an admin feature to mark media as "archived," which will remove it from the statistics.
8. **Space Savings Estimation:**
   - Provide a feature to estimate potential space savings by converting H.264 content to H.265.
   - Store media information along with a hash of the file. If the hash exists, use the cached media information instead of reading it again.
9. **Recommendations and Removal Options:**
   - Provide recommendations for media to remove or transcode to save space, supporting library management and optimization.

## Technology Stack:

1. **Frontend:**
   - Framework: Svelte
   - Styling: Tailwind CSS
   - UI Components: Skeleton UI
   - Theme: Dark theme with dark purple accents, designed to be modern and sleek.
2. **Backend:**
   - Framework: Node.js
3. **Database:**
   - Use MongoDB for caching media information, storing file hashes, and persisting user data.
4. **Data Fetching and Caching:**
   - Use an API layer to fetch data from the Plex server and cache it locally in MongoDB.

## Authentication:

- Implement a simple local authentication system.
- On the first run, prompt the user to create an admin account with any username and password.
- Sanitize inputs but impose no restrictions on password strength.

## Deployment:

- The web app will run in a Docker container on an Ubuntu server with a minimalistic footprint.
- Security will rely solely on the secure login system.
- The project will be developed on Linux, using the latest versions of all tech stack components, with real-time checks for the newest releases.

## Integrations:

1. **Optional Tautulli Integration:**
   - Allow integration with Tautulli for enhanced analytics and additional statistics.

## Project Details:

- **Copyright:** Mikkel Georgsen / Dataløs
- **License:** AGPL
- **Node Package Management:** Prefer pnpm
- **Code Quality:**
  - Use import sorter, formatting, and linting in pre-commit hooks (in that specific order).

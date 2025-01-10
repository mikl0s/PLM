# PLM - Plex Library Manager 🎬

<div align="center">

![Plex](https://img.shields.io/badge/plex-yellow.svg?style=for-the-badge&logo=plex&logoColor=black)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg?style=for-the-badge)](https://github.com/yourusername/plm/releases)

</div>

<p align="center">
  <strong>🚀 A powerful media library management tool for Plex</strong>
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="PLM Screenshot" width="800">
</p>

<p align="center">
  Optimize storage, identify unused content, and manage multiple servers efficiently
</p>

## 📖 Project Overview

PLM was born from the challenges faced by Plex server administrators managing large media libraries across multiple servers. As media collections grow, so does the complexity of managing storage, tracking usage patterns, and ensuring optimal organization of content.

### Vision
Our vision is to create the most comprehensive and user-friendly tool for Plex server administrators, enabling them to make data-driven decisions about their media libraries while maximizing storage efficiency and content organization.

### Goals
- Provide deep insights into media usage patterns across multiple Plex servers
- Automate the identification and management of duplicate content
- Optimize storage usage through intelligent archiving recommendations
- Streamline the process of maintaining healthy, well-organized media libraries
- Create a unified interface for managing multiple Plex servers

PLM achieves these goals through a modern, intuitive interface built with cutting-edge web technologies. By leveraging the power of SvelteKit, MongoDB, and real-time analytics, PLM provides server administrators with the tools they need to maintain their media libraries effectively.

## ✨ Features

- 🌐 **Multi-Server Support**: Manage multiple Plex servers from a single dashboard
- 📊 **Usage Analytics**: Track viewing patterns and identify unused content
- 💾 **Storage Optimization**: Find and archive media content based on customizable criteria
- 🔄 **Media Deduplication**: Identify duplicate content across libraries and servers
- 🔒 **Secure Authentication**: JWT-based authentication with MongoDB user management
- 🎨 **Modern UI**: Beautiful, responsive interface built with SvelteKit and Tailwind CSS

## 🎯 System Overview

PLM is designed to help Plex server administrators manage their media libraries more effectively:

- 📈 **Library Analysis**: Get detailed insights into your media libraries, including usage patterns, storage consumption, and content age
- 🗄️ **Smart Archiving**: Identify and archive content based on customizable criteria like last viewed date, size, and quality
- 🔗 **Cross-Server Management**: Manage multiple Plex servers from a single interface with unified analytics
- ⚡ **Automated Maintenance**: Schedule regular scans and maintenance tasks to keep your libraries optimized
- 🔐 **Secure Access**: Role-based access control with secure authentication and API endpoints

### 🔍 Deduplication System

PLM uses a sophisticated approach to identify duplicate media content:

- 🎯 **Fingerprint Generation**: Creates unique fingerprints based on file properties
- 🔄 **Cross-Library Scanning**: Identifies duplicates across different libraries and servers
- ⭐ **Confidence Scoring**: Provides match confidence levels to help make informed decisions
- 🤖 **Automated Detection**: Runs in the background when new content is added

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plm.git
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## 📚 Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm check` - Type check

## 📖 Documentation

- [Frontend Documentation](docs/frontend.md)
- [Backend Documentation](docs/backend.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Plex](https://www.plex.tv/) for their amazing media server
- [SvelteKit](https://kit.svelte.dev/) for the awesome framework
- [Skeleton](https://skeleton.dev/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS

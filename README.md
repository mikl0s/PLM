# PLM - Plex Least Used Media 🎬

<div align="center">

![Plex](https://img.shields.io/badge/plex-yellow.svg?style=for-the-badge&logo=plex&logoColor=black)
![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg?style=for-the-badge)](https://github.com/yourusername/plm/releases)

</div>

<p align="center">
  <strong>🔍 Find and manage your least used media in Plex</strong>
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="PLM Screenshot" width="800">
</p>

## ✨ Features

- 📊 View detailed statistics about your Plex libraries
- 🔍 Find media that hasn't been watched in a long time
- 📦 Calculate potential space savings
- 🗑️ Archive unused media for later review
- 🎯 Smart filtering and sorting options
- 📱 Responsive design for all devices

## 🚀 Quick Start

1. Clone the repository

```bash
git clone https://github.com/yourusername/plm.git
cd plm
```

2. Install dependencies

```bash
pnpm install
```

3. Copy the example environment file

```bash
cp .env.example .env
```

4. Configure your environment variables (see [Configuration](#-configuration))

5. Start the development server

```bash
pnpm dev
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/plm

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Plex Configuration
PLEX_URL=http://localhost:32400
PLEX_TOKEN=your_plex_token
```

### 🔑 Getting Your Plex Token

1. Sign in to Plex Web App (app.plex.tv)
2. Open any media item that has a "Get Info" button
3. Click the "Get Info" button (ⓘ)
4. Click the "View XML" button
5. In the new window's URL, find `X-Plex-Token=`
6. Copy the token that appears after `X-Plex-Token=`

Alternatively, you can get your token programmatically:

1. Visit [plex.tv/sign-in](https://plex.tv/sign-in)
2. Sign in with your Plex account
3. Run this in the browser console:

```javascript
var clientId = 'PLM';
fetch('https://plex.tv/api/v2/users/signin', {
  method: 'POST',
  headers: {
    'X-Plex-Client-Identifier': clientId,
    'X-Plex-Product': 'PLM',
    'X-Plex-Version': '1.0.0',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    login: 'YOUR_PLEX_EMAIL',
    password: 'YOUR_PLEX_PASSWORD',
  }),
})
  .then((r) => r.json())
  .then((d) => console.log('Your token:', d.authToken));
```

## 🛠️ Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm check` - Type check

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 🙏 Acknowledgments

- [Plex](https://www.plex.tv/) for their amazing media server
- [SvelteKit](https://kit.svelte.dev/) for the awesome framework
- [Skeleton](https://skeleton.dev/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS

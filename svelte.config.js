import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
    },
    csrf: {
      checkOrigin: false, // Disable CSRF checks for development
    },
  },
  preprocess: vitePreprocess(),
};

export default config;

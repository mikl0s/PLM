<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { plex, isLoading } from '$lib/stores/plex';
  import type { Library } from '$lib/types/library';
  import type { PlexServer } from '$lib/types/plex';

  let servers: PlexServer[] = [];
  let libraries: { [serverId: string]: Library[] } = {};
  let error = '';

  async function loadServers() {
    try {
      const response = await fetch('/api/plex/servers');
      if (!response.ok) {
        throw new Error('Failed to load Plex servers');
      }
      servers = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load Plex servers';
    }
  }

  async function loadLibraries(server: PlexServer) {
    try {
      await plex.initialize(server);

      // Get all libraries
      const response = await fetch(`${server.url}/library/sections`, {
        headers: {
          'X-Plex-Token': server.token,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch libraries');
      }

      const data = await response.json();
      const libraryIds = data.MediaContainer.Directory.map((dir: any) => dir.key);

      // Get details for each library
      const libraryDetails = await Promise.all(
        libraryIds.map((id: string) => plex.getLibrary(server.id, id))
      );

      libraries[server.id] = libraryDetails.filter((lib): lib is Library => lib !== undefined);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load libraries';
    }
  }

  onMount(async () => {
    await loadServers();
    await Promise.all(servers.map(loadLibraries));
  });
</script>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary-500">Dashboard</h1>
    <p class="mt-2 text-surface-400">View and manage your Plex libraries</p>
  </div>

  {#if error}
    <div class="mb-8 rounded-md bg-error-900 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-error-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-error-500">{error}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if $isLoading}
    <div class="flex items-center justify-center py-12">
      <svg
        class="h-8 w-8 animate-spin text-primary-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  {:else if servers.length === 0}
    <div class="rounded-lg bg-surface-800 p-8 text-center">
      <svg
        class="mx-auto h-12 w-12 text-surface-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-surface-200">No Plex servers found</h3>
      <p class="mt-1 text-sm text-surface-400">Add a Plex server to get started.</p>
      <div class="mt-6">
        <a
          href="/settings"
          class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Configure Settings
        </a>
      </div>
    </div>
  {:else}
    {#each servers as server}
      <div class="mb-8">
        <h2 class="mb-4 text-2xl font-bold text-surface-200">{server.name}</h2>
        {#if libraries[server.id]?.length > 0}
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each libraries[server.id] as library}
              <a
                href="/library/{server.id}/{library.id}"
                class="group relative block rounded-lg bg-surface-800 p-6 hover:bg-surface-700"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-surface-200">{library.name}</h3>
                  <span
                    class="inline-flex items-center rounded-full bg-surface-700 px-2.5 py-0.5 text-xs font-medium text-surface-200"
                  >
                    {library.type}
                  </span>
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400">Total Items</span>
                    <span class="font-medium text-surface-200">{library.totalItems}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400">Unused Items</span>
                    <span class="font-medium text-surface-200">{library.unusedItems}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400">Total Size</span>
                    <span class="font-medium text-surface-200">
                      {(library.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400">Unused Size</span>
                    <span class="font-medium text-surface-200">
                      {(library.unusedSize / 1024 / 1024 / 1024).toFixed(2)} GB
                    </span>
                  </div>
                </div>

                <div class="mt-4">
                  <div class="relative h-2 rounded-full bg-surface-700">
                    <div
                      class="absolute inset-y-0 left-0 rounded-full bg-primary-500"
                      style="width: {(library.unusedItems / library.totalItems) * 100}%"
                    />
                  </div>
                  <p class="mt-2 text-xs text-surface-400">
                    {((library.unusedItems / library.totalItems) * 100).toFixed(1)}% unused
                  </p>
                </div>
              </a>
            {/each}
          </div>
        {:else}
          <p class="text-surface-400">No libraries found for this server.</p>
        {/if}
      </div>
    {/each}
  {/if}
</div>

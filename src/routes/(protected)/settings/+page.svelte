<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PlexServer } from '$lib/types/plex';
  import { plex } from '$lib/stores/plex';

  let plexServers: PlexServer[] = [];
  let isLoading = false;
  let error = '';
  let success = '';

  // Form fields
  let plexUsername = '';
  let plexPassword = '';
  let serverName = '';
  let serverUrl = '';

  async function loadPlexServers() {
    try {
      const response = await fetch('/api/plex/servers');
      if (!response.ok) {
        throw new Error('Failed to load Plex servers');
      }
      plexServers = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load Plex servers';
    }
  }

  async function handleSubmit() {
    error = '';
    success = '';
    isLoading = true;

    try {
      // Get Plex token
      const tokenResponse = await fetch('/api/plex/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: plexUsername,
          password: plexPassword
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to authenticate with Plex');
      }

      const { token } = await tokenResponse.json();

      // Add server
      const serverResponse = await fetch('/api/plex/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: serverName,
          url: serverUrl,
          token
        })
      });

      if (!serverResponse.ok) {
        throw new Error('Failed to add Plex server');
      }

      const server = await serverResponse.json();
      plexServers = [...plexServers, server];
      success = 'Plex server added successfully';

      // Clear form
      plexUsername = '';
      plexPassword = '';
      serverName = '';
      serverUrl = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add Plex server';
    } finally {
      isLoading = false;
    }
  }

  async function handleDelete(serverId: string) {
    if (!confirm('Are you sure you want to remove this Plex server?')) {
      return;
    }

    try {
      const response = await fetch(`/api/plex/servers/${serverId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove Plex server');
      }

      plexServers = plexServers.filter(server => server.id !== serverId);
      success = 'Plex server removed successfully';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove Plex server';
    }
  }

  onMount(loadPlexServers);
</script>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary-500">Settings</h1>
    <p class="mt-2 text-surface-400">Configure your Plex servers</p>
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

  {#if success}
    <div class="mb-8 rounded-md bg-success-900 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-success-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-success-500">{success}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="mb-8 rounded-lg bg-surface-800 p-6">
    <h2 class="text-xl font-semibold text-surface-200">Add Plex Server</h2>
    <form class="mt-4 space-y-4" on:submit|preventDefault={handleSubmit}>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="plexUsername" class="block text-sm font-medium text-surface-200">
            Plex Username
          </label>
          <input
            type="text"
            id="plexUsername"
            bind:value={plexUsername}
            required
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label for="plexPassword" class="block text-sm font-medium text-surface-200">
            Plex Password
          </label>
          <input
            type="password"
            id="plexPassword"
            bind:value={plexPassword}
            required
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label for="serverName" class="block text-sm font-medium text-surface-200">
            Server Name
          </label>
          <input
            type="text"
            id="serverName"
            bind:value={serverName}
            required
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label for="serverUrl" class="block text-sm font-medium text-surface-200">
            Server URL
          </label>
          <input
            type="url"
            id="serverUrl"
            bind:value={serverUrl}
            required
            placeholder="http://localhost:32400"
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="inline-flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
        >
          {#if isLoading}
            <svg
              class="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding...
          {:else}
            Add Server
          {/if}
        </button>
      </div>
    </form>
  </div>

  <div class="rounded-lg bg-surface-800 p-6">
    <h2 class="text-xl font-semibold text-surface-200">Configured Servers</h2>
    {#if plexServers.length === 0}
      <p class="mt-4 text-surface-400">No Plex servers configured yet.</p>
    {:else}
      <div class="mt-4 space-y-4">
        {#each plexServers as server}
          <div class="flex items-center justify-between rounded-lg bg-surface-700 p-4">
            <div>
              <h3 class="font-medium text-surface-200">{server.name}</h3>
              <p class="text-sm text-surface-400">{server.url}</p>
            </div>
            <button
              type="button"
              on:click={() => handleDelete(server.id)}
              class="rounded bg-error-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-error-500 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

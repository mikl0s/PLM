<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { plex, isLoading } from '$lib/stores/plex';
  import { archive } from '$lib/stores/archive';
  import type { Library, MediaItem } from '$lib/types/library';
  import type { PlexServer } from '$lib/types/plex';
  import AnalyzeModal from '$lib/components/AnalyzeModal.svelte';

  let server: PlexServer | null = null;
  let library: Library | null = null;
  let items: MediaItem[] = [];
  let error = '';

  // Filters
  let search = '';
  let threshold = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
  let sortBy = 'lastViewedAt';
  let sortOrder: 'asc' | 'desc' = 'asc';

  // Modal
  let selectedItem: MediaItem | null = null;

  async function loadServer() {
    try {
      const response = await fetch(`/api/plex/servers/${$page.params.serverId}`);
      if (!response.ok) {
        throw new Error('Failed to load server');
      }
      server = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load server';
    }
  }

  async function loadLibrary() {
    if (!server) return;

    try {
      await plex.initialize(server);
      const result = await plex.getLibrary(server.id, $page.params.libraryId);
      if (!result) {
        throw new Error('Library not found');
      }
      library = result;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load library';
    }
  }

  async function loadItems() {
    if (!server || !library) return;

    try {
      items = await plex.getUnusedItems(server.id, library.id, {
        threshold,
        sortBy,
        sortOrder,
        search
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load items';
    }
  }

  function handleArchive(item: MediaItem) {
    if (!library) return;
    archive.archive(library.id, item.id, item.title);
  }

  function handleUnarchive(item: MediaItem) {
    archive.unarchive(item.id);
  }

  function handleAnalyze(item: MediaItem) {
    selectedItem = item;
  }

  function closeModal() {
    selectedItem = null;
  }

  $: {
    if (server && library) {
      loadItems();
    }
  }

  onMount(async () => {
    await loadServer();
    await loadLibrary();
  });
</script>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
  {:else if library}
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-primary-500">{library.name}</h1>
          <p class="mt-2 text-surface-400">
            {library.unusedItems} unused items ({((library.unusedItems / library.totalItems) * 100).toFixed(1)}%)
          </p>
        </div>
        <div class="flex space-x-4">
          <select
            bind:value={threshold}
            class="rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value={30 * 24 * 60 * 60 * 1000}>30 days</option>
            <option value={90 * 24 * 60 * 60 * 1000}>90 days</option>
            <option value={180 * 24 * 60 * 60 * 1000}>180 days</option>
            <option value={365 * 24 * 60 * 60 * 1000}>1 year</option>
          </select>
          <select
            bind:value={sortBy}
            class="rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="lastViewedAt">Last Viewed</option>
            <option value="addedAt">Added Date</option>
            <option value="title">Title</option>
            <option value="size">Size</option>
          </select>
          <select
            bind:value={sortOrder}
            class="rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      <div class="mt-4">
        <input
          type="text"
          bind:value={search}
          class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Search by title..."
        />
      </div>
    </div>

    <div class="overflow-hidden rounded-lg bg-surface-800 shadow">
      <table class="min-w-full divide-y divide-surface-700">
        <thead class="bg-surface-900">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400"
            >
              Title
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400"
            >
              Added
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400"
            >
              Last Viewed
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400"
            >
              Size
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-400"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-700 bg-surface-800">
          {#each items as item}
            <tr>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-surface-200">{item.title}</div>
                    <div class="text-sm text-surface-400">
                      {item.year} • {item.codec} • {item.resolution}
                    </div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                {new Date(item.addedAt).toLocaleDateString()}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                {item.lastViewedAt
                  ? new Date(item.lastViewedAt).toLocaleDateString()
                  : 'Never'}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                {(item.size / 1024 / 1024 / 1024).toFixed(2)} GB
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                <div class="flex space-x-2">
                  {#if $archive.some((a) => a.id === item.id)}
                    <button
                      class="rounded bg-surface-600 px-2 py-1 text-xs font-medium text-white hover:bg-surface-500"
                      on:click={() => handleUnarchive(item)}
                    >
                      Unarchive
                    </button>
                  {:else}
                    <button
                      class="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-500"
                      on:click={() => handleArchive(item)}
                    >
                      Archive
                    </button>
                  {/if}
                  <button
                    class="rounded bg-surface-600 px-2 py-1 text-xs font-medium text-white hover:bg-surface-500"
                    on:click={() => handleAnalyze(item)}
                  >
                    Analyze
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if selectedItem}
  <AnalyzeModal item={selectedItem} onClose={closeModal} />
{/if} 
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { plex, isLoading } from '$lib/stores/plex';
  import { archive } from '$lib/stores/archive';
  import AnalyzeModal from '$lib/components/AnalyzeModal.svelte';
  import type { Library, MediaItem } from '$lib/types/library';

  let library: Library | undefined;
  let items: MediaItem[] = [];
  let error = '';
  let threshold = 365;
  let sortBy = 'lastViewedAt';
  let sortOrder: 'asc' | 'desc' = 'asc';
  let search = '';
  let showArchived = false;
  let analyzingItem: MediaItem | null = null;

  onMount(async () => {
    if (!localStorage.getItem('plex_url') || !localStorage.getItem('plex_token')) {
      goto('/settings');
      return;
    }

    try {
      await plex.initialize(
        localStorage.getItem('plex_url') || '',
        localStorage.getItem('plex_token') || ''
      );
      library = await plex.getLibrary($page.params.id);
      if (!library) {
        error = 'Library not found';
        return;
      }
      await loadItems();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load library';
    }
  });

  async function loadItems() {
    try {
      const allItems = await plex.getUnusedItems($page.params.id, {
        threshold: threshold * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        sortBy,
        sortOrder,
        search,
      });

      // Filter items based on archive status
      items = allItems.filter((item: MediaItem) => {
        const isItemArchived = $archive.some((a: { id: string }) => a.id === item.id);
        return showArchived ? true : !isItemArchived;
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load items';
    }
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  }

  function formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  function formatSize(bytes: number): string {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  function exportData() {
    if (!items.length) return;

    // Create CSV content
    const headers = ['Title', 'Year', 'Added', 'Last Viewed', 'Duration', 'Size', 'Resolution', 'Codec'];
    const rows = items.map(item => [
      item.title,
      item.year || '',
      formatDate(item.addedAt),
      formatDate(item.lastViewedAt),
      formatDuration(item.duration),
      formatSize(item.size),
      item.resolution || 'Unknown',
      item.codec || 'Unknown'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${library?.name}_unused_items.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  $: {
    if (library) {
      loadItems();
    }
  }
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
            {library.unusedItems} unused items ({formatSize(library.unusedSize)})
          </p>
        </div>
        <button
          class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          on:click={exportData}
        >
          Export Data
        </button>
      </div>
    </div>

    <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg bg-surface-800 p-4">
        <label for="threshold" class="block text-sm font-medium text-surface-200">
          Time Threshold
        </label>
        <select
          id="threshold"
          bind:value={threshold}
          class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>1 year</option>
          <option value={730}>2 years</option>
        </select>
      </div>

      <div class="rounded-lg bg-surface-800 p-4">
        <label for="sortBy" class="block text-sm font-medium text-surface-200"> Sort By </label>
        <select
          id="sortBy"
          bind:value={sortBy}
          class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="lastViewedAt">Last Viewed</option>
          <option value="addedAt">Date Added</option>
          <option value="title">Title</option>
          <option value="size">Size</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      <div class="rounded-lg bg-surface-800 p-4">
        <label for="sortOrder" class="block text-sm font-medium text-surface-200">
          Sort Order
        </label>
        <select
          id="sortOrder"
          bind:value={sortOrder}
          class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div class="rounded-lg bg-surface-800 p-4">
        <label for="search" class="block text-sm font-medium text-surface-200"> Search </label>
        <input
          id="search"
          type="text"
          bind:value={search}
          class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Search by title..."
        />
      </div>

      <div class="rounded-lg bg-surface-800 p-4">
        <label class="block text-sm font-medium text-surface-200">
          Show Archived
        </label>
        <div class="mt-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              bind:checked={showArchived}
              class="h-4 w-4 rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-surface-300">Include archived items</span>
          </label>
        </div>
      </div>
    </div>

    {#if items.length === 0}
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
        <h3 class="mt-2 text-sm font-medium text-surface-200">No unused items found</h3>
        <p class="mt-1 text-sm text-surface-400">
          Try adjusting your filters to find unused items.
        </p>
      </div>
    {:else}
      <div class="overflow-hidden rounded-lg bg-surface-800 shadow">
        <table class="min-w-full divide-y divide-surface-700">
          <thead>
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
                Duration
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
          <tbody class="divide-y divide-surface-700">
            {#each items as item}
              <tr class="hover:bg-surface-700">
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-surface-100">{item.title}</div>
                      {#if item.year}
                        <div class="text-sm text-surface-400">({item.year})</div>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                  {formatDate(item.addedAt)}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                  {formatDate(item.lastViewedAt)}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                  {formatDuration(item.duration)}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                  {formatSize(item.size)}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-surface-300">
                  <div class="flex space-x-2">
                    {#if $archive.some((a: { id: string }) => a.id === item.id)}
                      <button
                        class="rounded bg-surface-600 px-2 py-1 text-xs font-medium text-white hover:bg-surface-500"
                        on:click={() => archive.unarchive(item.id)}
                      >
                        Unarchive
                      </button>
                    {:else}
                      <button
                        class="rounded bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-500"
                        on:click={() => archive.archive($page.params.id, item.id, item.title)}
                      >
                        Archive
                      </button>
                    {/if}
                    <button
                      class="rounded bg-surface-600 px-2 py-1 text-xs font-medium text-white hover:bg-surface-500"
                      on:click={() => {
                        analyzingItem = item;
                      }}
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
  {/if}
</div>

{#if analyzingItem}
  <AnalyzeModal
    item={analyzingItem}
    onClose={() => {
      analyzingItem = null;
    }}
  />
{/if}

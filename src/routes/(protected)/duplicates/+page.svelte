<script lang="ts">
  import { onMount } from 'svelte';
  import type { DuplicateMatchWithDetails } from '$lib/types/fingerprint';

  let duplicates: DuplicateMatchWithDetails[] = [];
  let isLoading = false;
  let error = '';

  async function loadDuplicates() {
    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/duplicates');
      if (!response.ok) {
        throw new Error('Failed to load duplicates');
      }
      duplicates = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load duplicates';
    } finally {
      isLoading = false;
    }
  }

  async function handleAction(matchId: string, action: 'confirm' | 'reject') {
    try {
      const response = await fetch(`/api/duplicates/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action === 'confirm' ? 'confirmed' : 'rejected' })
      });

      if (!response.ok) {
        throw new Error('Failed to update duplicate status');
      }

      // Refresh duplicates
      await loadDuplicates();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update duplicate status';
    }
  }

  onMount(loadDuplicates);
</script>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary-500">Duplicate Media</h1>
    <p class="mt-2 text-surface-400">Review and manage potential duplicate content</p>
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

  {#if isLoading}
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
  {:else if duplicates.length === 0}
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
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-surface-200">No duplicates found</h3>
      <p class="mt-1 text-sm text-surface-400">All your media content appears to be unique.</p>
    </div>
  {:else}
    <div class="space-y-6">
      {#each duplicates as match}
        <div class="overflow-hidden rounded-lg bg-surface-800 shadow">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-medium text-surface-200">
                  Potential Duplicate ({match.confidence}% match)
                </div>
                <div class="mt-1 text-sm text-surface-400">
                  Found in {match.sourceMedia.server} and {match.matchedMedia.server}
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  class="rounded bg-success-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-success-500"
                  on:click={() => handleAction(match.id, 'confirm')}
                >
                  Confirm
                </button>
                <button
                  class="rounded bg-error-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-error-500"
                  on:click={() => handleAction(match.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 divide-x divide-surface-700">
            <div class="px-6 py-4">
              <h4 class="text-sm font-medium text-surface-200">Source Media</h4>
              <dl class="mt-2 space-y-1">
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Title</dt>
                  <dd class="text-sm text-surface-200">{match.sourceMedia.title}</dd>
                </div>
                {#if match.sourceMedia.year}
                  <div class="flex justify-between">
                    <dt class="text-sm text-surface-400">Year</dt>
                    <dd class="text-sm text-surface-200">{match.sourceMedia.year}</dd>
                  </div>
                {/if}
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Resolution</dt>
                  <dd class="text-sm text-surface-200">{match.sourceMedia.resolution}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Size</dt>
                  <dd class="text-sm text-surface-200">
                    {(match.sourceMedia.size / 1024 / 1024 / 1024).toFixed(2)} GB
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Location</dt>
                  <dd class="text-sm text-surface-200">
                    {match.sourceMedia.server} / {match.sourceMedia.library}
                  </dd>
                </div>
              </dl>
            </div>
            <div class="px-6 py-4">
              <h4 class="text-sm font-medium text-surface-200">Matched Media</h4>
              <dl class="mt-2 space-y-1">
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Title</dt>
                  <dd class="text-sm text-surface-200">{match.matchedMedia.title}</dd>
                </div>
                {#if match.matchedMedia.year}
                  <div class="flex justify-between">
                    <dt class="text-sm text-surface-400">Year</dt>
                    <dd class="text-sm text-surface-200">{match.matchedMedia.year}</dd>
                  </div>
                {/if}
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Resolution</dt>
                  <dd class="text-sm text-surface-200">{match.matchedMedia.resolution}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Size</dt>
                  <dd class="text-sm text-surface-200">
                    {(match.matchedMedia.size / 1024 / 1024 / 1024).toFixed(2)} GB
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-sm text-surface-400">Location</dt>
                  <dd class="text-sm text-surface-200">
                    {match.matchedMedia.server} / {match.matchedMedia.library}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div> 
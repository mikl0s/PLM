<script lang="ts">
  import type { MediaItem } from '$lib/types/library';

  export let item: MediaItem;
  export let onClose: () => void;

  let h265Size = 0;
  let savings = 0;
  let isLoading = true;

  function calculateH265Size() {
    // Rough estimate: H.265 typically achieves 50% reduction in file size
    // This is a simplified calculation - in reality, it would depend on many factors
    h265Size = item.size * 0.5;
    savings = item.size - h265Size;
    isLoading = false;
  }

  // Calculate on mount
  calculateH265Size();

  function formatSize(bytes: number): string {
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  }
</script>

<div
  class="fixed inset-0 z-50 overflow-y-auto"
  aria-labelledby="modal-title"
  role="dialog"
  aria-modal="true"
>
  <div
    class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0"
  >
    <div
      class="fixed inset-0 bg-surface-900 bg-opacity-75 transition-opacity"
      aria-hidden="true"
      on:click={onClose}
    ></div>

    <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true"
      >&#8203;</span
    >

    <div
      class="inline-block transform overflow-hidden rounded-lg bg-surface-800 px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
    >
      <div>
        <div class="mt-3 text-center sm:mt-5">
          <h3 class="text-lg font-medium leading-6 text-surface-100" id="modal-title">
            Space Analysis: {item.title}
          </h3>
          <div class="mt-2">
            {#if isLoading}
              <div class="flex items-center justify-center py-4">
                <svg
                  class="h-8 w-8 animate-spin text-primary-500"
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
              </div>
            {:else}
              <div class="space-y-4 py-4">
                <div class="rounded-lg bg-surface-700 p-4">
                  <div class="text-sm text-surface-300">Current Size ({item.codec})</div>
                  <div class="text-lg font-medium text-surface-100">{formatSize(item.size)}</div>
                </div>
                <div class="rounded-lg bg-surface-700 p-4">
                  <div class="text-sm text-surface-300">Estimated H.265 Size</div>
                  <div class="text-lg font-medium text-surface-100">{formatSize(h265Size)}</div>
                </div>
                <div class="rounded-lg bg-primary-900/50 p-4">
                  <div class="text-sm text-primary-300">Potential Space Savings</div>
                  <div class="text-lg font-medium text-primary-100">{formatSize(savings)}</div>
                </div>
                {#if item.codec !== 'h265'}
                  <p class="text-sm text-surface-400">
                    Note: This is an estimate. Actual savings may vary based on content type and
                    encoding settings.
                  </p>
                {:else}
                  <p class="text-sm text-surface-400">
                    This file is already using H.265 codec. No additional space savings available
                    through re-encoding.
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-6">
        <button
          type="button"
          class="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
          on:click={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div>

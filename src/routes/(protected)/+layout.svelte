<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated } from '$lib/stores/auth';

  onMount(async () => {
    await auth.initialize();
    if (!$isAuthenticated) {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen bg-surface-900">
  <nav class="border-b border-surface-700 bg-surface-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <a href="/" class="text-xl font-bold text-primary-500">PLM</a>
          </div>
          <div class="ml-6 flex items-center space-x-4">
            <a
              href="/"
              class="rounded-md px-3 py-2 text-sm font-medium text-surface-200 hover:bg-surface-700 hover:text-white"
            >
              Dashboard
            </a>
            <a
              href="/settings"
              class="rounded-md px-3 py-2 text-sm font-medium text-surface-200 hover:bg-surface-700 hover:text-white"
            >
              Settings
            </a>
          </div>
        </div>
        <div class="flex items-center">
          <button
            type="button"
            on:click={() => auth.logout()}
            class="rounded-md px-3 py-2 text-sm font-medium text-surface-200 hover:bg-surface-700 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>

  <main>
    <slot />
  </main>
</div>

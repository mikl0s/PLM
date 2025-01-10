<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  let username = '';
  let password = '';
  let error = '';

  async function handleSubmit() {
    error = '';
    if (!username || !password) {
      error = 'Please enter both username and password';
      return;
    }

    try {
      await auth.login(username, password);
      goto('/');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Login failed';
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-900">
  <div class="w-full max-w-md space-y-8 rounded-lg bg-surface-800 p-8 shadow-lg">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-primary-500">Plex Least Used Media</h2>
      <p class="mt-2 text-surface-400">Sign in to your account</p>
    </div>

    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-surface-200">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-surface-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="mt-1 block w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-surface-100 placeholder-surface-500 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {#if error}
        <div class="rounded-md bg-error-900 p-4">
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

      <div>
        <button
          type="submit"
          disabled={$isLoading}
          class="flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {#if $isLoading}
            <svg
              class="mr-2 h-5 w-5 animate-spin text-white"
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
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, isAuthenticated } from '$lib/stores/auth';

  onMount(async () => {
    await auth.initialize();
    if ($isAuthenticated) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <h1 class="text-3xl font-bold text-primary-500">PLM</h1>
    <p class="mt-2 text-surface-400">Redirecting...</p>
  </div>
</div>

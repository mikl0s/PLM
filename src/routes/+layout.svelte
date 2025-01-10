<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-modern.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import '../app.postcss';
  import { AppShell, AppBar } from '@skeletonlabs/skeleton';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <strong class="text-xl uppercase">PLM</strong>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <!-- Add navigation items here -->
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <!-- Main content -->
  <div class="container mx-auto p-4">
    <slot />
  </div>
</AppShell>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.900);
    color: theme(colors.gray.50);
  }
</style>

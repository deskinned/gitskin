<script lang="ts">
  //! Extension popup root component
  import ThemePicker from './ThemePicker.svelte';
  import Settings from './Settings.svelte';

  let view = $state<'themes' | 'settings'>('themes');
</script>

<main class="gitskin-popup">
  <header class="popup-header">
    <h1>GitSkin</h1>
    <nav class="popup-nav">
      <button
        class="nav-btn"
        class:active={view === 'themes'}
        onclick={() => (view = 'themes')}
      >
        Themes
      </button>
      <button
        class="nav-btn"
        class:active={view === 'settings'}
        onclick={() => (view = 'settings')}
      >
        Settings
      </button>
    </nav>
  </header>

  {#if view === 'themes'}
    <ThemePicker />
  {:else}
    <Settings />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 13px;
    color: #c9d1d9;
    background: #0d1117;
  }

  .gitskin-popup {
    width: 340px;
    min-height: 200px;
  }

  .popup-header {
    padding: 12px 16px 0;
    border-bottom: 1px solid #30363d;
  }

  .popup-header h1 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #f0f6fc;
  }

  .popup-nav {
    display: flex;
    gap: 0;
  }

  .nav-btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    color: #8b949e;
    font-size: 13px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .nav-btn:hover {
    color: #c9d1d9;
  }

  .nav-btn.active {
    color: #f0f6fc;
    border-bottom-color: #f78166;
  }
</style>

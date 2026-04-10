<script lang="ts">
  //! Grid of installed themes — tap to activate/deactivate
  import type { CatalogEntry } from '@shared/types';
  import { MessageType, sendMessage } from '@shared/messages';
  import type { ActiveThemeResponse, CatalogResponse } from '@shared/messages';
  import ThemeCard from './ThemeCard.svelte';

  let catalogThemes = $state<CatalogEntry[]>([]);
  let activeThemeId = $state<string | null>(null);
  let installedIds = $state<string[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function load() {
    loading = true;
    error = null;
    try {
      const [activeRes, catalogRes, installedRes] = await Promise.all([
        sendMessage<ActiveThemeResponse>({ type: MessageType.GET_ACTIVE_THEME }),
        sendMessage<CatalogResponse>({ type: MessageType.GET_CATALOG }),
        sendMessage<string[]>({ type: MessageType.GET_INSTALLED_THEMES }),
      ]);

      if (activeRes.success && activeRes.data) {
        activeThemeId = activeRes.data.theme?.meta.id ?? activeRes.data.theme?.meta.name ?? null;
      }
      if (catalogRes.success && catalogRes.data) {
        catalogThemes = catalogRes.data.catalog.themes;
      }
      if (installedRes.success && installedRes.data) {
        installedIds = installedRes.data;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load themes';
    } finally {
      loading = false;
    }
  }

  async function activate(id: string) {
    activeThemeId = id;
    await sendMessage({ type: MessageType.SET_ACTIVE_THEME, themeId: id });
  }

  async function deactivate() {
    activeThemeId = null;
    await sendMessage({ type: MessageType.CLEAR_THEME });
  }

  async function install(id: string) {
    await sendMessage({ type: MessageType.EXTERNAL_INSTALL_THEME, themeId: id });
    activeThemeId = id;
    if (!installedIds.includes(id)) {
      installedIds = [...installedIds, id];
    }
  }

  $effect(() => {
    load();
  });
</script>

<div class="theme-picker">
  {#if loading}
    <div class="status">Loading themes...</div>
  {:else if error}
    <div class="status error">{error}</div>
  {:else}
    {#if installedIds.length > 0}
      <section class="section">
        <h3 class="section-title">Installed</h3>
        <div class="theme-grid">
          {#each catalogThemes.filter(t => installedIds.includes(t.id)) as theme (theme.id)}
            <ThemeCard
              {theme}
              active={activeThemeId === theme.id}
              installed={true}
              onactivate={() => activate(theme.id)}
              ondeactivate={() => deactivate()}
            />
          {/each}
          {#each installedIds.filter(id => !catalogThemes.some(t => t.id === id)) as id (id)}
            <ThemeCard
              theme={{ id, name: id, author: 'local', version: '0', description: '', tags: [], level: 0 }}
              active={activeThemeId === id}
              installed={true}
              onactivate={() => activate(id)}
              ondeactivate={() => deactivate()}
            />
          {/each}
        </div>
      </section>
    {/if}

    {#if catalogThemes.filter(t => !installedIds.includes(t.id)).length > 0}
      <section class="section">
        <h3 class="section-title">Available</h3>
        <div class="theme-grid">
          {#each catalogThemes.filter(t => !installedIds.includes(t.id)) as theme (theme.id)}
            <ThemeCard
              {theme}
              active={false}
              installed={false}
              oninstall={() => install(theme.id)}
            />
          {/each}
        </div>
      </section>
    {/if}

    {#if catalogThemes.length === 0 && installedIds.length === 0}
      <div class="status">No themes available. Visit <strong>gitsk.in</strong> to browse themes.</div>
    {/if}
  {/if}
</div>

<style>
  .theme-picker {
    padding: 12px 16px;
  }

  .status {
    padding: 24px 0;
    text-align: center;
    color: #8b949e;
  }

  .status.error {
    color: #f85149;
  }

  .section {
    margin-bottom: 16px;
  }

  .section-title {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8b949e;
  }

  .theme-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>

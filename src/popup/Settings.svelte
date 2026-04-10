<script lang="ts">
  //! Extension settings — cache clear, adapter refresh
  import { MessageType, sendMessage } from '@shared/messages';

  let refreshing = $state(false);
  let clearing = $state(false);
  let statusMessage = $state<string | null>(null);

  async function refreshAdapters() {
    refreshing = true;
    statusMessage = null;
    try {
      await sendMessage({ type: MessageType.REFRESH_ADAPTERS });
      statusMessage = 'Adapters updated';
    } catch {
      statusMessage = 'Refresh failed';
    } finally {
      refreshing = false;
    }
  }

  async function clearCache() {
    clearing = true;
    statusMessage = null;
    try {
      await chrome.storage.local.clear();
      statusMessage = 'Cache cleared — reload GitHub tabs';
    } catch {
      statusMessage = 'Clear failed';
    } finally {
      clearing = false;
    }
  }
</script>

<div class="settings">
  <section class="section">
    <h3 class="section-title">Adapters</h3>
    <p class="section-desc">
      Adapters map theme tokens to GitHub's DOM. They update automatically every 2 hours.
    </p>
    <button class="btn" disabled={refreshing} onclick={refreshAdapters}>
      {refreshing ? 'Refreshing...' : 'Refresh Now'}
    </button>
  </section>

  <section class="section">
    <h3 class="section-title">Cache</h3>
    <p class="section-desc">
      Clears all cached themes, adapters, and settings. You'll need to reinstall themes.
    </p>
    <button class="btn btn-danger" disabled={clearing} onclick={clearCache}>
      {clearing ? 'Clearing...' : 'Clear All Data'}
    </button>
  </section>

  {#if statusMessage}
    <div class="status-msg">{statusMessage}</div>
  {/if}

  <footer class="settings-footer">
    <a href="https://gitsk.in" target="_blank" rel="noopener">gitsk.in</a>
    <span class="version">v0.0.1</span>
  </footer>
</div>

<style>
  .settings {
    padding: 12px 16px;
  }

  .section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #21262d;
  }

  .section-title {
    margin: 0 0 4px;
    font-size: 13px;
    font-weight: 600;
    color: #f0f6fc;
  }

  .section-desc {
    margin: 0 0 8px;
    font-size: 12px;
    color: #8b949e;
    line-height: 1.4;
  }

  .btn {
    padding: 5px 14px;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: #21262d;
    color: #c9d1d9;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .btn:hover:not(:disabled) {
    background: #30363d;
    border-color: #484f58;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-danger {
    border-color: #f85149;
    color: #f85149;
  }

  .btn-danger:hover:not(:disabled) {
    background: #da3633;
    color: #fff;
    border-color: #da3633;
  }

  .status-msg {
    padding: 8px 12px;
    border-radius: 6px;
    background: #161b22;
    border: 1px solid #30363d;
    font-size: 12px;
    color: #8b949e;
    text-align: center;
    margin-bottom: 16px;
  }

  .settings-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    font-size: 11px;
    color: #484f58;
  }

  .settings-footer a {
    color: #58a6ff;
    text-decoration: none;
  }

  .settings-footer a:hover {
    text-decoration: underline;
  }

  .version {
    color: #484f58;
  }
</style>

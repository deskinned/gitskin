<script lang="ts">
  //! Individual theme card with activate/install button
  import type { CatalogEntry } from '@shared/types';

  interface Props {
    theme: CatalogEntry;
    active: boolean;
    installed: boolean;
    onactivate?: () => void;
    ondeactivate?: () => void;
    oninstall?: () => void;
  }

  let { theme, active, installed, onactivate, ondeactivate, oninstall }: Props = $props();
</script>

<div class="card" class:active>
  <div class="card-info">
    <div class="card-name">{theme.name}</div>
    <div class="card-meta">
      {theme.author}
      {#if theme.level > 0}
        <span class="level-badge">L{theme.level}</span>
      {/if}
    </div>
    {#if theme.description}
      <div class="card-desc">{theme.description}</div>
    {/if}
  </div>
  <div class="card-actions">
    {#if installed}
      {#if active}
        <button class="btn btn-active" onclick={ondeactivate}>Active</button>
      {:else}
        <button class="btn btn-activate" onclick={onactivate}>Activate</button>
      {/if}
    {:else}
      <button class="btn btn-install" onclick={oninstall}>Install</button>
    {/if}
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #30363d;
    background: #161b22;
    transition: border-color 0.15s;
  }

  .card:hover {
    border-color: #484f58;
  }

  .card.active {
    border-color: #f78166;
  }

  .card-info {
    flex: 1;
    min-width: 0;
    margin-right: 12px;
  }

  .card-name {
    font-size: 13px;
    font-weight: 600;
    color: #f0f6fc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-meta {
    font-size: 11px;
    color: #8b949e;
    margin-top: 2px;
  }

  .level-badge {
    display: inline-block;
    padding: 0 4px;
    margin-left: 4px;
    border-radius: 3px;
    background: #30363d;
    font-size: 10px;
    font-weight: 600;
  }

  .card-desc {
    font-size: 11px;
    color: #8b949e;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-actions {
    flex-shrink: 0;
  }

  .btn {
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #30363d;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .btn-activate {
    background: #21262d;
    color: #c9d1d9;
  }

  .btn-activate:hover {
    background: #30363d;
    border-color: #484f58;
  }

  .btn-active {
    background: #f78166;
    border-color: #f78166;
    color: #0d1117;
  }

  .btn-active:hover {
    background: #ea6c4c;
  }

  .btn-install {
    background: #238636;
    border-color: #238636;
    color: #fff;
  }

  .btn-install:hover {
    background: #2ea043;
  }
</style>

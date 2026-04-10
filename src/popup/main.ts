//! Popup entry point — mounts App.svelte
import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app');
if (target) {
  mount(App, { target });
}

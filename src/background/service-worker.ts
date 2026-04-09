//! Extension service worker — lifecycle events, alarm scheduling, message routing
import { ADAPTER_REFRESH_INTERVAL_MS, ALARM_NAMES } from '@shared/constants';
import { initMessageRouter } from './message-router';
import * as fetcher from './adapter-fetcher';

initMessageRouter();

chrome.runtime.onInstalled.addListener(() => {
  fetcher.refreshAdapters().catch(console.error);

  chrome.alarms.create(ALARM_NAMES.adapterRefresh, {
    periodInMinutes: ADAPTER_REFRESH_INTERVAL_MS / 60_000,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAMES.adapterRefresh) {
    fetcher.refreshAdapters().catch(console.error);
  }
});
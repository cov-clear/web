import { useEffect, useState } from 'react';
import http from 'axios';
import { Config, fetchConfig } from '../api';

export function useConfig(): Config | null {
  const [config, setConfig] = useState(loadConfig());
  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    async function fetchAndStoreConfig() {
      const config = await fetchConfig({ cancelToken: cancelToken.token });
      storeConfig(config);
      setConfig(config);
    }

    if (!config) {
      fetchAndStoreConfig();
    }

    return () => {
      cancelToken.cancel();
    };
  }, [config]);
  return config;
}

const LOCALSTORAGE_CONFIG_KEY = 'config';

function loadConfig(): Config | null {
  const config = localStorage.getItem(LOCALSTORAGE_CONFIG_KEY);
  if (!config) {
    return null;
  }
  try {
    return JSON.parse(config);
  } catch (e) {
    localStorage.removeItem(LOCALSTORAGE_CONFIG_KEY);
  }
  return null;
}

function storeConfig(config: Config) {
  localStorage.setItem(LOCALSTORAGE_CONFIG_KEY, JSON.stringify(config));
}

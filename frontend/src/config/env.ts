interface EnvironmentConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    description: string;
    environment: string;
  };
  features: {
    analytics: boolean;
    debug: boolean;
  };
  external: {
    googleAnalyticsId?: string;
    sentryDsn?: string;
    googleMapsApiKey?: string;
    mapboxAccessToken?: string;
  };
  auth: {
    domain?: string;
    clientId?: string;
  };
  assets: {
    cdnUrl?: string;
    assetsUrl: string;
  };
}

const config: EnvironmentConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Solar Winds',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Solar Winds Application',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
  external: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  },
  auth: {
    domain: import.meta.env.VITE_AUTH_DOMAIN,
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
  },
  assets: {
    cdnUrl: import.meta.env.VITE_CDN_URL,
    assetsUrl: import.meta.env.VITE_ASSETS_URL || 'http://localhost:5173/assets',
  },
};

export default config;
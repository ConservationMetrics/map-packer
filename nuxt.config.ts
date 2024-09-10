export default defineNuxtConfig({
  compatibilityDate: "2024-09-09",

  // Global page headers: https://nuxt.com/docs/getting-started/seo-meta
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  devtools: { enabled: true },

  // Global CSS: https://nuxt.com/docs/api/nuxt-config#css
  css: ["mapbox-gl/dist/mapbox-gl.css"],

  // Modules: https://nuxt.com/docs/guide/concepts/modules
  modules: [
    "nuxt-auth-utils",
    "@nuxtjs/i18n",
    "@nuxt/test-utils/module",
    "nuxt-windicss",
  ],

  i18n: {
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "es", name: "Español", language: "es-ES", file: "es.json" },
      { code: "pt", name: "Português", language: "pt-PT", file: "pt.json" },
      { code: "nl", name: "Nederlands", language: "nl-NL", file: "nl.json" },
    ],
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: true,
      redirectOn: "all",
    },
    langDir: "lang/",
    strategy: "no_prefix",
    skipSettingLocaleOnNavigate: true, // persists locale when route changes
  },

  runtimeConfig: {
    asqQueueName: process.env.ASQ_QUEUE_NAME,
    azureStorageConnectionAccountName:
      process.env.AZURE_STORAGE_CONNECTION_ACCOUNT_NAME,
    azureStorageConnectionStorageKey:
      process.env.AZURE_STORAGE_CONNECTION_STORAGE_KEY,
    database: process.env.DATABASE,
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT || "5432",
    dbSsl: process.env.DB_SSL || "YES",
    dbTable: process.env.DB_TABLE,
    port: process.env.PORT,
    public: {
      apiKey: process.env.VUE_APP_API_KEY,
      authStrategy: process.env.NUXT_ENV_AUTH_STRATEGY || "none",
      baseUrl: process.env.NUXT_OAUTH_AUTH0_BASE_URL,
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      mapboxStyle: process.env.MAPBOX_STYLE,
      mapboxStyleName: process.env.MAPBOX_STYLE_NAME,
      mapZoom: process.env.MAP_ZOOM,
      mapLatitude: process.env.MAP_LATITUDE,
      mapLongitude: process.env.MAP_LONGITUDE,
      offlineMapsPath: process.env.OFFLINE_MAPS_PATH,
      offlineMapsUri: process.env.OFFLINE_MAPS_URI,
      planetApiKey: process.env.PLANET_API_KEY,
      stadiaApiKey: process.env.STADIA_API_KEY,
      thunderforestApiKey: process.env.THUNDERFOREST_API_KEY,
    },
  },
});

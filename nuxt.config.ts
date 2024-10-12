import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2024-10-08",

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "description", name: "description", content: "" },
        { name: "format-detection", content: "telephone=no" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  devtools: { enabled: true },

  css: ["mapbox-gl/dist/mapbox-gl.css"],

  modules: [
    "gc-shared-resources",
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
    asqQueueName: "",
    azureStorageConnectionAccountName: "",
    azureStorageConnectionStorageKey: "",
    database: "",
    dbHost: "",
    dbUser: "",
    dbPassword: "",
    dbPort: "5432",
    dbSsl: "true",
    dbTable: "",
    port: "8080",
    public: {
      appApiKey: "",
      authStrategy: "none",
      baseUrl: "http://localhost:8080",
      mapboxAccessToken: "",
      mapboxStyle: "mapbox://styles/mapbox/streets-v12",
      mapboxStyleName: "Mapbox Streets",
      mapZoom: "0",
      mapLatitude: "15",
      mapLongitude: "40",
      offlineMapsPath: "",
      offlineMapsUri: "",
      planetApiKey: "",
      stadiaApiKey: "",
      thunderforestApiKey: "",
    },
  },
});

const apiKey: string = process.env.VUE_APP_API_KEY?.replace(/['"]+/g, "") || "";
const authStrategy: string =
  process.env.NUXT_ENV_AUTH_STRATEGY?.replace(/['"]+/g, "") || "none";
const baseUrl: string =
  process.env.NUXT_ENV_AUTH0_BASE_URL || "http://localhost:8080";

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
  modules: ["@nuxtjs/i18n", "nuxt-windicss", "nuxt-auth-utils"],

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
    public: {
      apiKey,
      authStrategy,
      baseUrl,
    },
  },
});

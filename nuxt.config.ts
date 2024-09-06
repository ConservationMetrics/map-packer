const apiKey: string = process.env.VUE_APP_API_KEY?.replace(/['"]+/g, "") || "";
const authStrategy: string =
  process.env.NUXT_ENV_AUTH_STRATEGY?.replace(/['"]+/g, "") || "none";
const auth0domain: string =
  process.env.NUXT_ENV_AUTH0_DOMAIN?.replace(/['"]+/g, "") || "";
const auth0clientId: string =
  process.env.NUXT_ENV_AUTH0_CLIENT_ID?.replace(/['"]+/g, "") || "";
const auth0baseUrl: string =
  process.env.NUXT_ENV_AUTH0_BASE_URL?.replace(/['"]+/g, "") || "";

export default defineNuxtConfig({
  compatibilityDate: "2024-09-06",
  
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

  // Modules : https://nuxt.com/docs/guide/concepts/modules
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
      fallbackLocale: "en",
      redirectOn: "all",
    },
    langDir: "lang/",
    strategy: "no_prefix",
  },

  runtimeConfig: {
    public: {
      apiKey,
      auth0: {
        domain: auth0domain,
        clientId: auth0clientId,
        baseUrl: auth0baseUrl,
      },
      authStrategy,
    },
  },

  // auth: {
  //   strategies: {
  //     none: {
  //       scheme: "local",
  //       tokenRequired: false,
  //       tokenType: false,
  //     },
  //     auth0: {
  //       scheme: "~src/runtimeConfigurableScheme.ts",
  //     },
  //     password: {
  //       scheme: "local",
  //       token: {
  //         property: "token",
  //         required: true,
  //         type: "Bearer",
  //         maxAge: 1800,
  //       },
  //       endpoints: {
  //         login: { url: "/api/login", method: "post", propertyName: "token" },
  //         logout: false,
  //         user: false,
  //       },
  //     },
  //   },
  // },

  // publicRuntimeConfig: {
  //   auth: {
  //     strategies: {
  //       auth0: {
  //         domain: auth0Domain,
  //         clientId: auth0ClientId,
  //         endpoints: {
  //           authorization: `https://${auth0Domain}/authorize`,
  //         },
  //         ...(auth0Audience !== "" ? { auth0Audience } : {}),
  //       },
  //     },
  //   },
  //   apiKey: process.env.VUE_APP_API_KEY,
  //   authStrategy,
  // },
});
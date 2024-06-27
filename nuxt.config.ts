// const authStrategy: string =
//   process.env.NUXT_ENV_AUTH_STRATEGY?.replace(/['"]+/g, "") || "none";
// const auth0Domain: string =
//   process.env.NUXT_ENV_AUTH0_DOMAIN?.replace(/['"]+/g, "") || "";
// const auth0ClientId: string =
//   process.env.NUXT_ENV_AUTH0_CLIENT_ID?.replace(/['"]+/g, "") || "";
// const auth0Audience: string =
//   process.env.NUXT_ENV_AUTH0_AUDIENCE?.replace(/['"]+/g, "") || "";

export default defineNuxtConfig({
  // Global page headers: https://nuxt.com/docs/getting-started/seo-meta
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    }
  },

  // Global CSS: https://nuxt.com/docs/api/nuxt-config#css
  css: ["mapbox-gl/dist/mapbox-gl.css"],

  // Modules : https://nuxt.com/docs/guide/concepts/modules
  modules: [
    "@nuxtjs/i18n",
    "nuxt-windicss",
    "nuxt-auth-utils"
  ],

  i18n: {
    locales: [
      { code: "en", name: "English", iso: "en-US", file: "en.json" },
      { code: "es", name: "Español", iso: "es-ES", file: "es.json" },
      { code: "pt", name: "Português", iso: "pt-PT", file: "pt.json" },
      { code: "nl", name: "Nederlands", iso: "nl-NL", file: "nl.json" },
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
      apiKey: process.env.VUE_APP_API_KEY
    }
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

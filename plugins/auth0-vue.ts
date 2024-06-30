import { createAuth0 } from '@auth0/auth0-vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const auth0 = createAuth0({
    domain: config.public.auth0.domain || '',
    clientId: config.public.auth0.clientId || '',
    authorizationParams: {
      redirect_uri: config.public.auth0.baseUrl || window.location.origin
    },
  })

  if (!import.meta.env.SSR) {
    nuxtApp.vueApp.use(auth0)
  }

  nuxtApp.provide('auth0', auth0)
})

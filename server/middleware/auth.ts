import { defineNuxtRouteMiddleware, navigateTo, useRoute } from 'nuxt/app'
import { useAuth } from '@nuxt/auth-next'

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuth()
  const route = useRoute()

  if (auth.strategy.name === 'none') {
    return
  }

  if (to.path !== '/login' && !auth.loggedIn) {
    if (route.query.redirect) {
      // If already redirected, avoid adding another redirect query parameter
      return
    }
    const redirectTo = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirectTo}`)
  }
})

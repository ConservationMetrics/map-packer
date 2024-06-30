import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from 'nuxt/app'
import type { Auth0VueClient } from '@auth0/auth0-vue'

export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp()
  const auth0 = nuxtApp.$auth0 as Auth0VueClient

  if (!auth0.isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

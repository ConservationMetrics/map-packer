<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="italic">{{ $t("authMessage") }}.</p>
    <button
      class="px-4 py-2 mt-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      @click="login"
    >
      {{ $t("loginButton") }}
    </button>
    <p v-if="errorMessage" class="text-red-500 text-xs italic">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute, useLocalePath } from '#app'
import { useAuth } from '@nuxt/auth-next'
import { useI18n } from 'vue-i18n'

// Define composables
const errorMessage = ref('')
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const localePath = useLocalePath()

const redirectPath = ref(localePath('/'))

// On mount
onMounted(() => {
  const redirect = route.query.redirect
  redirectPath.value = redirect ? decodeURIComponent(redirect) : localePath('/')

  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const error = hashParams.get('error')
  const errorDescription = hashParams.get('error_description')

  if (error === 'access_denied') {
    errorMessage.value = decodeURIComponent(errorDescription)
  }
  if (auth.loggedIn) {
    router.replace(redirectPath.value)
  }
})

// Methods
const login = async () => {
  try {
    await auth.loginWith('auth0', {
      redirectUri: window.location.origin + redirectPath.value,
    })
  } catch (error) {
    console.error(t('auth0LoginError') + ':', error)
  }
}
</script>

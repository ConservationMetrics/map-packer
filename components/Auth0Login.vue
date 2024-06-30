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
import { ref, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useI18n } from 'vue-i18n'

// Define composables
const errorMessage = ref('')
const { t } = useI18n()
const router = useRouter()
const auth0 = !import.meta.env.SSR ? useAuth0() : undefined
const localePath = useLocalePath()
const { $auth0 } = useNuxtApp()

const redirectPath = ref(localePath('/'))

// On mount
onMounted(() => {
  const redirect = router.currentRoute.value.query.redirect
  redirectPath.value = redirect ? decodeURIComponent(redirect) : localePath('/map')

  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const error = hashParams.get('error')
  const errorDescription = hashParams.get('error_description')

  if (error === 'access_denied') {
    errorMessage.value = decodeURIComponent(errorDescription)
  }

  watch(() => $auth0?.isAuthenticated.value, (newValue) => {
    if (newValue) {
      router.push(redirectPath.value)
    }
  })
})

const login = () => {
  $auth0?.checkSession()
  if (!$auth0?.isAuthenticated.value) {
    $auth0?.loginWithRedirect({
      appState: {
        target: useRoute().path,
      },
    })
  } else {
    router.push(redirectPath.value)
  }
}
</script>

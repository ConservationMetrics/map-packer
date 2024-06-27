<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <p class="italic">{{ $t("authMessage") }}.</p>
    <form
      @submit.prevent="login"
      class="w-full max-w-sm bg-white shadow-md rounded px-8 pt-6 pb-8 mt-4 mb-4"
    >
      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="password"
        >
          {{ $t("password") }}
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          v-model="password"
          required
        />
      </div>
      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {{ $t("login") }}
        </button>
      </div>
    </form>
    <p v-if="error" class="text-red-500 text-xs italic">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@nuxtjs/auth-next'
import { useFetch, useRuntimeConfig } from '#app'

// Define composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const config = useRuntimeConfig()

// Set up reactive state
let password = ref("")
let error = ref(null)
let redirectPath = ref(route.query.redirect ? decodeURIComponent(route.query.redirect) : '/')

// Watch
watch(() => auth.loggedIn, (loggedIn) => {
  if (loggedIn) {
    router.push(redirectPath.value)
  }
})

// Methods
async function login() {
  const authStrategy = config.authStrategy || "none"
  if (authStrategy === "password") {
    try {
      const { data, error: fetchError } = await useFetch('/api/login/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password.value
        })
      })

      if (fetchError) {
        if (fetchError.response && fetchError.response.status === 403) {
          error.value = t("passwordIncorrect") + "."
        } else if (fetchError.response && fetchError.response.data && fetchError.response.data.message) {
          error.value = fetchError.response.data.message
        } else {
          error.value = t("loginError") + "."
        }
      } else {
        await auth.loginWith('local', {
          data: {
            token: data.token
          }
        })
        router.push(redirectPath.value)
      }
    } catch (err) {
      error.value = err.message || t("loginError") + "."
    }
  }
}
</script>

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
// import { useAuth } from '@nuxtjs/auth-next'
// import { useAxios } from 'axios'

const { locale, setLocale } = useI18n()
const route = useRoute()
const router = useRouter()
// const { $axios } = useAxios()
// const { $auth, loginWith } = useAuth()

let password = ref("")
let error = ref(null)
let redirectPath = ref(locale.value ? `/${locale.value}/` : '/')

// watch($auth.loggedIn, (loggedIn) => {
//   if (loggedIn) {
//     router.push(redirectPath.value)
//   }
// })

async function login() {
  const authStrategy = $config.authStrategy || "none"
  if (authStrategy === "password") {
    try {
      await loginWith("password", {
        data: {
          password: password.value,
        },
      })
      router.push(redirectPath.value)
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          error.value = $t("passwordIncorrect") + "."
        } else if (error.response.data && error.response.data.message) {
          error.value = error.response.data.message
        } else {
          error.value = $t("loginError") + "."
        }
      } else {
        error.value = error.message || $t("loginError") + "."
      }
    }
  }
}

</script>

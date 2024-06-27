<template>
  <component :is="loginComponent" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import Auth0Login from "~/components/Auth0Login.vue";
import PasswordLogin from "~/components/PasswordLogin.vue";

// Define composables
const config = useRuntimeConfig()
const authStrategy = ref('none')

// On Mount
onMounted(() => {
  try {
    authStrategy.value = config.authStrategy
  } catch (error) {
    console.error('Error fetching authStrategy config on client side:', error)
  }
})

const loginComponent = computed(() => {
  return authStrategy.value === 'auth0' ? Auth0Login : PasswordLogin
})
</script>

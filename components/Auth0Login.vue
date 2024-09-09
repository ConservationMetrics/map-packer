<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <p class="italic">{{ $t("authMessage") }}.</p>
    <button
      class="px-4 py-2 mt-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
      @click="loginWithAuth0"
    >
      {{ $t("loginButton") }}
    </button>
    <p v-if="errorMessage" class="text-red-500 text-xs italic">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

// Set up composables
const errorMessage = ref("");
const { t } = useI18n();

const loginWithAuth0 = () => {
  window.location.href = "/auth/auth0";
};
</script>

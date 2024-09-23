<template>
  <Auth0Login
    v-if="loggedIn === false"
    :errorMessage="errorMessage"
  ></Auth0Login>
</template>

<script setup>
import { useHead } from "#imports";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

// Set up composables
const { t } = useI18n();
const { loggedIn } = useUserSession();
const errorMessage = ref("");

onMounted(() => {
  errorMessage.value = useAuth(loggedIn);
});

// Set up page metadata
useHead({
  title: "MapPacker: " + t("login"),
});
</script>

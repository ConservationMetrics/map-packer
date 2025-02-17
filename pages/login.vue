<script lang="ts" setup>
import { useHead, useUserSession } from "#imports";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { loggedIn } = useUserSession();
const errorMessage = ref("");

onMounted(() => {
  const authResult = useAuth(loggedIn);
  errorMessage.value = authResult !== undefined ? authResult : "";
});

const { t } = useI18n();
useHead({
  title: "MapPacker: " + t("login"),
});
</script>

<template>
  <Auth0Login v-if="loggedIn === false" :error-message="errorMessage" />
</template>

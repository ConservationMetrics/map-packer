<script lang="ts" setup>
import { useHead, useUserSession } from "#imports";
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { loggedIn } = useUserSession();
const errorMessage = ref("");

onMounted(() => {
  // eslint-disable-next-line no-undef
  const authResult = useAuth(loggedIn);
  errorMessage.value = authResult !== undefined ? authResult : "";
});

const { t } = useI18n();
useHead({
  title: "MapPacker: " + t("login"),
});
</script>

<template>
  <Auth0Login
    v-if="loggedIn === false"
    :errorMessage="errorMessage"
  ></Auth0Login>
</template>

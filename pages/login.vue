<template>
  <Auth0Login v-if="loggedIn === false"></Auth0Login>
</template>

<script setup>
import { useHead } from "#imports";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

// Set up composables
const { t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
const { loggedIn } = useUserSession();

const redirectPath = ref(localePath("/"));

// On mount
onMounted(async () => {
  const redirect = router.currentRoute.value.query.redirect;
  redirectPath.value = redirect
    ? decodeURIComponent(redirect)
    : localePath("/");

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const error = hashParams.get("error");
  const errorDescription = hashParams.get("error_description");

  if (error === "access_denied") {
    errorMessage.value = decodeURIComponent(errorDescription);
  }

  if (loggedIn.value) {
    router.push(redirectPath.value);
  }
});

useHead({
  title: "MapPacker: " + t("login"),
});
</script>

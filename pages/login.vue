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
const router = useRouter();
const localePath = useLocalePath();
const { loggedIn } = useUserSession();

const errorMessage = ref("");
const redirectPath = ref(localePath("/"));

// On mount
onMounted(async () => {
  const redirect = router.currentRoute.value.query.redirect;
  redirectPath.value = redirect
    ? decodeURIComponent(redirect)
    : localePath("/");

  const queryParams = new URLSearchParams(window.location.search);
  const error = queryParams.get("error");
  const errorDescription = queryParams.get("error_description");

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

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
const { loggedIn } = useUserSession();
const localePath = useLocalePath();

// Set up reactive state
const errorMessage = ref("");
const redirectPath = ref(localePath("/"));

// On mount
onMounted(async () => {
  const redirect = router.currentRoute.value.query.redirect;
  redirectPath.value = redirect
    ? decodeURIComponent(redirect)
    : localePath("/");

  // Imperfect solution to handle Auth0 redirect
  // Get the code from the URL and redirect to the auth endpoint
  // Which will then create a session and redirect back to /
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    window.location.href = `/auth/auth0?code=${code}`;
  }

  // Handle access denied error
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

// Set up page metadata
useHead({
  title: "MapPacker: " + t("login"),
});
</script>

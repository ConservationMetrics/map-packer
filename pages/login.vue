<template>
  <Auth0Login
    v-if="loggedIn === false"
    :errorMessage="errorMessage"
  ></Auth0Login>
</template>

<script setup>
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";

// Set up composables
const { t } = useI18n();
const { loggedIn, errorMessage } = useAuth();

// Set up page metadata
useHead({
  title: "MapPacker: " + t("login"),
});
</script>

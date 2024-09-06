<template>
  <Auth0Login></Auth0Login>
</template>

<script setup>
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";

// Set up composables
const { t } = useI18n();

useHead({
  title: "MapPacker: " + t("login"),
});
</script>

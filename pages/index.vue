<script setup>
import { ref } from "vue";
import { useHead, useFetch, useRuntimeConfig } from "#app";
import { useI18n } from "vue-i18n";

// API request to fetch the data
const dataFetched = ref(false);
const nextCursor = ref(null);
const offlineMaps = ref([]);
const isLoading = ref(false);
const {
  public: { appApiKey, mapboxAccessToken, offlineMapsUri },
} = useRuntimeConfig();
const headers = {
  "x-api-key": appApiKey,
};
const { data: initialData, error: initialError } = await useFetch("/api/data", {
  headers,
});

if (initialData.value && !initialError.value) {
  let parsedData =
    typeof initialData.value === "string"
      ? JSON.parse(initialData.value)
      : initialData.value;

  nextCursor.value = parsedData.nextCursor;
  offlineMaps.value = parsedData.offlineMaps;

  dataFetched.value = true;
} else {
  console.error("Error fetching data:", initialError.value);
}

// Load more data based on cursor pagination
const loadMore = async () => {
  if (!nextCursor.value || isLoading.value) return;

  isLoading.value = true;

  try {
    const { data: moreData, error: moreError } = await useFetch(
      `/api/data?cursor=${nextCursor.value}`,
      {
        headers: headers,
      },
    );

    if (moreData.value && !moreError.value) {
      if (moreData.value.offlineMaps.length > 0) {
        offlineMaps.value.push(...moreData.value.offlineMaps);
        nextCursor.value = moreData.value.nextCursor;
      } else {
        nextCursor.value = null;
      }
    } else {
      console.error("Error fetching more data:", moreError.value);
    }
  } catch (error) {
    console.error("Error fetching more data:", error);
  } finally {
    isLoading.value = false;
  }
};

// POST map request (emitted by component)
const handleMapRequest = async (message) => {
  try {
    // eslint-disable-next-line no-undef
    await $fetch("/api/maprequest", {
      method: "POST",
      body: message,
      headers: headers,
    });
  } catch (error) {
    console.error("Error submitting request data:", error);
  }
};

const { t } = useI18n();
useHead({
  title: "MapPacker: " + t("availableOfflineMaps"),
});
</script>

<template>
  <div>
    <MapDashboard
      v-if="dataFetched"
      :mapbox-access-token="mapboxAccessToken"
      :next-cursor="nextCursor"
      :offline-maps="offlineMaps"
      :offline-maps-uri="offlineMapsUri"
      @handleMapRequest="handleMapRequest"
      @loadMore="loadMore"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import type { MapResponse, MapRequest } from "@/types/types";

// API request to fetch the data
const dataFetched = ref(false);
const nextCursor = ref();
const offlineMaps = ref<MapRequest[]>([]);
const isLoading = ref(false);
const {
  public: { appApiKey, mapboxAccessToken, offlineMapsUri },
} = useRuntimeConfig();
const headers = {
  "x-api-key": appApiKey,
};
const { data: initialMapsData, error: initialMapsError } =
  await useFetch<MapResponse>("/api/data", {
    headers,
  });

if (initialMapsData.value && !initialMapsError.value) {
  const parsedData =
    typeof initialMapsData.value === "string"
      ? JSON.parse(initialMapsData.value)
      : initialMapsData.value;

  nextCursor.value = parsedData.nextCursor;
  offlineMaps.value = parsedData.offlineMaps;

  dataFetched.value = true;
} else {
  console.error("Error fetching data:", initialMapsError.value);
}

/** Loads more offline maps data based on cursor pagination. */
const loadMoreMaps = async () => {
  if (!nextCursor.value || isLoading.value) return;

  isLoading.value = true;

  try {
    const { data: moreMapsData, error: moreMapsError } =
      await useFetch<MapResponse>(`/api/data?cursor=${nextCursor.value}`, {
        headers: headers,
      });

    if (moreMapsData.value && !moreMapsError.value) {
      console.log(moreMapsData.value);
      if (moreMapsData.value.offlineMaps.length > 0) {
        offlineMaps.value.push(...moreMapsData.value.offlineMaps);
        nextCursor.value = moreMapsData.value.nextCursor;
      } else {
        nextCursor.value = undefined;
      }
    } else {
      console.error("Error fetching more data:", moreMapsError.value);
    }
  } catch (error) {
    console.error("Error fetching more data:", error);
  } finally {
    isLoading.value = false;
  }
};

/** Submits a map request emitted by a component. */
const handleMapRequest = async (message: object) => {
  try {
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
      @handle-map-request="handleMapRequest"
      @load-more-maps="loadMoreMaps"
    />
  </div>
</template>

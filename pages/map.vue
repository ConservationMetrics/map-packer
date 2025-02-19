<script lang="ts" setup>
import { useI18n } from "vue-i18n";

import type { AvailableMapStyles, FormData } from "@/types/types";

// API request to fetch the data
const dataFetched = ref(false);
const availableMapStyles = ref<AvailableMapStyles>([]);
const {
  public: { appApiKey, mapboxAccessToken, mapLatitude, mapLongitude, mapZoom },
} = useRuntimeConfig();
const headers = {
  "x-api-key": appApiKey,
};
try {
  let mapStyles: string | AvailableMapStyles = await $fetch("/api/map", {
    headers,
  });
  if (typeof mapStyles === "string") {
    mapStyles = JSON.parse(mapStyles) as AvailableMapStyles;
  }
  availableMapStyles.value = mapStyles;

  dataFetched.value = true;
} catch (error) {
  if (error instanceof Error) {
    console.error("Error fetching data:", error.message);
  } else {
    console.error("Error fetching data:", error);
  }
  dataFetched.value = false;
}

/** Handles map request submission by transforming formData and sending a POST request. */
const handleMapRequest = async (formData: FormData) => {
  /** Normalizes a string by removing accents and replacing non-alphanumeric characters with underscores. */
  const normalizeFilename = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\W+/g, "_");

  const transformedMessage = {
    type: "new_request",
    title: formData.title,
    filename: normalizeFilename(formData.title),
    status: "PENDING",
    description: formData.description,
    min_zoom: 0,
    max_zoom: formData.maxZoom,
    mapbox_style: formData.mapboxStyle ?? undefined,
    planet_monthly_visual: formData.planetMonthYear ?? undefined,
    api_key: formData.mapboxAccessToken ?? undefined,
    bounds: formData.selectedBounds,
    style: formData.selectedStyle,
    openstreetmap: formData.openstreetmap ?? false,
    number_of_tiles: formData.estimatedTiles,
    format: formData.format,
    created_at: new Date(),
  };

  try {
    await $fetch("/api/maprequest", {
      method: "POST",
      body: transformedMessage,
      headers: headers,
    });
  } catch (error) {
    console.error("Error submitting request data:", error);
  }
};

const { t } = useI18n();
useHead({
  title: "MapPacker: " + t("generateOfflineMap"),
});
</script>

<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      :available-map-styles="availableMapStyles"
      :mapbox-access-token="mapboxAccessToken"
      :map-latitude="Number(mapLatitude)"
      :map-longitude="Number(mapLongitude)"
      :map-zoom="Number(mapZoom)"
      @handle-map-request="handleMapRequest"
    />
  </div>
</template>

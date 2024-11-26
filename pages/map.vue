<script setup>
import { ref } from "vue";
import { useHead, useRuntimeConfig } from "#app";
import { useI18n } from "vue-i18n";

// API request to fetch the data
const dataFetched = ref(false);
const availableMapStyles = ref([]);
const {
  public: { appApiKey, mapboxAccessToken, mapLatitude, mapLongitude, mapZoom },
} = useRuntimeConfig();
const headers = {
  "x-api-key": appApiKey,
};
try {
  // eslint-disable-next-line no-undef
  let mapStyles = await $fetch("/api/map", { headers });
  if (typeof mapStyles === "string") {
    mapStyles = mapStyles.split(",");
  }
  availableMapStyles.value = mapStyles;

  dataFetched.value = true;
} catch (error) {
  console.error("Error fetching data:", error.value);
  dataFetched.value = false;
}

// POST map request (emitted by component)
const handleMapRequest = async (formData) => {
  // Rmove accents and replace non-alphanumeric characters with underscores
  const normalizeFilename = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\W+/g, "_");
  };

  // Transform formData to match the expected database table schema
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
    bounds: formData.selectedBounds,
    style: formData.selectedStyle,
    openstreetmap: formData.openstreetmap ?? false,
    number_of_tiles: formData.estimatedTiles,
    format: formData.format,
    created_at: new Date(),
  };

  // Include mapboxAccessToken if it exists
  if (formData.mapboxAccessToken) {
    transformedMessage.apiKey = formData.mapboxAccessToken;
  }

  try {
    // eslint-disable-next-line no-undef
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
      @handleMapRequest="handleMapRequest"
      :available-map-styles="availableMapStyles"
      :mapbox-access-token="mapboxAccessToken"
      :map-latitude="Number(mapLatitude)"
      :map-longitude="Number(mapLongitude)"
      :map-zoom="Number(mapZoom)"
    />
  </div>
</template>

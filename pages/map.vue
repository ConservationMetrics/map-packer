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

<script setup>
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";

// Set up config
const {
  public: { appApiKey, mapboxAccessToken, mapLatitude, mapLongitude, mapZoom },
} = useRuntimeConfig();

// Set up composables
const { t } = useI18n();

// Set up reactive state
const dataFetched = ref(false);
const availableMapStyles = ref([]);

// Define headers
const headers = {
  "x-api-key": appApiKey,
};

// Fetch initial data
try {
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
  // Function to remove accents and replace non-alphanumeric characters with underscores
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
    created_at: new Date(),
  };

  // Include mapboxAccessToken if it exists
  if (formData.mapboxAccessToken) {
    transformedMessage.apiKey = formData.mapboxAccessToken;
  }

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

// Set up page metadata
useHead({
  title: "MapPacker: " + t("generateOfflineMap"),
});
</script>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import MapSidebar from "@/components/GenerateMap/MapSidebar.vue";
import MapNavigation from "@/components/GenerateMap/MapNavigation.vue";
import MapCanvas from "@/components/GenerateMap/MapCanvas.vue";

import type {
  AvailableMapStyles,
  FormData,
  UpdateMapParams,
} from "@/types/types";

const { t } = useI18n();

const props = defineProps<{
  availableMapStyles: AvailableMapStyles;
  mapboxAccessToken: string;
  mapLatitude: number;
  mapLongitude: number;
  mapZoom: number;
}>();

const router = useRouter();

const localMapboxAccessToken = ref(props.mapboxAccessToken);
const osmEnabled = ref(false);
const selectedBounds = ref("");
const selectedLatitude = ref(props.mapLatitude);
const selectedLongitude = ref(props.mapLongitude);
const selectedStyle = ref(props.availableMapStyles[0].url);
const selectedZoom = ref(props.mapZoom);
const showModal = ref(false);

const emit = defineEmits(["updateMapParams", "handleMapRequest"]);

/** Updates map parameters based on the provided update object. */
const updateMapParams = (updateObj: UpdateMapParams) => {
  const { param } = updateObj;
  let { value } = updateObj;

  if (typeof value === "number") {
    value = parseFloat(value.toFixed(6));
  }

  if (param === "OsmEnabled") {
    osmEnabled.value = value as boolean;
  } else if (param === "AccessToken") {
    localMapboxAccessToken.value = value as string;
  } else {
    switch (param) {
      case "Bounds":
        selectedBounds.value = value as string;
        break;
      case "Latitude":
        selectedLatitude.value = value as number;
        break;
      case "Longitude":
        selectedLongitude.value = value as number;
        break;
      case "Style":
        selectedStyle.value = value as string;
        osmEnabled.value = false;
        emit("updateMapParams", { param: "OsmEnabled", value: false });
        break;
      case "Zoom":
        selectedZoom.value = value as number;
        break;
    }
  }
};

/** Handles form submission and navigates to the home page. */
const handleFormSubmit = (formData: FormData) => {
  emit("handleMapRequest", formData);
  showModal.value = true;
  setTimeout(() => {
    router.push("/");
  }, 3000);
};
</script>

<template>
  <div>
    <MapSidebar
      :available-map-styles="props.availableMapStyles"
      :map-bounds="selectedBounds"
      :map-style="selectedStyle"
      :mapbox-access-token="localMapboxAccessToken"
      :osm-enabled="osmEnabled"
      @form-submitted="handleFormSubmit"
      @update-map-params="updateMapParams"
    />
    <MapNavigation
      :map-latitude="selectedLatitude"
      :map-longitude="selectedLongitude"
      :map-zoom="selectedZoom"
      @update-map-params="updateMapParams"
    />
    <MapCanvas
      :mapbox-access-token="localMapboxAccessToken"
      :map-latitude="selectedLatitude"
      :map-longitude="selectedLongitude"
      :map-style="selectedStyle"
      :map-zoom="selectedZoom"
      :osm-enabled="osmEnabled"
      @update-map-params="updateMapParams"
    />
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      {{ t("offlineMapRequestSubmitted") }}!
    </div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>

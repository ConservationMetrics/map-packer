<template>
  <div>
    <Sidebar
      :available-map-styles="availableMapStyles"
      :map-bounds="selectedBounds"
      :map-style="selectedStyle"
      :osm-enabled="osmEnabled"
      @formSubmitted="handleFormSubmit"
      @updateMapParams="updateMapParams"
    />
    <MapNavigation
      :map-latitude="selectedLatitude"
      :map-longitude="selectedLongitude"
      :map-zoom="selectedZoom"
      @updateMapParams="updateMapParams"
    />
    <MapCanvas
      :mapbox-access-token="localMapboxAccessToken"
      :map-latitude="selectedLatitude"
      :map-longitude="selectedLongitude"
      :map-style="selectedStyle"
      :map-zoom="selectedZoom"
      :osm-enabled="osmEnabled"
      @updateMapParams="updateMapParams"
    />
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      {{ $t("offlineMapRequestSubmitted") }}!
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import Sidebar from "@/components/GenerateMap/Sidebar.vue";
import MapNavigation from "@/components/GenerateMap/MapNavigation.vue";
import MapCanvas from "@/components/GenerateMap/MapCanvas.vue";

// Define props
const props = defineProps({
  availableMapStyles: Array,
  mapboxAccessToken: String,
  mapLatitude: Number,
  mapLongitude: Number,
  mapZoom: Number,
});

// Set up composables
const router = useRouter();
const { t } = useI18n();
const localePath = useLocalePath();

// Set up reactive state
const localMapboxAccessToken = ref(props.mapboxAccessToken);
const osmEnabled = ref(false);
const selectedBounds = ref("");
const selectedLatitude = ref(props.mapLatitude);
const selectedLongitude = ref(props.mapLongitude);
const selectedStyle = ref(props.availableMapStyles[0].url);
const selectedZoom = ref(props.mapZoom);
const showModal = ref(false);

// Define emits
const emit = defineEmits(["updateMapParams", "handleMapRequest"]);

// Methods
const handleFormSubmit = (formData) => {
  emit("handleMapRequest", formData);
  showModal.value = true;
  setTimeout(() => {
    router.push(localePath("/"));
  }, 3000);
};

const updateMapParams = (updateObj) => {
  let { param, value } = updateObj;

  if (typeof value === "number") {
    value = parseFloat(value.toFixed(6));
  }

  if (param === "OsmEnabled") {
    osmEnabled.value = value;
  } else if (param === "AccessToken") {
    localMapboxAccessToken.value = value;
  } else {
    switch (param) {
      case "Bounds":
        selectedBounds.value = value;
        break;
      case "Latitude":
        selectedLatitude.value = value;
        break;
      case "Longitude":
        selectedLongitude.value = value;
        break;
      case "Style":
        selectedStyle.value = value;
        osmEnabled.value = false;
        emit("updateMapParams", { param: "OsmEnabled", value: false });
        break;
      case "Zoom":
        selectedZoom.value = value;
        break;
    }
  }
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>

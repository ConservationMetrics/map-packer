<template>
  <div>
    <Panels
      @formSubmitted="handleFormSubmit"
      @updateMapParams="updateMapParams"
      :availableMapStyles="availableMapStyles"
      :customMapboxStyle="customMapboxStyle"
      :mapBounds="selectedBounds"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapStyle="selectedStyle"
      :mapZoom="selectedZoom"
    />
    <Map
      @updateMapParams="updateMapParams"
      :mapboxAccessToken="mapboxAccessToken"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapStyle="selectedStyle"
      :mapZoom="selectedZoom"
    />
  </div>
</template>

<script>
import Panels from "@/components/GenerateMap/Panels.vue";
import Map from "@/components/GenerateMap/Map.vue";

export default {
  components: { Panels, Map },
  props: [
    "availableMapStyles",
    "customMapboxStyle",
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "mapZoom",
  ],
  data() {
    return {
      selectedBounds: "",
      selectedLatitude: this.mapLatitude,
      selectedLongitude: this.mapLongitude,
      selectedStyle: this.customMapboxStyle,
      selectedZoom: this.mapZoom,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      // TODO: Send as a POST request to the API
      // TODO: Add modal to show success and redirect to MapDashboard
      console.log("Received form data:", formData);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === "number") {
        value = parseFloat(value.toFixed(6));
      }

      this[`selected${param}`] = value;
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>

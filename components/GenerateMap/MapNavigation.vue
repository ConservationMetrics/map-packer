<template>
  <div class="map-navigation">
    <h2 class="text-xl font-bold text-gray-800 mb-2">Map controls</h2>
    <div class="form-group">
      <label>Zoom level (0 - 16) <span class="text-red-600">*</span></label>
      <vue-slider
        v-model="form.selectedZoom"
        :min="0"
        :max="16"
        :dot-size="14"
        :tooltip="'always'"
        :height="6"
        class="slider"
      ></vue-slider>
    </div>

    <div class="form-group flex">
      <div class="flex-grow mr-2">
        <label for="centerLat">Center lat</label>
        <input
          type="number"
          step="0.000001"
          id="selectedLatitude"
          v-model.number="form.selectedLatitude"
          required
          :min="-90"
          :max="90"
          class="input-field"
        />
      </div>
      <div class="flex-grow">
        <label for="centerLng">Center long</label>
        <input
          type="number"
          step="0.000001"
          id="selectedLongitude"
          v-model.number="form.selectedLongitude"
          required
          :min="-180"
          :max="180"
          class="input-field"
        />
      </div>
    </div>
  </div>
</template>

<script>
// This specific pattern of importing vue-slider-component follows the official
// documentation for server-side rendering: https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  components: { VueSlider },
  props: ["mapLatitude", "mapLongitude", "mapZoom"],
  data() {
    return {
      form: {
        selectedLatitude: this.mapLatitude,
        selectedLongitude: this.mapLongitude,
        selectedZoom: this.mapZoom,
      },
    };
  },
  watch: {
    // Watch for changes to the map's latitude, longitude, and zoom
    mapLatitude(newVal) {
      this.form.selectedLatitude = newVal;
    },
    mapLongitude(newVal) {
      this.form.selectedLongitude = newVal;
    },
    mapZoom(newVal) {
      this.form.selectedZoom = newVal;
    },

    // Track and emit changes to map parameters in the sidebar form,
    // So that the parent component can update the map
    "form.selectedLatitude": function (newVal) {
      this.$emit("updateMapParams", { param: "Latitude", value: newVal });
    },
    "form.selectedLongitude": function (newVal) {
      this.$emit("updateMapParams", { param: "Longitude", value: newVal });
    },
    "form.selectedZoom": {
      handler(newVal) {
        this.$emit("updateMapParams", { param: "Zoom", value: newVal });
      },
      deep: true,
    },
  },
};
</script>

<template>
  <div>
    <Sidebar
      @formSubmitted="handleFormSubmit"
      @updateMapParams="updateMapParams"
      :availableMapStyles="availableMapStyles"
      :customMapboxStyle="customMapboxStyle"
      :mapBounds="selectedBounds"
      :mapStyle="selectedStyle"
    />
    <MapNavigation
      @updateMapParams="updateMapParams"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
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
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      Offline map request successfully submitted!
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/GenerateMap/Sidebar.vue";
import MapNavigation from "@/components/GenerateMap/MapNavigation.vue";
import Map from "@/components/GenerateMap/Map.vue";
import style from '@/components/GenerateMap/style.css';

export default {
  components: { Map, Sidebar, MapNavigation },
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
      showModal: false,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      this.$emit("formSubmitted", formData);
      this.showModal = true;
      setTimeout(() => {
        this.$router.push('/');
      }, 3000);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === "number") {
        value = parseFloat(value.toFixed(6));
      }

      this[`selected${param}`] = value;
    },
  },
  computed: {
    style() {
      return style;
    },
  }
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>

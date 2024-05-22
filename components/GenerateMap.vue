<template>
  <div>
    <Sidebar
      @formSubmitted="handleFormSubmit"
      @updateMapParams="updateMapParams"
      :availableMapStyles="availableMapStyles"
      :mapBounds="selectedBounds"
      :mapStyle="selectedStyle"
      :osmEnabled="osmEnabled"
    />
    <MapNavigation
      @updateMapParams="updateMapParams"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapZoom="selectedZoom"
    />
    <MapCanvas
      @updateMapParams="updateMapParams"
      :mapboxAccessToken="mapboxAccessToken"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapStyle="selectedStyle"
      :mapZoom="selectedZoom"
      :osmEnabled="osmEnabled"
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
import MapCanvas from "@/components/GenerateMap/MapCanvas.vue";
import style from "@/components/GenerateMap/style.css";
import overlayModal from "@/components/overlay.css";

export default {
  components: { MapCanvas, Sidebar, MapNavigation },
  props: [
    "availableMapStyles",
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "mapZoom",
  ],
  data() {
    return {
      osmEnabled: false,
      selectedBounds: "",
      selectedLatitude: this.mapLatitude,
      selectedLongitude: this.mapLongitude,
      selectedStyle: this.availableMapStyles[0].url,
      selectedZoom: this.mapZoom,
      showModal: false,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      this.$emit("handleMapRequest", formData);
      this.showModal = true;
      setTimeout(() => {
        this.$router.push("/");
      }, 3000);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === "number") {
        value = parseFloat(value.toFixed(6));
      }

      if (param === "OsmEnabled") {
        this.osmEnabled = value;
      } else {
        this[`selected${param}`] = value;     
        if (param === "Style") {
          this.osmEnabled = false;
          this.$emit("updateMapParams", { param: "OsmEnabled", value: false });
        }
      }
    },
  },
  computed: {
    style() {
      return { ...style, ...overlayModal };
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

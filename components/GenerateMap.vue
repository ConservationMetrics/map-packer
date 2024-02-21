<template>
  <div>
    <div id="map"></div>
    <Sidebar />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import Sidebar from "@/components/Sidebar.vue";

export default {
  components: { Sidebar },
  props: [
    "mapboxAccessToken",
    "mapboxLatitude",
    "mapboxLongitude",
    "mapboxStyle",
    "mapboxZoom",
  ],
  mounted() {
    mapboxgl.accessToken = this.mapboxAccessToken;

    const map = new mapboxgl.Map({
      container: "map",
      style: this.mapboxStyle || "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "mercator",
      center: [this.mapboxLongitude || 0, this.mapboxLatitude || -15],
      zoom: this.mapboxZoom || 2.5
    });

    map.on("load", () => {
      // Navigation Control (zoom buttons and compass)
      const nav = new mapboxgl.NavigationControl();
      map.addControl(nav, "top-right");

      // Scale Control
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: "metric",
      });
      map.addControl(scale, "bottom-left");

      // Fullscreen Control
      const fullscreenControl = new mapboxgl.FullscreenControl();
      map.addControl(fullscreenControl, "top-right");
    });
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>

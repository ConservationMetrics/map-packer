<template>
    <div id="map"></div>
</template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  
  export default {
    props: [
      "mapboxAccessToken",
      "mapLatitude",
      "mapLongitude",
      "mapStyle",
      "mapZoom",
    ],
    data() {
      return {
        localLatitude: this.mapLatitude,
        localLongitude: this.mapLongitude,
        localZoom: this.mapZoom,
        localStyle: this.mapStyle,
      };
    },
    watch: {
      mapLatitude(newVal) {
        if (this.$map) {
          this.$map.setCenter([this.localLongitude, newVal]);
        }
      },
      mapLongitude(newVal) {
        if (this.$map) {
          this.$map.setCenter([newVal, this.localLatitude]);
        }
      },
      mapZoom(newVal) {
        if (this.$map) {
          this.$map.setZoom(newVal);
        }
      },
      mapStyle(newVal) {
        if (this.$map) {
          this.$map.setStyle(newVal);
        }
      },
    },
    mounted() {
      mapboxgl.accessToken = this.mapboxAccessToken;
  
      this.$map = new mapboxgl.Map({
        container: "map",
        style: this.mapStyle || "mapbox://styles/mapbox/satellite-streets-v12",
        projection: "mercator",
        center: [this.mapLongitude || 0, this.mapLatitude || -15],
        zoom: this.mapZoom || 2.5,
      });
  
      this.$map.on("load", () => {
        // Navigation Control (zoom buttons and compass)
        const nav = new mapboxgl.NavigationControl();
        this.$map.addControl(nav, "top-right");
  
        // Scale Control
        const scale = new mapboxgl.ScaleControl({
          maxWidth: 80,
          unit: "metric",
        });
        this.$map.addControl(scale, "bottom-left");
  
        // Track map center and zoom level
        this.$map.on("moveend", () => {
          const center = this.$map.getCenter();
          this.localLatitude = center.lat;
          this.localLongitude = center.lng;
          this.$emit('update:params', {param: 'Latitude', value: center.lat});
          this.$emit('update:params', {param: 'Longitude', value: center.lng});
        });
  
        this.$map.on("zoomend", () => {
          const zoom = this.$map.getZoom();
          this.localZoom = zoom;
          this.$emit('update:params', {param: 'Zoom', value: zoom});
        });
      });
    },
    beforeDestroy() {
      if (this.$map) {
        this.$map.remove();
      }
    },
  };
  </script>
  
  <style scoped>
  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
  </style>
  
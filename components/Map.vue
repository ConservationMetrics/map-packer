<template>
    <div id="map"></div>
</template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  
  export default {
    props: [
      "mapboxAccessToken",
      "mapboxLatitude",
      "mapboxLongitude",
      "mapboxStyle",
      "mapboxZoom",
    ],
    data() {
      return {
        map: null,
        localLatitude: this.mapboxLatitude,
        localLongitude: this.mapboxLongitude,
        localZoom: this.mapboxZoom,
      };
    },
    watch: {
      mapboxLatitude(newVal) {
        if (this.map) {
          this.map.setCenter([this.localLongitude, newVal]);
        }
      },
      mapboxLongitude(newVal) {
        if (this.map) {
          this.map.setCenter([newVal, this.localLatitude]);
        }
      },
      mapboxZoom(newVal) {
        if (this.map) {
          this.map.setZoom(newVal);
        }
      },
    },
    mounted() {
      mapboxgl.accessToken = this.mapboxAccessToken;
  
      const map = new mapboxgl.Map({
        container: "map",
        style: this.mapboxStyle || "mapbox://styles/mapbox/satellite-streets-v12",
        projection: "mercator",
        center: [this.mapboxLongitude || 0, this.mapboxLatitude || -15],
        zoom: this.mapboxZoom || 2.5,
      });
      this.map = map;
  
      this.map.on("load", () => {
        // Navigation Control (zoom buttons and compass)
        const nav = new mapboxgl.NavigationControl();
        map.addControl(nav, "top-right");
  
        // Scale Control
        const scale = new mapboxgl.ScaleControl({
          maxWidth: 80,
          unit: "metric",
        });
        map.addControl(scale, "bottom-left");
  
        // Track map center and zoom level
      map.on("moveend", () => {
        const center = map.getCenter();
        this.localLatitude = center.lat;
        this.localLongitude = center.lng;
        this.$emit('update:params', {param: 'Latitude', value: center.lat});
        this.$emit('update:params', {param: 'Longitude', value: center.lng});
      });
  
      map.on("zoomend", () => {
        const zoom = map.getZoom();
        this.localZoom = zoom;
        this.$emit('update:params', {param: 'Zoom', value: zoom});
      });
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
  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
  </style>
  
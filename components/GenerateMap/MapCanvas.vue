<template>
  <div id="map" />
</template>

<script>
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default {
  props: [
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "mapStyle",
    "mapZoom",
    "osmEnabled",
  ],
  data() {
    return {
      draw: null,
      mapLoaded: false,
      selectedLatitude: this.mapLatitude,
      selectedLongitude: this.mapLongitude,
      selectedStyle: this.mapStyle,
      selectedZoom: this.mapZoom,
    };
  },
  watch: {
    // Watch for changes to the map's latitude, longitude, zoom, and style props
    mapLatitude(newVal) {
      if (this.$map) {
        this.$map.setCenter([this.selectedLongitude, newVal]);
      }
    },
    mapLongitude(newVal) {
      if (this.$map) {
        this.$map.setCenter([newVal, this.selectedLatitude]);
      }
    },
    mapStyle(newVal) {
      if (this.$map) {
        this.$map.setStyle(newVal);
      }
    },
    mapZoom(newVal) {
      if (this.$map) {
        this.$map.setZoom(newVal);
      }
    },
    osmEnabled(newVal) {
      if (this.mapLoaded) {
        if (newVal) {
          this.addOSMLayers();
        } else {
          this.removeOSMLayers();
        }
      }
    },
  },
  methods: {
    getWSENstring(bounds) {
      if (bounds.length === 0) {
        return "No coordinates provided";
      }

      let minLat = bounds[0].lat;
      let maxLat = bounds[0].lat;
      let minLng = bounds[0].lng;
      let maxLng = bounds[0].lng;

      bounds.forEach((coord) => {
        if (coord.lat < minLat) minLat = coord.lat;
        if (coord.lat > maxLat) maxLat = coord.lat;
        if (coord.lng < minLng) minLng = coord.lng;
        if (coord.lng > maxLng) maxLng = coord.lng;
      });

      const wsen = `${minLng},${minLat},${maxLng},${maxLat}`;

      return wsen;
    },
    addOSMLayers() {
      if (!this.$map.getSource("osm")) {
        this.$map.addSource("osm", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-streets-v8",
        });

        // Add waterway lines
        this.$map.addLayer({
          id: "osm-waterway-lines",
          type: "line",
          source: "osm",
          "source-layer": "waterway",
          paint: {
            "line-width": 2,
            "line-color": "#0000ff", // blue for waterways
          },
        });

        // Add highway lines
        this.$map.addLayer({
          id: "osm-highway-lines",
          type: "line",
          source: "osm",
          "source-layer": "road",
          paint: {
            "line-width": 2,
            "line-color": "#a52a2a", // brown for highways
          },
        });

        // Add boundary lines
        this.$map.addLayer({
          id: "osm-boundary-lines",
          type: "line",
          source: "osm",
          "source-layer": "admin",
          paint: {
            "line-width": 2,
            "line-color": "#ffa500", // orange for boundaries
          },
        });

        // TODO: get glyphs working
        // glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf"

        // this.$map.addLayer({
        //   id: 'osm-point-labels',
        //   type: 'symbol',
        //   source: 'osm',
        //   filter: ["==", "$type", "Point"],
        //   layout: {
        //     'text-field': '{name}',
        //     'text-font': ['Noto Sans Medium'],
        //     'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 16, 24],
        //     'text-offset': [0, 1.5],
        //     'text-anchor': 'top'
        //   },
        //   paint: {
        //     'text-color': '#000000',
        //     'text-halo-color': '#ffffff',
        //     'text-halo-width': 2
        //   }
        // });
      }
    },
    removeOSMLayers() {
      if (this.$map.getLayer("osm-waterway-lines")) {
        this.$map.removeLayer("osm-waterway-lines");
      }
      if (this.$map.getLayer("osm-highway-lines")) {
        this.$map.removeLayer("osm-highway-lines");
      }
      if (this.$map.getLayer("osm-boundary-lines")) {
        this.$map.removeLayer("osm-boundary-lines");
      }
      if (this.$map.getSource("osm")) {
        this.$map.removeSource("osm");
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
      maxZoom: 16,
    });

    this.$map.on("load", () => {
      this.mapLoaded = true;

      // Navigation Control (zoom buttons and compass)
      const nav = new mapboxgl.NavigationControl();
      this.$map.addControl(nav, "top-right");

      // Add Mapbox Draw for creating bounding box
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          trash: true,
        },
        modes: {
          ...MapboxDraw.modes,
          draw_rectangle: DrawRectangle,
        },
      });

      this.$map.addControl(this.draw);

      // Clear existing drawings when creating a new rectangle
      this.$map.on("draw.create", (e) => {
        if (this.draw.getAll().features.length > 1) {
          this.draw.delete(this.draw.getAll().features[0].id);
        }
      });

      // Emit WSEN string derived from bounding box ofd drawn rectangle
      this.$map.on("draw.create", (e) => {
        const bbox = e.features[0].geometry.coordinates[0];
        const bounds = bbox.map((coord) => {
          return {
            lat: coord[1],
            lng: coord[0],
          };
        });
        const wsen = this.getWSENstring(bounds);
        this.$emit("updateMapParams", { param: "Bounds", value: wsen });
      });

      // Scale Control
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: "metric",
      });
      this.$map.addControl(scale, "bottom-left");

      // Track and emit map center and zoom level,
      // So that the parent component can update the panels
      this.$map.on("moveend", () => {
        const center = this.$map.getCenter();
        this.selectedLatitude = center.lat;
        this.selectedLongitude = center.lng;
        this.$emit("updateMapParams", { param: "Latitude", value: center.lat });
        this.$emit("updateMapParams", {
          param: "Longitude",
          value: center.lng,
        });
      });

      this.$map.on("zoomend", () => {
        const zoom = this.$map.getZoom();
        this.selectedZoom = zoom;
        this.$emit("updateMapParams", { param: "Zoom", value: zoom });
      });

      // Create a custom bbox-draw button since mapbox-gl-draw-rectangle-mode doesn't provide one
      const button = document.createElement("button");
      button.className = "mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon";
      button.id = "bbox-draw";
      button.title = "Draw Rectangle";

      // Add event listener for bbox-draw button
      button.addEventListener("click", () => {
        this.draw.changeMode("draw_rectangle");
      });

      // Add the button to the map draw control group
      const controlGroups = document.querySelectorAll(".mapboxgl-ctrl-group");
      // Unfortunately Mapbox doesn't differentate between the control groups
      // So we have to assume that the first control group is zoom controls,
      // and the second is the draw controls.
      if (controlGroups && controlGroups.length > 1) {
        // Append the button to the second control group if it exists,
        // And place it on top so it precedes the draw trash icon.
        controlGroups[1].insertBefore(button, controlGroups[1].firstChild);
      } else if (controlGroups.length === 1) {
        // Fallback to the first control group if there's only one
        // (add at the end of the group if so)
        controlGroups[0].appendChild(button);
      }

      // Add OSM layers if enabled
      if (this.osmEnabled) {
        this.addOSMLayers();
      }
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

.bbox-draw {
  position: absolute;
  top: 150px;
  right: 10px;
  z-index: 1000;
}
</style>

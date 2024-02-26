<template>
    <div id="map">
    </div>    
</template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  import MapboxDraw from "@mapbox/mapbox-gl-draw";
  import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';

  import "mapbox-gl/dist/mapbox-gl.css";
  import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
  
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
        draw: null
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
        maxZoom: 16
      });
  
      this.$map.on("load", () => {
        // Navigation Control (zoom buttons and compass)
        const nav = new mapboxgl.NavigationControl();
        this.$map.addControl(nav, "top-right");

        // Mapbox Draw for adding bounding box
        this.draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            trash: true
          },
          modes: {
            ...MapboxDraw.modes,
            draw_rectangle: DrawRectangle
          }
        });

        this.$map.addControl(this.draw);

        this.$map.on('draw.create', (e) => {
          const bbox = e.features[0].geometry.coordinates[0];
          const bounds = bbox.map((coord) => {
            return {
              lat: coord[1],
              lng: coord[0]
            }
          });
          this.$emit('update:params', {param: 'Bounds', value: bounds});
          console.log('Bounds:', bounds);
        });
        
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

        // Create a custom bbox-draw button
        const button = document.createElement('button');
        button.className = 'mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon';
        button.id = 'bbox-draw';
        button.title = 'Draw Rectangle';

        // Add event listener for bbox-draw button
        button.addEventListener('click', () => {
          this.draw.changeMode('draw_rectangle');
        });

        // Add the button to the map draw control group
        const controlGroups = document.querySelectorAll('.mapboxgl-ctrl-group');
        if (controlGroups && controlGroups.length > 1) {
          // Append the button to the second control group if it exists
          controlGroups[1].insertBefore(button, controlGroups[1].firstChild);
        } else if (controlGroups.length === 1) {
          // Fallback to the first control group if there's only one
          controlGroups[0].appendChild(button);
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
  
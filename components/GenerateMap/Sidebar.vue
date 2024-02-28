<template>
  <div class="sidebar">
      <h1 class="text-xl font-bold text-gray-800 mb-2">
        MapPacker: Generate Offline Map
      </h1>
      <p class="mb-2">
        <em>Use this interface to submit a request to generate an offline map.</em>
      </p>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Title <span class="text-red-600">*</span></label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            required
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            class="input-field"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="mapStyle">Map Style <span class="text-red-600">*</span></label>
          <select
            id="mapStyle"
            v-model="form.selectedStyle"
            class="input-field"
          >
            <option
              v-for="style in dynamicMapStyles"
              :key="style.value"
              :value="style.value"
            >
              {{ style.name }}
            </option>
          </select>
        </div>

        <div v-if="form.selectedStyle.includes('/api/mapstyle/planet/')">
          <div class="form-group">
            <label for="planetMonthYear"
              >Planet Visual Basemap: Month & Year</label
            >
            <input
              type="month"
              id="planetMonthYear"
              v-model="form.planetMonthYear"
              :max="maxPlanetMonthYear"
              class="input-field"
            />
          </div>
        </div>

        <div
          v-if="
            form.selectedStyle === 'mapbox://styles/mapbox/satellite-v9' ||
            !form.selectedStyle.includes('mapbox')
          "
          class="form-group flex items-center"
        >
          <input
            type="checkbox"
            id="osmLabels"
            v-model="form.openstreetmap"
            class="input-field osm-checkbox"
          />
          <label for="osmLabels" class="ml-2"
            >Include OSM Data (not shown on map)</label
          >
        </div>

        <div class="form-group">
          <label
            >Maximum Zoom Level (0 - 16)
            <span class="text-red-600">*</span></label
          >
          <vue-slider
            v-model="form.maxZoom"
            :min="0"
            :max="16"
            :dot-size="14"
            :tooltip="'always'"
            :height="6"
            class="slider"
          ></vue-slider>
        </div>

        <div class="form-group">
          <label for="bbox">Offline Map Bounding Box (draw on map) <span class="text-red-600">*</span></label>
          <textarea
            type="text"
            v-model="form.selectedBounds"
            id="bbox"
            required
            class="code-block"
            @keydown.prevent
          />
        </div>

        <!-- Show estimated number of tiles -->
        <!-- Note that filesize of each tile varies and it's quite tricky to correctly approximate -->
        <!-- See https://github.com/mapbox/mapbox-gl-native/issues/4258 -->
        <div v-if="form.maxZoom && form.selectedBounds">
        <p class="italic">
          Estimated number of tiles:
          {{ estimatedTiles.toLocaleString() }}
        </p>
        <p v-if="estimatedTiles > 100000" class="text-red-600 mt-2">
          <span class="font-bold">Warning:</span> You are requesting over 100,000 tiles.
          Note that this will generate a very large offline map file.
          Please also make sure you will not exceed your tile quota for the map style API, or run into unexpected costs.
        </p>
        </div>

        <button type="submit" class="submit-button">Submit Request</button>
      </form>

  </div>
</template>

<script>
import { calculatePlanetMonthYear } from "@/src/utils";

import VueSlider from "vue-slider-component";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  components: { VueSlider },
  props: [
    "availableMapStyles",
    "customMapboxStyle",
    "mapboxAccessToken",
    "mapBounds",
    "mapStyle",
  ],
  data() {
    return {
      mapStyles: [
        {
          name: "Mapbox Satellite",
          value: "mapbox://styles/mapbox/satellite-v9",
        },
        {
          name: "Mapbox Satellite Streets",
          value: "mapbox://styles/mapbox/satellite-streets-v12",
        },
        { name: "Mapbox Custom Style", value: this.customMapboxStyle },
      ],
      form: {
        title: "",
        description: "",
        selectedBounds: this.mapBounds,
        selectedStyle: this.customMapboxStyle,
        planetMonthYear: calculatePlanetMonthYear(),
        maxZoom: 8,
        estimatedTiles: 0
      },
    };
  },
  watch: {
    // Watch for changes to the map's style and bounds props
    mapBounds(newVal) {
      this.form.selectedBounds = newVal;
    },
    mapStyle(newVal) {
      this.form.selectedStyle = newVal;
    },
    estimatedTiles(newVal) {
      this.form.estimatedTiles = newVal;
    },

    // Track and emit changes to map parameters in the sidebar form,
    // So that the parent component can update the map
    "form.selectedStyle": function (newVal) {
      this.$emit("updateMapParams", { param: "Style", value: newVal });
    },
    "form.planetMonthYear": function (newVal) {
      if (this.form.selectedStyle.includes("/api/mapstyle/planet/")) {
        const [year, month] = newVal.split("-");
        if (year && month) {
          this.form.selectedStyle = `/api/mapstyle/planet/${year}/${month}`;
        }
      }
    },
  },
  methods: {
    fetchMapStyles() {
      // Add available map styles to the mapStyles array
      this.mapStyles = this.mapStyles.concat(
        this.availableMapStyles.map((style) => {
          return {
            name: style.name,
            value: style.url,
          };
        }),
      );
      // Sort map styles by name
      this.mapStyles.sort((a, b) => a.name.localeCompare(b.name));
    },
    estimateNumberOfTiles(maxZoom, boundsStr) {
      const bounds = boundsStr.split(",").map(Number);

      // Convert degrees to radians
      const degToRad = (degrees) => degrees * (Math.PI / 180);

      // Calculate the number of tiles for a given zoom level and bounds
      const tilesAtZoom = (zoom, [west, south, east, north]) => {
        const tileCount = (lat, lon, zoom) => {
          const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
          const y = Math.floor(
            ((1 -
              Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) /
                Math.PI) /
              2) *
              Math.pow(2, zoom),
          );
          return { x, y };
        };

        const topLeft = tileCount(north, west, zoom);
        const bottomRight = tileCount(south, east, zoom);

        const tileWidth = Math.abs(bottomRight.x - topLeft.x) + 1;
        const tileHeight = Math.abs(bottomRight.y - topLeft.y) + 1;

        return tileWidth * tileHeight;
      };

      // Sum the number of tiles from zoom level 0 to maxZoom
      let totalTiles = 0;
      for (let zoom = 0; zoom <= maxZoom; zoom++) {
        totalTiles += tilesAtZoom(zoom, bounds);
      }

      return totalTiles;
    },
    submitForm() {
      this.$emit("formSubmitted", this.form);
    },
  },
  computed: {
    dynamicMapStyles() {
      let styles = [...this.mapStyles];
      if (
        this.form.selectedStyle.includes("/api/mapstyle/planet/") &&
        this.form.selectedStyle.length > "/api/mapstyle/planet/".length
      ) {
        styles = styles.filter(
          (style) => style.value !== "/api/mapstyle/planet/",
        );
        styles.push({
          name: "Planet Monthly Visual Basemap",
          value: this.form.selectedStyle,
        });
      }
      return styles;
    },
    maxPlanetMonthYear() {
      return calculatePlanetMonthYear();
    },
    estimatedTiles() {
      return this.estimateNumberOfTiles(this.form.maxZoom, this.form.selectedBounds);
    }
  },
  mounted() {
    this.fetchMapStyles();
  },
};
</script>

<template>
  <div class="sidebar">
    <h1 class="text-xl font-bold text-gray-800 mb-2">
      MapPacker: Generate Offline Map
    </h1>
    <p class="mb-2">
      <em
        >Use this interface to submit a request to generate an offline map.</em
      >
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
        <label for="mapStyle"
          >Map Style <span class="text-red-600">*</span></label
        >
        <select id="mapStyle" v-model="selectedStyleKey" class="input-field">
          <option
            v-for="style in this.mapStyles"
            :key="style.key"
            :value="style.key"
          >
            {{ style.name }}
          </option>
        </select>
      </div>

      <div v-if="selectedStyleKey === 'mapbox-custom'" class="form-group">
        <label for="customMapboxStyle">Your Mapbox Style URL</label>
        <input
          type="text"
          id="customMapboxStyle"
          v-model="customMapboxStyleUrl"
          placeholder="mapbox://styles/user/styleId"
          class="input-field"
        />
        <button
          type="button"
          class="render-button"
          @click="renderCustomStyle"
          :disabled="!isValidCustomMapboxStyleUrl"
        >
          Render
        </button>
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
            :min="minPlanetMonthYear"
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
        <label for="bbox"
          >Offline Map Bounding Box <span class="text-red-600">*</span></label
        >
        <p class="text-gray-400 mb-1">
          <em
            >Click or press the
            <img
              src="/polygon.svg"
              alt="Polygon Icon"
              style="display: inline-block; vertical-align: middle"
            />
            button on the top right of the screen, and draw an area on the
            map.</em
          >
        </p>
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
      <div v-if="form.maxZoom && form.selectedBounds">
        <p class="italic">
          Estimated number of tiles:
          {{ estimatedTiles.toLocaleString() }}
        </p>
        <p
          v-if="estimatedTiles > 100000 && estimatedTiles < 275000"
          class="text-red-600 mt-2"
        >
          <span class="font-bold">Warning:</span> You are requesting over
          100,000 tiles. Note that this will generate a very large offline map
          file. Please also make sure you will not exceed your tile quota for
          the map style API, or run into unexpected costs.
        </p>
      </div>

      <!-- Show warning if estimated tiles exceed limit
        We want to set a 500 megabytes limit for e.g. optimal functionality in Mapeo Mobile.
        It's not possible to estimate the exact size of a tile, so we use a reasonable 
        minimum filesize estimate of 18,137 bytes per tile (512px).
        500 megabytes = 500,000,000 / 18,137 = 275,679, rounded down to 275,000 -->
      <div v-if="estimatedTiles > 275000" class="text-red-600 mt-2">
        <span class="font-bold">Warning:</span> You are requesting over 275,000
        tiles. This exceeds the permitted number of tiles. Please reduce the
        bounding box or zoom level.
      </div>

      <button
        type="submit"
        :disabled="estimatedTiles > 275000"
        class="submit-button"
        :class="{ 'submit-button-disabled': estimatedTiles > 275000 }"
      >
        Submit Request
      </button>
    </form>
  </div>
</template>

<script>
import { calculateMaxPlanetMonthYear } from "@/src/utils";

// This specific pattern of importing vue-slider-component follows the official
// documentation for server-side rendering: https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  components: { VueSlider },
  props: ["availableMapStyles", "mapboxAccessToken", "mapBounds", "mapStyle"],
  data() {
    return {
      customMapboxStyleUrl: "",
      mapStyles: [],
      form: {
        title: "",
        description: "",
        selectedBounds: this.mapBounds,
        selectedStyle: this.mapStyle,
        selectedStyleKey: null,
        planetMonthYear: calculateMaxPlanetMonthYear(),
        maxPlanetMonthYear: calculateMaxPlanetMonthYear(),
        maxZoom: 8,
        estimatedTiles: 0,
      }
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
      if (newVal.includes("/api/mapstyle/planet/")) {
        const [year, month] = this.form.planetMonthYear.split("-");
        if (!year || !month) {
          this.form.planetMonthYear = calculateMaxPlanetMonthYear();
        }
      }
      if (newVal !== "/api/mapstyle/mapbox-custom/") {
        this.$emit("updateMapParams", { param: "Style", value: newVal });
      }
    },
    "form.planetMonthYear": function (newVal) {
      if (this.form.selectedStyle.includes("/api/mapstyle/planet/")) {
        const [year, month] = newVal.split("-");
        if (year && month) {
          this.form.selectedStyle = `/api/mapstyle/planet/${year}/${month}`;

          // remove planet from existing mapstyles
          this.mapStyles = this.mapStyles.filter(
            (style) => style.key !== "planet",
          );

          this.mapStyles.push({
            name: "Planet Monthly Visual Basemap",
            key: "planet",
            value: this.form.selectedStyle,
          });
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
            key: style.key,
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
    renderCustomStyle() {
      if (/^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(this.customMapboxStyleUrl)) {
        this.form.selectedStyle = this.customMapboxStyleUrl;
        this.selectedStyleKey = "mapbox-custom";
        this.$emit("updateMapParams", { param: "Style", value: this.customMapboxStyleUrl });
      }
    },
    submitForm() {
      let formToSubmit = { ...this.form, selectedStyle: this.selectedStyleKey };

      // Remove planetMonthYear if the selected style is not planet
      if (this.selectedStyleKey !== "planet") {
        delete formToSubmit.planetMonthYear;
      }

      // If the selected style is mapbox, include the selected style url
      if (this.selectedStyleKey === "mapbox") {
        formToSubmit.mapboxStyle = this.form.selectedStyle.replace(
          "mapbox://styles/",
          "",
        );
      }

      // If the selected style is custom-mapbox, include the custom Mapbox Style URL
      if (this.selectedStyleKey === "mapbox-custom") {
        formToSubmit.mapboxStyle = this.customMapboxStyleUrl;
      }

      formToSubmit.type = "new_request";

      this.$emit("formSubmitted", formToSubmit);
    },
  },
  computed: {
    selectedStyleKey: {
      get() {
        const selectedStyle = this.mapStyles.find(
          (style) => style.value === this.form.selectedStyle,
        );
        return selectedStyle ? selectedStyle.key : (this.form.selectedStyle === this.customMapboxStyleUrl ? "mapbox-custom" : null);
      },
      set(key) {
        const selectedStyle = this.mapStyles.find((style) => style.key === key);
        if (selectedStyle) {
          this.form.selectedStyle = selectedStyle.value;
        }
      },
    },
    minPlanetMonthYear() {
      return '2020-09'; // The first month we have Planet NICFI monthly basemaps
    },
    maxPlanetMonthYear() {
      return calculateMaxPlanetMonthYear();
    },
    estimatedTiles() {
      return this.estimateNumberOfTiles(
        this.form.maxZoom,
        this.form.selectedBounds,
      );
    },
    isValidCustomMapboxStyleUrl() {
      return /^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(this.customMapboxStyleUrl);
    },
  },
  mounted() {
    this.fetchMapStyles();
  },
};
</script>
<style scoped>
.render-button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 6px 9px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.render-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.render-button:not(:disabled):hover {
  background-color: #45a049;
}
</style>
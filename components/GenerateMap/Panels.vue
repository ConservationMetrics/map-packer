<template>
  <div>
    <div class="sidebar">
      <h1 class="text-xl font-bold text-gray-800 mb-2">MapPacker: Generate Offline Map</h1>
      <p class="mb-2"><em>Use this tool to send a request to generate an offline map.</em></p>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="title">Title <span class="text-red-600">*</span></label>
          <input type="text" id="title" v-model="form.title" required class="input-field" />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" v-model="form.description" class="input-field"></textarea>
        </div>

        <div class="form-group">
          <label for="mapStyle">Map Style</label>
          <select id="mapStyle" v-model="form.editableStyle" class="input-field">
            <option v-for="style in dynamicMapStyles" :key="style.value" :value="style.value">{{ style.name }}</option>
          </select>
        </div>

        <div v-if="form.editableStyle.includes('/api/mapstyle/planet/')">
          <div class="form-group">
            <label for="planetMonthYear">Planet Visual Basemap: Month & Year</label>
            <input type="month" id="planetMonthYear" v-model="form.planetMonthYear" :max="maxPlanetMonthYear"
              class="input-field" />
          </div>
        </div>

        <div v-if="form.editableStyle === 'mapbox://styles/mapbox/satellite-v9' || !form.editableStyle.includes('mapbox')"
          class="form-group flex items-center">
          <input type="checkbox" id="osmLabels" v-model="form.openstreetmap" class="input-field osm-checkbox" />
          <label for="osmLabels" class="ml-2">Include OSM Data (not shown on map)</label>
        </div>

        <div class="form-group">
          <label>Maximum Zoom Level (0 - 16) <span class="text-red-600">*</span></label>
          <vue-slider v-model="form.maxZoom" :min="0" :max="16" :dot-size="14" :tooltip="'always'" :height="6"
            class="slider"></vue-slider>
        </div>

        <div class="form-group">
          <label for="bbox">Offline Map Bounding Box (draw on map)</label>
          <textarea type="text" v-model="form.editableBounds" id="bbox" disabled class="code-block" />
        </div>

        <!-- Show estimated number of tiles -->
        <!-- Note that filesize of each tile varies and it's quite tricky to correctly approximate -->
        <!-- See https://github.com/mapbox/mapbox-gl-native/issues/4258 -->
        <p v-if="form.maxZoom && form.editableBounds" class="italic">Estimated number of tiles: {{
          estimateNumberOfTiles(form.maxZoom, form.editableBounds) }}</p>

        <button type="submit" class="submit-button">Submit Request</button>
      </form>
    </div>
    <div class="map-navigation">
      <h2 class="text-xl font-bold text-gray-800 mb-2">Map controls</h2>
      <div class="form-group">
        <label>Zoom level (0 - 16) <span class="text-red-600">*</span></label>
        <vue-slider v-model="form.editableZoom" :min="0" :max="16" :dot-size="14" :tooltip="'always'" :height="6"
          class="slider"></vue-slider>
      </div>

      <div class="form-group flex">
        <div class="flex-grow mr-2">
          <label for="centerLat">Center lat</label>
          <input type="number" step="0.000001" id="editableLatitude" v-model.number="form.editableLatitude" required
            :min="-90" :max="90" class="input-field" />
        </div>
        <div class="flex-grow">
          <label for="centerLng">Center long</label>
          <input type="number" step="0.000001" id="editableLongitude" v-model.number="form.editableLongitude" required
            :min="-180" :max="180" class="input-field" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculatePlanetMonthYear } from "@/src/utils";

import VueSlider from 'vue-slider-component';
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

export default {
  components: { VueSlider },
  props: [
    "availableMapStyles",
    "customMapboxStyle",
    "mapboxAccessToken",
    "mapBounds",
    "mapLatitude",
    "mapLongitude",
    "mapStyle",
    "mapZoom",
  ],
  data() {
    return {
      mapStyles: [
        { name: "Mapbox Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
        { name: "Mapbox Satellite Streets", value: "mapbox://styles/mapbox/satellite-streets-v12" },
        { name: "Mapbox Custom Style", value: this.customMapboxStyle }
      ],
      form: {
        title: '',
        description: '',
        editableBounds: this.mapBounds,
        editableLatitude: this.mapLatitude,
        editableLongitude: this.mapLongitude,
        editableStyle: this.customMapboxStyle,
        editableZoom: this.mapZoom,
        planetMonthYear: calculatePlanetMonthYear(),
        maxZoom: 8,
      },
    };
  },
  watch: {
    // Watch for changes to the map's latitude, longitude, zoom, and style props
    mapBounds(newVal) {
      this.form.editableBounds = newVal;
    },
    mapLatitude(newVal) {
      this.form.editableLatitude = newVal;
    },
    mapLongitude(newVal) {
      this.form.editableLongitude = newVal;
    },
    mapStyle(newVal) {
      this.form.editableStyle = newVal;
    },
    mapZoom(newVal) {
      this.form.editableZoom = newVal;
    },

    // Track and emit changes to map parameters in the sidebar form, 
    // So that the parent component can update the map
    'form.editableLatitude': function (newVal) {
      this.$emit('updateMapParams', { param: 'Latitude', value: newVal });
    },
    'form.editableLongitude': function (newVal) {
      this.$emit('updateMapParams', { param: 'Longitude', value: newVal });
    },
    'form.editableStyle': function (newVal) {
      this.$emit('updateMapParams', { param: 'Style', value: newVal });
    },
    'form.editableZoom': {
      handler(newVal) {
        this.$emit('updateMapParams', { param: 'Zoom', value: newVal });
      },
      deep: true
    },
    'form.planetMonthYear': function (newVal) {
      if (this.form.editableStyle.includes('/api/mapstyle/planet/')) {
        const [year, month] = newVal.split('-');
        if (year && month) {
          this.form.editableStyle = `/api/mapstyle/planet/${year}/${month}`;
        }
      }
    }
  },
  methods: {
    fetchMapStyles() {
      // Add available map styles to the mapStyles array
      this.mapStyles = this.mapStyles.concat(this.availableMapStyles.map(style => {
        return {
          name: style.name,
          value: style.url
        };
      }));
      // Sort map styles by name
      this.mapStyles.sort((a, b) => a.name.localeCompare(b.name));
    },
    estimateNumberOfTiles(maxZoom, boundsStr) {
      const bounds = boundsStr.split(',').map(Number);

      // Convert degrees to radians
      const degToRad = degrees => degrees * (Math.PI / 180);

      // Calculate the number of tiles for a given zoom level and bounds
      const tilesAtZoom = (zoom, [west, south, east, north]) => {
        const tileCount = (lat, lon, zoom) => {
          const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
          const y = Math.floor((1 - Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) / Math.PI) / 2 * Math.pow(2, zoom));
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
      this.$emit('formSubmitted', this.form);
    }
  },
  computed: {
    dynamicMapStyles() {
      let styles = [...this.mapStyles];
      if (this.form.editableStyle.includes('/api/mapstyle/planet/') && this.form.editableStyle.length > '/api/mapstyle/planet/'.length) {
        styles = styles.filter(style => style.value !== '/api/mapstyle/planet/');
        styles.push({ name: "Planet Monthly Visual Basemap", value: this.form.editableStyle });
      }
      return styles;
    },
    maxPlanetMonthYear() {
      return calculatePlanetMonthYear();
    }
  },
  mounted() {
    this.fetchMapStyles();
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

.map-navigation {
  position: fixed;
  bottom: 30px;
  right: 10px;
  width: 250px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: none;
  z-index: 1000;
  border-radius: 6px;

  .input-field {
    padding: 5px !important;
  }

  .form-group {
    margin-bottom: 0px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    height: 50%;
    width: 100%;
    bottom: 0;
    top: auto;
  }

  .map-navigation {
    display: none;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group.flex {
  display: flex;
}

.input-field {
  flex-grow: 1;
}

.flex-grow {
  flex: 1;
}

.flex-grow.mr-2 {
  margin-right: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
}

.osm-checkbox {
  width: 20px !important;
  margin: 0;
  flex-grow: 0;
}

.slider-container {
  display: flex;
  justify-content: space-between;
}

.slider {
  width: calc(50% - 8px);
  margin: 10px 0;
}

.inline-fields>div {
  display: inline-block;
  width: calc(50% - 10px);
  margin-right: 10px;
}

.code-block {
  width: 100%;
  padding: 12px 20px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  resize: none;
  overflow: auto;
  min-height: 50px;
  line-height: 1.5;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #45a049;
}
</style>

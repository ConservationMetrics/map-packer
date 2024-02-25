<template>
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
        <select id="mapStyle" v-model="form.localStyle" class="input-field">
          <option v-for="style in dynamicMapStyles" :key="style.value" :value="style.value">{{ style.name }}</option>
        </select>
      </div>

      <div v-if="form.localStyle.includes('/api/mapstyle/planet/')">
        <div class="form-group">
          <label for="planetMonthYear">Planet Visual Basemap: Month & Year</label>
          <input type="month" id="planetMonthYear" v-model="form.planetMonthYear" :max="maxPlanetMonthYear" class="input-field" />
        </div>
      </div>

      <div class="form-group">
        <label>Zoom Level (0 - 16) <span class="text-red-600">*</span></label>
        <vue-slider v-model="form.localZoom" :min="0" :max="16" :dot-size="14" :tooltip="'always'" :height="6"
          class="slider"></vue-slider>
      </div>

      <div class="form-group flex">
        <div class="flex-grow mr-2">
          <label for="centerLat">Center Latitude</label>
          <input type="number" step="0.000001" id="localLatitude" v-model.number="form.localLatitude" required :min="-90"
            :max="90" class="input-field" />
        </div>
        <div class="flex-grow">
          <label for="centerLng">Center Longitude</label>
          <input type="number" step="0.000001" id="localLongitude" v-model.number="form.localLongitude" required :min="-180"
            :max="180" class="input-field" />
        </div>
      </div>

      <button type="submit" class="submit-button">Submit Request</button>
    </form>
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
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "customMapStyle",
    "mapStyle",
    "mapZoom",
    "availableMapStyles"
  ],
  data() {
    return {
      mapStyles: [
        { name: "Mapbox Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
        { name: "Mapbox Satellite Streets", value: "mapbox://styles/mapbox/satellite-streets-v12" },
        { name: "Mapbox Custom Style", value: this.customMapStyle }
      ],
      form: {
        title: '',
        description: '',
        localZoom: this.mapZoom,
        localLatitude: this.mapLatitude,
        localLongitude: this.mapLongitude,
        localStyle: this.mapStyle,
        planetMonthYear: calculatePlanetMonthYear(),
      },
    };
  },
  watch: {
    mapLatitude(newVal) {
      this.form.localLatitude = newVal;
    },
    mapLongitude(newVal) {
      this.form.localLongitude = newVal;
    },
    mapZoom(newVal) {
      this.form.localZoom = newVal;
    },
    mapStyle(newVal) {
      this.form.localStyle = newVal;
    },
    'form.localZoom': {
      handler(newVal) {
        this.$emit('update:params', {param: 'Zoom', value: newVal});
      },
      deep: true
    },
    'form.localLatitude': function (newVal) {
      this.$emit('update:params', {param: 'Latitude', value: newVal});
    },
    'form.localLongitude': function (newVal) {
      this.$emit('update:params', {param: 'Longitude', value: newVal});
    },
    'form.localStyle': function (newVal) {
      this.$emit('update:params', {param: 'Style', value: newVal});
    },
    'form.planetMonthYear': function(newVal) {
      if (this.form.localStyle.includes('/api/mapstyle/planet/')) {
        const [year, month] = newVal.split('-');
        if (year && month) {
          this.form.localStyle = `/api/mapstyle/planet/${year}/${month}`;
        }
      }
    },
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
    submitForm() {
      this.$emit('formSubmitted', this.form);
    }
  },
  computed: {
    dynamicMapStyles() {
      let styles = [...this.mapStyles];
      if (this.form.localStyle.includes('/api/mapstyle/planet/') && this.form.localStyle.length > '/api/mapstyle/planet/'.length) {
        styles = styles.filter(style => style.value !== '/api/mapstyle/planet/');
        styles.push({ name: "Planet Monthly Visual Basemap", value: this.form.localStyle });
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

@media (max-width: 768px) {
  .sidebar {
    height: 50%;
    width: 100%;
    bottom: 0;
    top: auto;
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
  /* Ensure inputs take up available space */
}

.flex-grow {
  flex: 1;
  /* Allow children to grow to fill space */
}

.flex-grow.mr-2 {
  margin-right: 0.5rem;
  /* Add some spacing between the latitude and longitude fields */
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
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

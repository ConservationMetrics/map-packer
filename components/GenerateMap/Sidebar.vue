<template>
  <div class="sidebar">
    <h1 class="text-xl font-bold text-gray-800 mb-2">
      MapPacker: {{ $t("generateOfflineMap") }}
    </h1>
    <p class="mb-2">
      <em>{{ $t("useInterface") }}</em>
    </p>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">
          {{ $t("title") }} <span class="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          required
          class="input-field"
        />
      </div>

      <div class="form-group">
        <label for="description">{{ $t("description") }}</label>
        <textarea
          id="description"
          v-model="form.description"
          class="input-field"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="mapStyle">
          {{ $t("mapStyle") }} <span class="text-red-600">*</span>
        </label>
        <select id="mapStyle" v-model="selectedStyleKey" class="input-field">
          <option
            v-for="style in mapStyles"
            :key="style.key"
            :value="style.key"
          >
            {{ style.name }}
          </option>
        </select>
      </div>

      <div v-if="selectedStyleKey === 'mapbox-custom'" class="form-group">
        <label for="customMapboxStyle">{{ $t("yourMapboxStyleURL") }}</label>
        <input
          type="text"
          id="customMapboxStyle"
          v-model="customMapboxStyleUrl"
          placeholder="mapbox://styles/user/styleId"
          class="input-field"
        />
        <label for="customMapboxStyle">{{ $t("yourMapboxAccessToken") }}</label>
        <input
          type="text"
          id="mapboxAccessToken"
          v-model="localMapboxAccessToken"
          placeholder="pk.ey…"
          class="input-field"
        />
        <button
          type="button"
          class="render-button"
          @click="renderCustomStyle"
          :disabled="!isValidMapboxStyleAndToken"
        >
          {{ $t("render") }}
        </button>
      </div>

      <div v-if="form.selectedStyle && form.selectedStyle.includes('/api/mapstyle/planet/')">
        <div class="form-group">
          <label for="planetMonthYear">{{ $t("planetBasemap") }}</label>
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
          form.selectedStyle &&
          form.selectedStyle === 'mapbox://styles/mapbox/satellite-v9' ||
          form.selectedStyle && !form.selectedStyle.includes('mapbox')
        "
        class="form-group flex items-center"
      >
        <input
          type="checkbox"
          id="osmLabels"
          v-model="form.openstreetmap"
          class="input-field osm-checkbox"
          @change="toggleOSM"
        />
        <label for="osmLabels" class="ml-2">{{ $t("includeOSMData") }}</label>
      </div>

      <div class="form-group">
        <label>
          {{ $t("maximumZoomLevel") }} (0 - 16)
          <span class="text-red-600">*</span>
        </label>
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
        <label for="bbox">
          {{ $t("offlineMapBoundingBox") }}
          <span class="text-red-600">*</span>
        </label>
        <p class="text-gray-400 mb-1">
          <em>
            {{ $t("clickOrPressThe") }}
            <img
              :src="PolygonIcon"
              alt="Polygon Icon"
              style="display: inline-block; vertical-align: middle"
            />
            {{ $t("buttonThenDraw") }}.
          </em>
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

      <div v-if="form.maxZoom && form.selectedBounds">
        <p class="italic">
          {{ $t("estimatedNumberOfTiles") }}:
          {{ estimatedTiles.toLocaleString() }}
        </p>
        <p
          v-if="estimatedTiles > 100000 && estimatedTiles < 275000"
          class="text-red-600 mt-2"
        >
          <span class="font-bold">{{ $t("Warning") }}:</span>
          {{ $t("over100000Tiles") }}
        </p>
      </div>

      <div v-if="estimatedTiles > 275000" class="text-red-600 mt-2">
        <span class="font-bold">{{ $t("Warning") }}:</span>
        {{ $t("over275000Tiles") }}
      </div>

      <button
        type="submit"
        :disabled="estimatedTiles > 275000"
        class="submit-button"
        :class="{ 'submit-button-disabled': estimatedTiles > 275000 }"
      >
        {{ $t("submitRequest") }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

// This specific pattern of importing vue-slider-component follows the official
// documentation for server-side rendering: https://nightcatsama.github.io/vue-slider-component/#/
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";

import PolygonIcon from '@/assets/polygon.svg'

// Define props
const props = defineProps({
  availableMapStyles: Array,
  mapboxAccessToken: String,
  mapBounds: String,
  mapStyle: String,
})

// Define emits
const emit = defineEmits(['updateMapParams', 'formSubmitted'])

// Set up composables
const { t } = useI18n()

// Set up reactive state
const customMapboxStyleUrl = ref('')
const localMapboxAccessToken = ref(props.mapboxAccessToken)
const mapStyles = ref([])
const form = reactive({
  title: '',
  description: '',
  selectedBounds: props.mapBounds,
  selectedStyle: props.mapStyle,
  selectedStyleKey: null,
  planetMonthYear: calculateMaxPlanetMonthYear(),
  maxPlanetMonthYear: calculateMaxPlanetMonthYear(),
  maxZoom: 8,
  estimatedTiles: 0,
})

// Methods
const fetchMapStyles = () => {
  mapStyles.value = props.availableMapStyles.map((style) => ({
    name: style.name,
    key: style.key,
    value: style.url,
  }))
  mapStyles.value.sort((a, b) => a.name.localeCompare(b.name))
}

const estimateNumberOfTiles = (maxZoom, boundsStr) => {
  const bounds = boundsStr.split(',').map(Number)

  const degToRad = (degrees) => degrees * (Math.PI / 180)

  const tilesAtZoom = (zoom, [west, south, east, north]) => {
    const tileCount = (lat, lon, zoom) => {
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(
        ((1 -
          Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) /
            Math.PI) /
          2) *
          Math.pow(2, zoom)
      )
      return { x, y }
    }

    const topLeft = tileCount(north, west, zoom)
    const bottomRight = tileCount(south, east, zoom)

    const tileWidth = Math.abs(bottomRight.x - topLeft.x) + 1
    const tileHeight = Math.abs(bottomRight.y - topLeft.y) + 1

    return tileWidth * tileHeight
  }

  let totalTiles = 0
  for (let zoom = 0; zoom <= maxZoom; zoom++) {
    totalTiles += tilesAtZoom(zoom, bounds)
  }

  return totalTiles
}

const renderCustomStyle = () => {
  if (/^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(customMapboxStyleUrl.value)) {
    form.selectedStyle = customMapboxStyleUrl.value
    form.selectedStyleKey = 'mapbox-custom'
    emit('updateMapParams', { param: 'Style', value: customMapboxStyleUrl.value })
    emit('updateMapParams', { param: 'AccessToken', value: localMapboxAccessToken.value })
  } else {
    console.error('Invalid Mapbox Style URL')
  }
}

const submitForm = () => {
  const formToSubmit = { ...form, selectedStyle: form.selectedStyleKey }

  if (form.selectedStyleKey !== 'planet') {
    delete formToSubmit.planetMonthYear
  }

  if (form.selectedStyleKey === 'mapbox') {
    formToSubmit.mapboxStyle = form.selectedStyle.replace('mapbox://styles/', '')
  }

  if (form.selectedStyleKey === 'mapbox-streets') {
    formToSubmit.mapboxStyle = form.selectedStyle.replace('mapbox://styles/', '')
  }

  if (form.selectedStyleKey === 'mapbox-custom') {
    formToSubmit.mapboxStyle = customMapboxStyleUrl.value.replace('mapbox://styles/', '')
    formToSubmit.mapboxAccessToken = localMapboxAccessToken.value
  }

  formToSubmit.type = 'new_request'

  emit('formSubmitted', formToSubmit)
}

const toggleOSM = () => {
  emit('updateMapParams', {
    param: 'OsmEnabled',
    value: form.openstreetmap,
  })
}

const selectedStyleKey = computed({
  get() {
    const selectedStyle = mapStyles.value.find(
      (style) => style.value === form.selectedStyle
    )
    return selectedStyle
      ? selectedStyle.key
      : form.selectedStyle === customMapboxStyleUrl.value
      ? 'mapbox-custom'
      : null
  },
  set(key) {
    const selectedStyle = mapStyles.value.find((style) => style.key === key)
    if (selectedStyle) {
      form.selectedStyle = selectedStyle.value
    }
  },
})

const minPlanetMonthYear = computed(() => '2020-09')
const maxPlanetMonthYear = computed(() => calculateMaxPlanetMonthYear())

const estimatedTiles = computed(() => estimateNumberOfTiles(form.maxZoom, form.selectedBounds))

const isValidMapboxStyleAndToken = computed(() => {
  const isValidStyle = /^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(customMapboxStyleUrl.value)
  const isValidToken = /^pk\.ey/.test(localMapboxAccessToken.value)
  return isValidStyle && isValidToken
})

// Watch
watch(() => props.mapBounds, (newVal) => {
  form.selectedBounds = newVal
})

watch(() => props.mapStyle, (newVal) => {
  form.selectedStyle = newVal
})

watch(() => form.selectedStyle, (newVal) => {
  if (newVal && newVal.includes('/api/mapstyle/planet/')) {
    const [year, month] = form.planetMonthYear.split('-')
    if (!year || !month) {
      form.planetMonthYear = calculateMaxPlanetMonthYear()
    }
  }
  if (newVal && newVal !== '/api/mapstyle/mapbox-custom/') {
    emit('updateMapParams', { param: 'Style', value: newVal })
    emit('updateMapParams', { param: 'OsmEnabled', value: false })
    form.openstreetmap = false
  }
})

watch(() => form.planetMonthYear, (newVal) => {
  if (form.selectedStyle && form.selectedStyle.includes('/api/mapstyle/planet/')) {
    const [year, month] = newVal.split('-')
    if (year && month) {
      form.selectedStyle = `/api/mapstyle/planet/${year}/${month}`
      mapStyles.value = mapStyles.value.filter(
        (style) => style.key !== 'planet'
      )
      mapStyles.value.push({
        name: 'Planet Monthly Visual Basemap',
        key: 'planet',
        value: form.selectedStyle,
      })
    }
  }
})

// On mount
onMounted(() => {
  fetchMapStyles()
})
// export default {
//   components: { VueSlider },
//   props: ["availableMapStyles", "mapboxAccessToken", "mapBounds", "mapStyle"],
//   data() {
//     return {
//       customMapboxStyleUrl: "",
//       localMapboxAccessToken: this.mapboxAccessToken,
//       mapStyles: [],
//       form: {
//         title: "",
//         description: "",
//         selectedBounds: this.mapBounds,
//         selectedStyle: this.mapStyle,
//         selectedStyleKey: null,
//         planetMonthYear: calculateMaxPlanetMonthYear(),
//         maxPlanetMonthYear: calculateMaxPlanetMonthYear(),
//         maxZoom: 8,
//         estimatedTiles: 0,
//       },
//     };
//   },
//   watch: {
//     // Watch for changes to the map's style and bounds props
//     mapBounds(newVal) {
//       this.form.selectedBounds = newVal;
//     },
//     mapStyle(newVal) {
//       this.form.selectedStyle = newVal;
//     },
//     estimatedTiles(newVal) {
//       this.form.estimatedTiles = newVal;
//     },

//     // Track and emit changes to map parameters in the sidebar form,
//     // So that the parent component can update the map
//     "form.selectedStyle": function (newVal) {
//       if (newVal.includes("/api/mapstyle/planet/")) {
//         const [year, month] = this.form.planetMonthYear.split("-");
//         if (!year || !month) {
//           this.form.planetMonthYear = calculateMaxPlanetMonthYear();
//         }
//       }
//       if (newVal !== "/api/mapstyle/mapbox-custom/") {
//         this.$emit("updateMapParams", { param: "Style", value: newVal });
//         this.$emit("updateMapParams", { param: "OsmEnabled", value: false });
//         this.form.openstreetmap = false;
//       }
//     },
//     "form.planetMonthYear": function (newVal) {
//       if (this.form.selectedStyle.includes("/api/mapstyle/planet/")) {
//         const [year, month] = newVal.split("-");
//         if (year && month) {
//           this.form.selectedStyle = `/api/mapstyle/planet/${year}/${month}`;

//           // remove planet from existing mapstyles
//           this.mapStyles = this.mapStyles.filter(
//             (style) => style.key !== "planet",
//           );

//           this.mapStyles.push({
//             name: "Planet Monthly Visual Basemap",
//             key: "planet",
//             value: this.form.selectedStyle,
//           });
//         }
//       }
//     },
//   },
//   methods: {
//     fetchMapStyles() {
//       // Add available map styles to the mapStyles array
//       this.mapStyles = this.mapStyles.concat(
//         this.availableMapStyles.map((style) => {
//           return {
//             name: style.name,
//             key: style.key,
//             value: style.url,
//           };
//         }),
//       );
//       // Sort map styles by name
//       this.mapStyles.sort((a, b) => a.name.localeCompare(b.name));
//     },
//     estimateNumberOfTiles(maxZoom, boundsStr) {
//       const bounds = boundsStr.split(",").map(Number);

//       // Convert degrees to radians
//       const degToRad = (degrees) => degrees * (Math.PI / 180);

//       // Calculate the number of tiles for a given zoom level and bounds
//       const tilesAtZoom = (zoom, [west, south, east, north]) => {
//         const tileCount = (lat, lon, zoom) => {
//           const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
//           const y = Math.floor(
//             ((1 -
//               Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) /
//                 Math.PI) /
//               2) *
//               Math.pow(2, zoom),
//           );
//           return { x, y };
//         };

//         const topLeft = tileCount(north, west, zoom);
//         const bottomRight = tileCount(south, east, zoom);

//         const tileWidth = Math.abs(bottomRight.x - topLeft.x) + 1;
//         const tileHeight = Math.abs(bottomRight.y - topLeft.y) + 1;

//         return tileWidth * tileHeight;
//       };

//       // Sum the number of tiles from zoom level 0 to maxZoom
//       let totalTiles = 0;
//       for (let zoom = 0; zoom <= maxZoom; zoom++) {
//         totalTiles += tilesAtZoom(zoom, bounds);
//       }

//       return totalTiles;
//     },
//     renderCustomStyle() {
//       if (
//         /^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(this.customMapboxStyleUrl)
//       ) {
//         this.form.selectedStyle = this.customMapboxStyleUrl;
//         this.selectedStyleKey = "mapbox-custom";
//         this.$emit("updateMapParams", {
//           param: "Style",
//           value: this.customMapboxStyleUrl,
//         });
//         this.$emit("updateMapParams", {
//           param: "AccessToken",
//           value: this.localMapboxAccessToken,
//         });
//       } else {
//         console.error("Invalid Mapbox Style URL");
//       }
//     },
//     submitForm() {
//       let formToSubmit = { ...this.form, selectedStyle: this.selectedStyleKey };

//       // Remove planetMonthYear if the selected style is not planet
//       if (this.selectedStyleKey !== "planet") {
//         delete formToSubmit.planetMonthYear;
//       }

//       // If the selected style is mapbox, include the selected style url
//       if (this.selectedStyleKey === "mapbox") {
//         formToSubmit.mapboxStyle = this.form.selectedStyle.replace(
//           "mapbox://styles/",
//           "",
//         );
//       }

//       // If the selected style is custom-mapbox, include the custom Mapbox Style URL
//       if (this.selectedStyleKey === "mapbox-streets") {
//         formToSubmit.mapboxStyle = this.form.selectedStyle.replace(
//           "mapbox://styles/",
//           "",
//         );
//       }

//       // If the selected style is custom-mapbox, include the custom Mapbox Style URL
//       if (this.selectedStyleKey === "mapbox-custom") {
//         formToSubmit.mapboxStyle = this.customMapboxStyleUrl.replace(
//           "mapbox://styles/",
//           "",
//         );
//         formToSubmit.mapboxAccessToken = this.localMapboxAccessToken;
//       }

//       formToSubmit.type = "new_request";

//       this.$emit("formSubmitted", formToSubmit);
//     },
//     toggleOSM() {
//       this.$emit("updateMapParams", {
//         param: "OsmEnabled",
//         value: this.form.openstreetmap,
//       });
//     },
//   },
//   computed: {
//     selectedStyleKey: {
//       get() {
//         const selectedStyle = this.mapStyles.find(
//           (style) => style.value === this.form.selectedStyle,
//         );
//         return selectedStyle
//           ? selectedStyle.key
//           : this.form.selectedStyle === this.customMapboxStyleUrl
//             ? "mapbox-custom"
//             : null;
//       },
//       set(key) {
//         const selectedStyle = this.mapStyles.find((style) => style.key === key);
//         if (selectedStyle) {
//           this.form.selectedStyle = selectedStyle.value;
//         }
//       },
//     },
//     minPlanetMonthYear() {
//       return "2020-09"; // The first month we have Planet NICFI monthly basemaps
//     },
//     maxPlanetMonthYear() {
//       return calculateMaxPlanetMonthYear();
//     },
//     estimatedTiles() {
//       return this.estimateNumberOfTiles(
//         this.form.maxZoom,
//         this.form.selectedBounds,
//       );
//     },
//     isValidMapboxStyleAndToken() {
//       const isValidStyle = /^mapbox:\/\/styles\/[^\/]+\/[^\/]+$/.test(
//         this.customMapboxStyleUrl,
//       );
//       const isValidToken = /^pk\.ey/.test(this.localMapboxAccessToken);
//       return isValidStyle && isValidToken;
//     },
//   },
//   mounted() {
//     this.fetchMapStyles();
//   },
// };
</script>

<style scoped>
@import '@/components/GenerateMap/style.css';

.render-button {
  background-color: #4caf50; /* Green */
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

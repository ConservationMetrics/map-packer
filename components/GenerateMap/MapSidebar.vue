<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import VueSlider from "vue-3-slider-component";

import PolygonIcon from "@/assets/icons/polygon.svg";

import { calculateMaxPlanetMonthYear, estimateNumberOfTiles } from "@/utils";

import type {
  AvailableMapStyles,
  FormData,
  MapStyleWithValue,
} from "@/types/types";

const props = defineProps<{
  availableMapStyles: AvailableMapStyles;
  mapboxAccessToken: string;
  mapBounds: string;
  mapStyle: string;
}>();

const { t } = useI18n();

onMounted(() => {
  fetchMapStyles();
});

const customMapboxStyleUrl = ref("");
const localMapboxAccessToken = ref(props.mapboxAccessToken);
const localMapStyle = ref(props.mapStyle);
const mapStyles = ref<MapStyleWithValue[]>([]);
const form = reactive<FormData>({
  title: "",
  description: null,
  selectedBounds: props.mapBounds,
  selectedStyle: localMapStyle.value,
  selectedStyleKey: null,
  planetMonthYear: calculateMaxPlanetMonthYear(),
  maxZoom: 8,
  estimatedTiles: null,
  format: "mbtiles",
  mapboxAccessToken: props.mapboxAccessToken,
  overlay: null,
  openstreetmap: false,
  mapboxStyle: null,
  type: null,
});

const fetchMapStyles = () => {
  mapStyles.value = props.availableMapStyles.map((style) => ({
    name: style.name,
    key: style.key,
    value: style.url,
  }));
  mapStyles.value.sort((a, b) => a.name.localeCompare(b.name));
};

const renderCustomStyle = () => {
  if (/^mapbox:\/\/styles\/[^/]+\/[^/]+$/.test(customMapboxStyleUrl.value)) {
    form.selectedStyle = customMapboxStyleUrl.value;
    form.selectedStyleKey = "mapbox-custom";
    emit("updateMapParams", {
      param: "Style",
      value: customMapboxStyleUrl.value,
    });
    emit("updateMapParams", {
      param: "AccessToken",
      value: localMapboxAccessToken.value,
    });
  } else {
    console.error("Invalid Mapbox Style URL");
  }
};

const selectedStyleKey = computed({
  get() {
    const selectedStyle = mapStyles.value.find(
      (style) => style.value === form.selectedStyle,
    );
    return selectedStyle
      ? selectedStyle.key
      : form.selectedStyle === customMapboxStyleUrl.value
        ? "mapbox-custom"
        : null;
  },
  set(key) {
    const selectedStyle = mapStyles.value.find((style) => style.key === key);
    if (selectedStyle) {
      form.selectedStyle = selectedStyle.value;
    }
  },
});

const minPlanetMonthYear = computed(() => "2020-09");
const maxPlanetMonthYear = computed(() => calculateMaxPlanetMonthYear());

const estimatedTiles = computed(() =>
  estimateNumberOfTiles(form.maxZoom, form.selectedBounds),
);

const isValidMapboxStyleAndToken = computed(() => {
  const isValidStyle = /^mapbox:\/\/styles\/[^/]+\/[^/]+$/.test(
    customMapboxStyleUrl.value,
  );
  const isValidToken = /^pk\.ey/.test(localMapboxAccessToken.value);
  return isValidStyle && isValidToken;
});

const emit = defineEmits(["updateMapParams", "formSubmitted"]);

const toggleOSM = () => {
  emit("updateMapParams", {
    param: "OsmEnabled",
    value: form.openstreetmap,
  });
};

const submitForm = () => {
  const formToSubmit = { ...form, selectedStyle: selectedStyleKey.value };

  if (selectedStyleKey.value !== "planet") {
    formToSubmit.planetMonthYear = undefined;
  }

  if (selectedStyleKey.value === "mapbox") {
    formToSubmit.mapboxStyle = form.selectedStyle.replace(
      "mapbox://styles/",
      "",
    );
  }

  if (selectedStyleKey.value === "mapbox-streets") {
    formToSubmit.mapboxStyle = "mapbox/streets-v12";
  }

  if (selectedStyleKey.value === "mapbox-custom") {
    formToSubmit.mapboxStyle = customMapboxStyleUrl.value.replace(
      "mapbox://styles/",
      "",
    );
    formToSubmit.mapboxAccessToken = localMapboxAccessToken.value;
  }

  formToSubmit.type = "new_request";

  emit("formSubmitted", formToSubmit);
};

watch(
  () => props.mapBounds,
  (newVal) => {
    form.selectedBounds = newVal;
  },
);
watch(
  () => props.mapStyle,
  (newVal) => {
    form.selectedStyle = newVal;
  },
);
watch(
  () => form.selectedStyle,
  (newVal) => {
    if (newVal && newVal !== "/api/mapstyle/mapbox-custom/") {
      emit("updateMapParams", { param: "Style", value: newVal });
      emit("updateMapParams", { param: "OsmEnabled", value: false });
      form.openstreetmap = false;
    }
  },
);
watch(
  () => form.planetMonthYear,
  (newVal) => {
    if (
      form.selectedStyle &&
      form.selectedStyle.includes("/api/mapstyle/planet/")
    ) {
      if (newVal) {
        const [year, month] = newVal.split("-");
        if (year && month) {
          form.selectedStyle = `/api/mapstyle/planet/${year}/${month}`;
          mapStyles.value = mapStyles.value.filter(
            (style) => style.key !== "planet",
          );
          mapStyles.value.push({
            name: "Planet Monthly Visual Basemap",
            key: "planet",
            value: form.selectedStyle,
          });
        }
      }
    }
  },
);
</script>

<template>
  <div class="sidebar">
    <h1 class="text-xl font-bold text-gray-800 mb-2">
      MapPacker: {{ t("generateOfflineMap") }}
    </h1>
    <p class="mb-2">
      <em>{{ t("useInterface") }}</em>
    </p>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">
          {{ t("title") }} <span class="text-red-600">*</span>
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
        <label for="description">{{ t("description") }}</label>
        <textarea
          id="description"
          v-model="form.description"
          class="input-field"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="mapStyle">
          {{ t("mapStyle") }} <span class="text-red-600">*</span>
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
        <label for="customMapboxStyle">{{ t("yourMapboxStyleURL") }}</label>
        <input
          type="text"
          id="customMapboxStyle"
          v-model="customMapboxStyleUrl"
          placeholder="mapbox://styles/user/styleId"
          class="input-field"
        />
        <label for="customMapboxStyle">{{ t("yourMapboxAccessToken") }}</label>
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
          {{ t("render") }}
        </button>
      </div>

      <div
        v-if="
          form.selectedStyle &&
          form.selectedStyle.includes('/api/mapstyle/planet/')
        "
      >
        <div class="form-group">
          <label for="planetMonthYear">{{ t("planetBasemap") }}</label>
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
          (form.selectedStyle === 'mapbox://styles/mapbox/satellite-v9' ||
            !form.selectedStyle.includes('mapbox')) &&
          !form.selectedStyle.includes('stadia') &&
          !form.selectedStyle.includes('thunderforest')
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
        <label for="osmLabels" class="ml-2">{{ t("includeOSMData") }}</label>
      </div>

      <div class="form-group">
        <label>
          {{ t("maximumZoomLevel") }} (0 - 16)
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
          {{ t("offlineMapBoundingBox") }}
          <span class="text-red-600">*</span>
        </label>
        <p class="text-gray-400 mb-1">
          <em>
            {{ t("clickOrPressThe") }}
            <PolygonIcon
              alt="Polygon Icon"
              style="display: inline-block; vertical-align: middle"
            />
            {{ t("buttonThenDraw") }}.
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

      <div class="form-group">
        <label for="format">
          {{ t("format") }}
          <span class="text-red-600">*</span>
        </label>
        <div class="flex items-center space-x-6">
          <div>
            <input
              type="radio"
              id="mbtiles"
              value="mbtiles"
              v-model="form.format"
            />
            <label for="mbtiles" class="ml-1.25">MBTiles</label>
          </div>
          <div>
            <input type="radio" id="smp" value="smp" v-model="form.format" />
            <label for="smp" class="ml-1.25">Styled Map Package (SMP)</label>
          </div>
        </div>
      </div>

      <div v-if="form.maxZoom && form.selectedBounds">
        <p class="italic">
          {{ t("estimatedNumberOfTiles") }}:
          {{ estimatedTiles.toLocaleString() }}
        </p>
        <p
          v-if="estimatedTiles > 100000 && estimatedTiles < 275000"
          class="text-red-600 mt-2"
        >
          <span class="font-bold">{{ t("Warning") }}:</span>
          {{ t("over100000Tiles") }}
        </p>
      </div>

      <div v-if="estimatedTiles > 275000" class="text-red-600 mt-2">
        <span class="font-bold">{{ t("Warning") }}:</span>
        {{ t("over275000Tiles") }}
      </div>

      <button
        type="submit"
        :disabled="estimatedTiles > 275000"
        class="submit-button"
        :class="{ 'submit-button-disabled': estimatedTiles > 275000 }"
      >
        {{ t("submitRequest") }}
      </button>
    </form>
  </div>
</template>

<style scoped>
@import "@/components/GenerateMap/style.css";

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

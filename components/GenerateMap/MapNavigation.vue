<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import VueSlider from "vue-3-slider-component";

const props = defineProps({
  mapLatitude: Number,
  mapLongitude: Number,
  mapZoom: Number,
});

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const { t } = useI18n();

const emit = defineEmits(["updateMapParams"]);

const form = ref({
  selectedLatitude: props.mapLatitude,
  selectedLongitude: props.mapLongitude,
  selectedZoom: props.mapZoom,
});

watch(
  () => props.mapLatitude,
  (newVal) => {
    form.value.selectedLatitude = newVal;
  },
);
watch(
  () => props.mapLongitude,
  (newVal) => {
    form.value.selectedLongitude = newVal;
  },
);
watch(
  () => props.mapZoom,
  (newVal) => {
    form.value.selectedZoom = newVal;
  },
);
watch(
  () => form.value.selectedLatitude,
  (newVal) => {
    emit("updateMapParams", { param: "Latitude", value: newVal });
  },
);
watch(
  () => form.value.selectedLongitude,
  (newVal) => {
    emit("updateMapParams", { param: "Longitude", value: newVal });
  },
);
watch(
  () => form.value.selectedZoom,
  (newVal) => {
    emit("updateMapParams", { param: "Zoom", value: newVal });
  },
  { deep: true },
);
</script>

<template>
  <div class="map-navigation">
    <h2 class="text-xl font-bold text-gray-800 mb-2">
      {{ $t("mapControls") }}
    </h2>
    <div class="form-group">
      <label
        >{{ $t("zoomLevel") }} (0 - 16)
        <span class="text-red-600">*</span></label
      >
      <vue-slider
        v-model="form.selectedZoom"
        :min="0"
        :max="16"
        :dot-size="14"
        :tooltip="'always'"
        :height="6"
        class="slider"
      ></vue-slider>
    </div>

    <div class="form-group flex">
      <div class="flex-grow mr-2">
        <label for="centerLat">{{ $t("centerLat") }}</label>
        <input
          type="number"
          step="0.000001"
          id="selectedLatitude"
          v-model.number="form.selectedLatitude"
          required
          :min="-90"
          :max="90"
          class="input-field"
        />
      </div>
      <div class="flex-grow">
        <label for="centerLng">{{ $t("centerLong") }}</label>
        <input
          type="number"
          step="0.000001"
          id="selectedLongitude"
          v-model.number="form.selectedLongitude"
          required
          :min="-180"
          :max="180"
          class="input-field"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/components/GenerateMap/style.css";
</style>

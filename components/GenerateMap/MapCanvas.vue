<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import type { DrawEvent, Coordinate, LonLat } from "@/types/types";

const { t } = useI18n();

const props = defineProps({
  mapboxAccessToken: String,
  mapLatitude: Number,
  mapLongitude: Number,
  mapStyle: String,
  mapZoom: Number,
  osmEnabled: Boolean,
});

const map = ref();
const mapLoaded = ref(false);
const draw = ref();
const selectedLatitude = ref(props.mapLatitude);
const selectedLongitude = ref(props.mapLongitude);
const selectedZoom = ref(props.mapZoom);

const emit = defineEmits(["updateMapParams"]);

onMounted(() => {
  if (!props.mapboxAccessToken) {
    console.error("Mapbox access token is required to render the map.");
    return;
  }
  mapboxgl.accessToken = props.mapboxAccessToken;

  map.value = new mapboxgl.Map({
    container: "map",
    style: props.mapStyle || "mapbox://styles/mapbox/satellite-streets-v12",
    projection: "mercator",
    center: [props.mapLongitude || 0, props.mapLatitude || -15],
    zoom: props.mapZoom || 2.5,
    maxZoom: 16,
  });

  map.value.on("load", () => {
    mapLoaded.value = true;

    const nav = new mapboxgl.NavigationControl();
    map.value.addControl(nav, "top-right");

    draw.value = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        trash: true,
      },
      modes: {
        ...MapboxDraw.modes,
        draw_rectangle: DrawRectangle,
      },
    });

    map.value.addControl(draw.value);

    map.value.on("draw.create", () => {
      if (draw.value.getAll().features.length > 1) {
        draw.value.delete(draw.value.getAll().features[0].id);
      }
    });

    map.value.on("draw.create", (e: DrawEvent) => {
      const bbox = e.features[0].geometry.coordinates[0];
      const bounds = bbox.map((coord: LonLat) => {
        return {
          lat: coord[1],
          lng: coord[0],
        };
      });
      const wsen = getWSENstring(bounds);
      emit("updateMapParams", { param: "Bounds", value: wsen });
    });

    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: "metric",
    });
    map.value.addControl(scale, "bottom-left");

    map.value.on("moveend", () => {
      const center = map.value.getCenter();
      selectedLatitude.value = center.lat;
      selectedLongitude.value = center.lng;
      emit("updateMapParams", { param: "Latitude", value: center.lat });
      emit("updateMapParams", { param: "Longitude", value: center.lng });
    });

    map.value.on("zoomend", () => {
      const zoom = map.value.getZoom();
      selectedZoom.value = zoom;
      emit("updateMapParams", { param: "Zoom", value: zoom });
    });

    const button = document.createElement("button");
    button.className = "mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon";
    button.id = "bbox-draw";
    button.title = "Draw Rectangle";

    button.addEventListener("click", () => {
      draw.value.changeMode("draw_rectangle");
    });

    const controlGroups = document.querySelectorAll(".mapboxgl-ctrl-group");
    if (controlGroups && controlGroups.length > 1) {
      controlGroups[1].insertBefore(button, controlGroups[1].firstChild);
    } else if (controlGroups.length === 1) {
      controlGroups[0].appendChild(button);
    }

    if (props.osmEnabled) {
      addOSMLayers();
    }
  });
});

const getWSENstring = (bounds: Coordinate[]) => {
  if (bounds.length === 0) {
    return t("noCoordinatesProvided");
  }

  let minLat = bounds[0].lat;
  let maxLat = bounds[0].lat;
  let minLng = bounds[0].lng;
  let maxLng = bounds[0].lng;

  bounds.forEach((coord: Coordinate) => {
    if (coord.lat < minLat) minLat = coord.lat;
    if (coord.lat > maxLat) maxLat = coord.lat;
    if (coord.lng < minLng) minLng = coord.lng;
    if (coord.lng > maxLng) maxLng = coord.lng;
  });

  const wsen = `${minLng},${minLat},${maxLng},${maxLat}`;

  return wsen;
};

const addOSMLayers = () => {
  if (!map.value.getSource("osm")) {
    map.value.addSource("osm", {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    });

    map.value.addLayer({
      id: "osm-waterway-lines",
      type: "line",
      source: "osm",
      "source-layer": "waterway",
      paint: {
        "line-width": 2,
        "line-color": "#0000ff", // blue for waterways
      },
    });

    map.value.addLayer({
      id: "osm-highway-lines",
      type: "line",
      source: "osm",
      "source-layer": "road",
      paint: {
        "line-width": 2,
        "line-color": "#a52a2a", // brown for highways
      },
    });

    map.value.addLayer({
      id: "osm-boundary-lines",
      type: "line",
      source: "osm",
      "source-layer": "admin",
      paint: {
        "line-width": 2,
        "line-color": "#ffa500", // orange for boundaries
      },
    });
  }
};

const removeOSMLayers = () => {
  if (map.value.getLayer("osm-waterway-lines")) {
    map.value.removeLayer("osm-waterway-lines");
  }
  if (map.value.getLayer("osm-highway-lines")) {
    map.value.removeLayer("osm-highway-lines");
  }
  if (map.value.getLayer("osm-boundary-lines")) {
    map.value.removeLayer("osm-boundary-lines");
  }
  if (map.value.getSource("osm")) {
    map.value.removeSource("osm");
  }
};

const setMapStyle = (newVal: string) => {
  if (map.value && props.mapboxAccessToken) {
    mapboxgl.accessToken = props.mapboxAccessToken;
    map.value.setStyle(newVal);
  }
};

watch(
  () => props.mapLatitude,
  (newVal) => {
    if (map.value) {
      map.value.setCenter([selectedLongitude.value, newVal]);
    }
  },
);
watch(
  () => props.mapLongitude,
  (newVal) => {
    if (map.value) {
      map.value.setCenter([newVal, selectedLatitude.value]);
    }
  },
);
watch(
  () => props.mapStyle,
  (newVal?: string) => {
    if (newVal) setMapStyle(newVal);
  },
);
watch(
  () => props.mapZoom,
  (newVal) => {
    if (map.value) {
      map.value.setZoom(newVal);
    }
  },
);
watch(
  () => props.osmEnabled,
  (newVal) => {
    if (mapLoaded.value) {
      if (newVal) {
        addOSMLayers();
      } else {
        removeOSMLayers();
      }
    }
  },
);

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<template>
  <div id="map"></div>
</template>

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

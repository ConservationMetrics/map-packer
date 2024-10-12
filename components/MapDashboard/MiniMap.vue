<script setup>
import { ref, onMounted, nextTick } from "vue";
import mapboxgl from "mapbox-gl";

const props = defineProps({
  mapboxAccessToken: String,
  bounds: String,
});

const mapContainer = ref(null);

onMounted(async () => {
  mapboxgl.accessToken = props.mapboxAccessToken;

  const boundsArray = props.bounds
    .split(",")
    .map(Number)
    .reduce((result, value, index, array) => {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);

  await nextTick();

  if (mapContainer.value) {
    const map = new mapboxgl.Map({
      container: mapContainer.value,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [
        (boundsArray[0][0] + boundsArray[1][0]) / 2,
        (boundsArray[0][1] + boundsArray[1][1]) / 2,
      ],
      zoom: 4,
      interactive: false,
    });

    map.on("load", () => {
      map.addLayer({
        id: "bounding-box",
        type: "fill",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [boundsArray[0][0], boundsArray[0][1]],
                  [boundsArray[0][0], boundsArray[1][1]],
                  [boundsArray[1][0], boundsArray[1][1]],
                  [boundsArray[1][0], boundsArray[0][1]],
                  [boundsArray[0][0], boundsArray[0][1]],
                ],
              ],
            },
          },
        },
        paint: {
          "fill-color": "#3BB2D0",
          "fill-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "bounding-box-border",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [boundsArray[0][0], boundsArray[0][1]],
                  [boundsArray[0][0], boundsArray[1][1]],
                  [boundsArray[1][0], boundsArray[1][1]],
                  [boundsArray[1][0], boundsArray[0][1]],
                  [boundsArray[0][0], boundsArray[0][1]],
                ],
              ],
            },
          },
        },
        paint: {
          "line-color": "#3BB2D0",
          "line-width": 2,
          "line-dasharray": [2, 2], // This creates a dotted line
        },
      });
    });
  } else {
    console.error("Map container is not available.");
  }
});
</script>

<template>
  <div ref="mapContainer" style="width: 100%; height: 200px"></div>
</template>

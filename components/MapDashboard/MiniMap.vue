<template>
  <div ref="map" style="width: 100%; height: 200px"></div>
</template>

<script>
import mapboxgl from "mapbox-gl";

export default {
  props: ["bounds"],
  mounted() {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_API_KEY;

    const boundsArray = this.bounds
      .split(",")
      .map(Number)
      .reduce((result, value, index, array) => {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      }, []);

    const map = new mapboxgl.Map({
      container: this.$refs.map,
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
  },
};
</script>

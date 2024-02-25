<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      :mapbox-access-token="mapboxAccessToken"
      :map-style="mapStyle"
      :map-zoom="mapZoom"
      :map-latitude="mapLatitude"
      :map-longitude="mapLongitude"
      :available-map-styles="availableMapStyles"
    />
  </div>
</template>

<script>
import GenerateMap from "~/components/GenerateMap.vue";

export default {
  head() {
    return {
      title: "MapPacker: Map Request Generator",
    };
  },
  components: { GenerateMap },
  async asyncData({ $axios, app }) {
    // Set up the headers for the request
    let headers = {
      "x-api-key": app.$config.apiKey.replace(/['"]+/g, ""),
      "x-auth-strategy": app.$auth.strategy.name,
    };

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/map`, { headers });
      const availableMapStyles = await $axios.$get(`/api/mapstyles`, { headers });
      return {
        dataFetched: true,
        mapboxAccessToken: response.mapboxAccessToken,
        mapStyle: response.mapStyle,
        mapZoom: response.mapZoom,
        mapLatitude: response.mapLatitude,
        mapLongitude: response.mapLongitude,
        availableMapStyles: availableMapStyles,
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error("Error fetching data:", error);
      return {
        dataFetched: false,
      };
    }
  },
};
</script>

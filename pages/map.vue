<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      :availableMapStyles="availableMapStyles"
      :customMapboxStyle="customMapboxStyle"
      :mapboxAccessToken="mapboxAccessToken"
      :mapLatitude="mapLatitude"
      :mapLongitude="mapLongitude"
      :mapZoom="mapZoom"
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
      const availableMapStyles = await $axios.$get(`/api/mapstyles`, {
        headers,
      });
      return {
        dataFetched: true,
        availableMapStyles: availableMapStyles,
        customMapboxStyle: response.mapStyle,
        mapboxAccessToken: response.mapboxAccessToken,
        mapLatitude: response.mapLatitude,
        mapLongitude: response.mapLongitude,
        mapZoom: response.mapZoom,
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

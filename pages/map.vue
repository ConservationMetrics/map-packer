<template>
  <div>
    <GenerateMap 
      v-if="dataFetched"
      :mapbox-access-token="mapboxAccessToken"
      :mapbox-style="mapboxStyle"
      :mapbox-zoom="mapboxZoom"
      :mapbox-latitude="mapboxLatitude"
      :mapbox-longitude="mapboxLongitude"
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
      'x-api-key': app.$config.apiKey.replace(/['"]+/g, ''),
      'x-auth-strategy': app.$auth.strategy.name
    };

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/map`, { headers });
      return { 
        dataFetched: true,
        mapboxAccessToken: response.mapboxAccessToken,
        mapboxStyle: response.mapboxStyle,
        mapboxZoom: response.mapboxZoom,
        mapboxLatitude: response.mapboxLatitude,
        mapboxLongitude: response.mapboxLongitude,
      };
    } catch (error) {
      // Handle errors as appropriate
      console.error('Error fetching data:', error);
      return {
        dataFetched: false
      };
    }
  },
};
</script>

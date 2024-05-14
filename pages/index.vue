<template>
  <div>
    <MapDashboard 
      v-if="dataFetched" 
      :mapbox-access-token="mapboxAccessToken"
      :offline-maps="offlineMaps"
      :offline-maps-uri="offlineMapsUri" 
      @handleMapRequest="handleMapRequest"
    />
  </div>
</template>

<script>
import MapDashboard from "~/components/MapDashboard.vue";

export default {
  head() {
    return {
      title: "MapPacker: Available Offline Maps",
    };
  },
  components: { MapDashboard },
  data() {
    return {
      headers: {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      },
    };
  },
  methods: {
    async handleMapRequest(message) {
      try {
          await this.$axios.$post('/api/maprequest', message, { headers: this.headers });
        } catch (error) {
          console.error("Error submitting request data:", error);
        }
    }
  },
  async asyncData({ $axios, app }) {
    // Set up the headers for the request
    let headers = {
      "x-api-key": app.$config.apiKey.replace(/['"]+/g, ""),
      "x-auth-strategy": app.$auth.strategy.name,
    };

    try {
      // Use the table name in the API request
      const response = await $axios.$get(`/api/data`, { headers });
      return {
        dataFetched: true,
        mapboxAccessToken: response.mapboxAccessToken,
        offlineMaps: response.offlineMaps,
        offlineMapsUri: response.offlineMapsUri,
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

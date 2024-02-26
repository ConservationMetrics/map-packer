<template>
  <div>
    <MapDashboard v-if="dataFetched" :data="data" />
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
        data: response,
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

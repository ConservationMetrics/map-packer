<template>
  <div>
    <MapDashboard
      v-if="dataFetched"
      :mapbox-access-token="mapboxAccessToken"
      :next-cursor="nextCursor"
      :offline-maps="offlineMaps"
      :offline-maps-uri="offlineMapsUri"
      @handleMapRequest="handleMapRequest"
      @loadMore="loadMore"
    />
  </div>
</template>

<script>
import MapDashboard from "~/components/MapDashboard.vue";

export default {
  head() {
    return {
      title: "MapPacker: " + this.$t("availableOfflineMaps"),
    };
  },
  components: { MapDashboard },
  data() {
    return {
      dataFetched: false,
      headers: {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      },
      nextCursor: null,
      offlineMaps: [],
    };
  },
  methods: {
    async handleMapRequest(message) {
      try {
        await this.$axios.$post("/api/maprequest", message, {
          headers: this.headers,
        });
      } catch (error) {
        console.error("Error submitting request data:", error);
      }
    },
    async loadMore() {
      if (!this.nextCursor || this.isLoading) return;

      // To avoid multiple requests at the same time
      this.isLoading = true;

      try {
        const response = await this.$axios.$get(
          `/api/data?cursor=${this.nextCursor}`,
          { headers: this.headers },
        );

        if (response.offlineMaps.length > 0) {
          this.offlineMaps.push(...response.offlineMaps);
          this.nextCursor = response.nextCursor;
        } else {
          this.nextCursor = null;
        }
      } catch (error) {
        console.error("Error fetching more data:", error);
      } finally {
        this.isLoading = false;
      }
    },
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
        nextCursor: response.nextCursor,
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

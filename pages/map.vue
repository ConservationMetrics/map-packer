<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      @handleMapRequest="handleMapRequest"
      :availableMapStyles="availableMapStyles"
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
      title: "MapPacker: " + this.$t("generateOfflineMap"),
    };
  },
  components: { GenerateMap },
  data() {
    return {
      headers: {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      },
    };
  },
  methods: {
    async handleMapRequest(formData) {
      // Function to remove accents and replace non-alphanumeric characters with underscores
      const normalizeFilename = (str) => {
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\W+/g, "_");
      };

      // Transform formData to match the expected database table schema
      const transformedMessage = {
        type: "new_request",
        title: formData.title,
        filename: normalizeFilename(formData.title),
        status: "PENDING",
        description: formData.description,
        min_zoom: 0,
        max_zoom: formData.maxZoom,
        mapbox_style: formData.mapboxStyle,
        planet_monthly_visual: formData.planetMonthYear,
        bounds: formData.selectedBounds,
        style: formData.selectedStyle,
        openstreetmap: formData.openstreetmap,
        number_of_tiles: formData.estimatedTiles,
        created_at: new Date(),
      };

      // Include mapboxAccessToken if it exists
      if (formData.mapboxAccessToken) {
        transformedMessage.apiKey = formData.mapboxAccessToken;
      }

      try {
        await this.$axios.$post("/api/maprequest", transformedMessage, {
          headers: this.headers,
        });
      } catch (error) {
        console.error("Error submitting request data:", error);
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
      const response = await $axios.$get(`/api/map`, { headers });
      const availableMapStyles = await $axios.$get(`/api/mapstyles`, {
        headers,
      });
      return {
        dataFetched: true,
        availableMapStyles: availableMapStyles,
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

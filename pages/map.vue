<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      @handleMapRequest="handleMapRequest"
      :availableMapStyles="availableMapStyles"
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
      availableMapStyles: [],
      dataFetched: false,
      headers: {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      },
      mapLatitude: 0,
      mapLongitude: 0,
      mapZoom: 0,
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
    async fetchData() {
      // Set up the headers for the request
      let headers = {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      };

      try {
        const response = await this.$axios.$get(`/api/map`, { headers });
        const availableMapStyles = await this.$axios.$get(`/api/mapstyles`, {
          headers,
        });
        this.dataFetched = true;
        this.availableMapStyles = availableMapStyles;
        this.mapLatitude = response.mapLatitude,
        this.mapLongitude = response.mapLongitude;
        this.mapZoom = response.mapZoom;
      } catch (error) {
        // Handle errors as appropriate
        console.error("Error fetching data:", error);
        this.dataFetched = false;
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

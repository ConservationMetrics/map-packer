<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      @formSubmitted="handleFormSubmit"
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
  data() {
    return {
      headers: {
        "x-api-key": this.$config.apiKey.replace(/['"]+/g, ""),
        "x-auth-strategy": this.$auth.strategy.name,
      },
    };
  },
  methods: {
    async handleFormSubmit(formData) {
        // Transform formData to match the expected database table schema
        const transformedData = {
          title: formData.title,
          filename: formData.title.replace(/\W+/g, '_'),
          status: "PENDING",
          description: formData.description,
          minzoom: 0,
          maxzoom: formData.maxZoom,
          mapboxstyle: formData.mapboxStyle,
          planet_monthly_visual: formData.planetMonthYear,
          bounds: formData.selectedBounds,
          style: formData.selectedStyle,
          openstreetmap: formData.openstreetmap,
          numberoftiles: formData.estimatedTiles,
          created_at: new Date(),
        };
      
        try {
          await this.$axios.$post('/api/newmaprequest', transformedData, { headers: this.headers });
        } catch (error) {
          console.error("Error submitting form data:", error);
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

<template>
  <div>
    <Panels 
      @formSubmitted="handleFormSubmit" 
      @update:params="updateMapParams"
      :mapLatitude="localLatitude" 
      :mapLongitude="localLongitude"
      :customMapStyle="mapStyle"
      :mapStyle="localStyle" 
      :mapZoom="localZoom" 
      :mapBounds="localBounds"
      :availableMapStyles="availableMapStyles"
    />
    <Map 
      @update:params="updateMapParams"
      :mapboxAccessToken="mapboxAccessToken"
      :mapLatitude="localLatitude"
      :mapLongitude="localLongitude"
      :mapStyle="localStyle"
      :mapZoom="localZoom"
    />
  </div>
</template>

<script>
import Panels from "@/components/GenerateMap/Panels.vue";
import Map from "@/components/GenerateMap/Map.vue";

export default {
  components: { Panels, Map },
  props: [
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "mapStyle",
    "mapZoom",
    "availableMapStyles"
  ],
  data() {
    return {
      localLatitude: this.mapLatitude,
      localLongitude: this.mapLongitude,
      localZoom: this.mapZoom,
      localStyle: this.mapStyle,
      localBounds: '',
    };
  },
  methods: {
    handleFormSubmit(formData) {
      console.log('Received form data:', formData);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === 'number') {
        value = parseFloat(value.toFixed(6));
      }

      this[`local${param}`] = value;
    }
  },
};
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>

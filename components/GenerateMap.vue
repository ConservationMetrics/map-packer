<template>
  <div>
    <Sidebar 
      @formSubmitted="handleFormSubmit" 
      @update:params="updateMapParams"
      :mapboxLatitude="localLatitude" 
      :mapboxLongitude="localLongitude"
      :mapboxStyle="mapboxStyle" 
      :mapboxZoom="localZoom" 
    />
    <Map 
      @update:params="updateMapParams"
      :mapboxAccessToken="mapboxAccessToken"
      :mapboxLatitude="localLatitude"
      :mapboxLongitude="localLongitude"
      :mapboxStyle="mapboxStyle"
      :mapboxZoom="localZoom" 
    />
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Map from "@/components/Map.vue";

export default {
  components: { Sidebar, Map },
  props: [
    "mapboxAccessToken",
    "mapboxLatitude",
    "mapboxLongitude",
    "mapboxStyle",
    "mapboxZoom",
  ],
  data() {
    return {
      localLatitude: this.mapboxLatitude,
      localLongitude: this.mapboxLongitude,
      localZoom: this.mapboxZoom,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      console.log('Received form data:', formData);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;
      value = parseFloat(value.toFixed(6));

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

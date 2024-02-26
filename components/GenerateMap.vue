<template>
  <div>
    <Panels @formSubmitted="handleFormSubmit" @updateMapParams="updateMapParams" :availableMapStyles="availableMapStyles"
      :customMapboxStyle="customMapboxStyle" :mapBounds="editableBounds" :mapLatitude="editableLatitude"
      :mapLongitude="editableLongitude" :mapStyle="editableStyle" :mapZoom="editableZoom" />
    <Map @updateMapParams="updateMapParams" :mapboxAccessToken="mapboxAccessToken" :mapLatitude="editableLatitude"
      :mapLongitude="editableLongitude" :mapStyle="editableStyle" :mapZoom="editableZoom" />
  </div>
</template>

<script>
import Panels from "@/components/GenerateMap/Panels.vue";
import Map from "@/components/GenerateMap/Map.vue";

export default {
  components: { Panels, Map },
  props: [
    "availableMapStyles",
    "customMapboxStyle",
    "mapboxAccessToken",
    "mapLatitude",
    "mapLongitude",
    "mapZoom",
  ],
  data() {
    return {
      editableBounds: '',
      editableLatitude: this.mapLatitude,
      editableLongitude: this.mapLongitude,
      editableStyle: this.mapStyle,
      editableZoom: this.mapZoom,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      // TODO: Send as a POST request to the API
      console.log('Received form data:', formData);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === 'number') {
        value = parseFloat(value.toFixed(6));
      }

      this[`editable${param}`] = value;
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

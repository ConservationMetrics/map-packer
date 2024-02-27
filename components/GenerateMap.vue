<template>
  <div>
    <Sidebar
      @formSubmitted="handleFormSubmit"
      @updateMapParams="updateMapParams"
      :availableMapStyles="availableMapStyles"
      :customMapboxStyle="customMapboxStyle"
      :mapBounds="selectedBounds"
      :mapStyle="selectedStyle"
    />
    <MapNavigation
      @updateMapParams="updateMapParams"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapZoom="selectedZoom"
    />
    <Map
      @updateMapParams="updateMapParams"
      :mapboxAccessToken="mapboxAccessToken"
      :mapLatitude="selectedLatitude"
      :mapLongitude="selectedLongitude"
      :mapStyle="selectedStyle"
      :mapZoom="selectedZoom"
    />
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      Offline map request successfully submitted!
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/GenerateMap/Sidebar.vue";
import MapNavigation from "@/components/GenerateMap/MapNavigation.vue";
import Map from "@/components/GenerateMap/Map.vue";


export default {
  components: { Map, Sidebar, MapNavigation },
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
      selectedBounds: "",
      selectedLatitude: this.mapLatitude,
      selectedLongitude: this.mapLongitude,
      selectedStyle: this.customMapboxStyle,
      selectedZoom: this.mapZoom,
      showModal: false,
    };
  },
  methods: {
    handleFormSubmit(formData) {
      // TODO: Send as a POST request to the API
      console.log("Received form data:", formData);
      this.showModal = true; //
      setTimeout(() => {
        this.$router.push('/');
      }, 3000);
    },
    updateMapParams(updateObj) {
      let { param, value } = updateObj;

      if (typeof value === "number") {
        value = parseFloat(value.toFixed(6));
      }

      this[`selected${param}`] = value;
    },
  },
};
</script>

<!-- CSS rules applying across parent and child components -->
<style scoped>
body {
  margin: 0;
  padding: 0;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  background: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

.map-navigation {
  position: fixed;
  bottom: 30px;
  right: 10px;
  width: 250px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: none;
  z-index: 1000;
  border-radius: 6px;

  .input-field {
    padding: 5px !important;
  }

  .form-group {
    margin-bottom: 0px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    height: 50%;
    width: 100%;
    bottom: 0;
    top: auto;
  }

  .map-navigation {
    display: none;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group.flex {
  display: flex;
}

.input-field {
  flex-grow: 1;
}

.flex-grow {
  flex: 1;
}

.flex-grow.mr-2 {
  margin-right: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
}

.osm-checkbox {
  width: 20px !important;
  margin: 0;
  flex-grow: 0;
}

.slider-container {
  display: flex;
  justify-content: space-between;
}

.slider {
  width: calc(50% - 8px);
  margin: 10px 0;
}

.inline-fields > div {
  display: inline-block;
  width: calc(50% - 10px);
  margin-right: 10px;
}

.code-block {
  width: 100%;
  padding: 12px 20px;
  box-sizing: border-box;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  resize: none;
  overflow: auto;
  min-height: 50px;
  line-height: 1.5;
}

.submit-button {
  background-color: #4caf50;
  color: white;
  padding: 14px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #45a049;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  z-index: 1050;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,.1);
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

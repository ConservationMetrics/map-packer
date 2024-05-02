<template>
  <div class="mt-4 mx-auto w-full max-w-6xl px-4">
    <nuxt-link
      to="/map/"
      class="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200"
      >+ Generate Map</nuxt-link
    >
    <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
      Available Offline Maps
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="map in offlineMaps"
        :key="map.id"
        class="card bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col"
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-2" v-if="map.title">
          {{ map.title }}
        </h2>
        <p class="mb-2 italic" v-if="map.description">{{ map.description }}</p>
        <div v-if="map.filelocation && offlineMapsUri" class="flex mb-2">
          <a
            :href="`${offlineMapsUri}/${map.filelocation}`"
            class="download-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-4"
            >Download</a
          >
          <div>
            <button
              class="copy-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
              @click="copyLinkToClipboard(`${offlineMapsUri}/${map.filelocation}`, map.id)"
            >
              Copy Link
            </button>
            <div
              v-if="tooltipId === (map ? map.id : null)"
              class="tooltip bg-gray-500 text-white py-1 px-2 rounded transition duration-300 ease-in-out"
            >
              Copied!
            </div>
          </div>
        </div>
        <div class="space-y-2 flex-grow">
          <p v-if="map.status">
            <span class="font-bold">Status:</span>
            <span :class="formatStatusColor(map.status)">{{ map.status }}</span>
          </p>
          <p class="text-red-600 break-words" v-if="map.errormessage">
            <span class="font-bold">Error message:</span> {{ map.errormessage }}
          </p>
          <p v-if="map.created_at">
            <span class="font-bold">Requested on:</span>
            {{ formatDate(map.created_at) }}
          </p>
          <p v-if="map.style">
            <span class="font-bold">Map Style:</span> {{ map.style
            }}<span v-if="map.planet_monthly_visual">
              ({{ map.planet_monthly_visual }})</span
            ><span v-if="map.openstreetmap === true">, with OSM labels </span>
          </p>
          <p v-if="map.bounds">
            <span class="font-bold">Bounds:</span> [{{
              formatBounds(map.bounds)
            }}]
          </p>
          <p v-if="map.maxzoom">
            <span class="font-bold">Zoom Level:</span> {{ map.minzoom }}-{{
              map.maxzoom
            }}
          </p>
          <div class="space-y-2 flex-grow" v-if="map.status !== 'PENDING'">
            <h3 class="italic text-lg text-gray-600">Metadata</h3>
            <p v-if="map.workbegun && map.workended">
              <span class="font-bold">Task Duration:</span>
              {{ calculateDuration(map.workbegun, map.workended) }}
            </p>
            <p v-if="map.filesize">
              <span class="font-bold">File Size:</span>
              {{ formatNumber(map.filesize) }} bytes
            </p>
            <p v-if="map.numberoftiles">
              <span class="font-bold">Number of Tiles:</span>
              {{ formatNumber(map.numberoftiles) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { copyLink } from "@/src/utils.ts";

export default {
  props: [
    "offlineMaps",
    "offlineMapsUri"
  ],
  data() {
    return {
      tooltipId: null,
    };
  },
  methods: {
    formatNumber(value) {
      return parseInt(value).toLocaleString();
    },
    formatBounds(bounds) {
      return bounds.split(",").join(", ");
    },
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("en-GB", options);
      return `${formattedDate}`;
    },
    formatStatusColor(status) {
      switch (status) {
        case "FAILED":
          return "font-semibold text-red-500";
        case "PENDING":
          return "font-semibold text-yellow-500";
        case "SUCCEEDED":
          return "font-semibold text-green-500";
        default:
          return "font-semibold text-gray-600";
      }
    },
    calculateDuration(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const duration = endDate - startDate;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration / (1000 * 60)) % 60);
      const seconds = Math.floor((duration / 1000) % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    },
    copyLinkToClipboard(link, id) {
      copyLink(link)
        .then(() => {
          this.tooltipId = id;
          setTimeout(() => {
            this.tooltipId = null;
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    },
  },
};
</script>

<style scoped>
.tooltip {
  position: absolute;
  margin-left: 10px;
  white-space: nowrap;
  transform: translateX(150%) translateY(-110%);
  z-index: 10;
}
</style>

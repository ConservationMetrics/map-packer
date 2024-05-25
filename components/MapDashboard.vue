<template>
  <div class="mt-4 mx-auto w-full max-w-6xl px-4">
    <nuxt-link
      to="/map/"
      class="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 hidden md:block"
      >+ Generate Map</nuxt-link
    >
    <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
      Available Offline Maps
    </h1>
    <nuxt-link
      to="/map/"
      class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 text-center mb-8 md:hidden"
      >+ Generate Map</nuxt-link
    >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="map in offlineMaps"
        :key="map.id"
        class="card relative bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col"
      >
        <button
          v-if="map.status !== 'PENDING'"
          class="delete absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold py-1 px-1 cursor-pointer"
          @click="deleteMap(map.id)"
        >
          X
        </button>
        <h2 class="text-2xl font-bold text-gray-800 mb-2" v-if="map.title">
          {{ map.title }}
        </h2>
        <div class="mb-2" v-if="map.bounds">
          <MiniMap
            :bounds="map.bounds"
            :mapbox-access-token="mapboxAccessToken"
          />
        </div>
        <p class="mb-2 italic" v-if="map.description">{{ map.description }}</p>
        <div class="space-y-2 mb-2">
          <p v-if="map.status">
            <span class="font-bold">Status:</span>
            <span :class="formatStatusColor(map.status)">{{ map.status }}</span>
          </p>
          <p class="text-red-600 break-words" v-if="map.error_message">
            <span class="font-bold">Error message:</span>
            {{ map.error_message }}
          </p>
          <p v-if="map.created_at">
            <span class="font-bold">Requested on:</span>
            {{ formatDate(map.created_at) }}
          </p>
          <p v-if="map.work_ended">
            <span class="font-bold">Finished on:</span>
            {{ formatDate(map.work_ended) }}
          </p>
          <p v-if="map.style">
            <span class="font-bold">Map Style:</span> {{ map.style
            }}<span v-if="map.planet_monthly_visual">
              ({{ map.planet_monthly_visual }})</span
            ><span v-if="map.openstreetmap === true">, with OSM labels </span>
          </p>
          <p v-if="map.max_zoom">
            <span class="font-bold">Zoom Level:</span> {{ map.min_zoom }}-{{
              map.max_zoom
            }}
          </p>
        </div>
        <div v-if="map.error_message" class="flex mb-2">
          <button
            class="copy-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
            @click="resubmitMapRequest(map.id)"
          >
            Resubmit
          </button>
        </div>
        <div v-if="map.file_location && offlineMapsUri" class="flex mb-2">
          <a
            :href="`${offlineMapsUri}/${map.filename}`"
            class="download-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-4"
            >Download</a
          >
          <button
            class="qr-code bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-4"
            @click="toggleQRCode(map.id)"
          >
            QR
          </button>
          <div>
            <button
              class="copy-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
              @click="
                copyLinkToClipboard(`${offlineMapsUri}/${map.filename}`, map.id)
              "
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
        <div v-if="showQRCodeId === map.id" class="flex mb-2">
          <QRCode :value="`${offlineMapsUri}/${map.filename}`" size="300" />
        </div>
        <div class="space-y-2 flex-grow" v-if="map.status !== 'PENDING'">
          <h3 class="italic text-lg text-gray-600">Metadata</h3>
          <p v-if="map.work_begun && map.work_ended">
            <span class="font-bold">Task Duration:</span>
            {{ calculateDuration(map.work_begun, map.work_ended) }}
          </p>
          <p v-if="map.file_size">
            <span class="font-bold">File Size:</span>
            {{ formatFilesize(map.file_size) }} mb
          </p>
          <p v-if="map.number_of_tiles">
            <span class="font-bold">Number of Tiles:</span>
            {{ formatNumber(map.number_of_tiles) }}
          </p>
        </div>
      </div>
      <div
        v-if="offlineMaps.length === 0"
        class="card bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col"
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          No offline maps found.
        </h2>
        <p class="mb-2 italic">Please generate a new map.</p>
      </div>
    </div>
    <div v-if="showModal" class="overlay"></div>
    <div v-if="showModal" class="modal">
      {{ modalMessage }}
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode.vue";

import MiniMap from "@/components/MapDashboard/MiniMap.vue";
import { copyLink } from "@/src/utils.ts";
import overlayModal from "@/components/overlay.css";

export default {
  components: { MiniMap, QRCode },
  props: ["mapboxAccessToken", "offlineMaps", "offlineMapsUri"],
  data() {
    return {
      refreshKey: 0,
      tooltipId: null,
      showQRCodeId: null,
      showModal: false,
      modalMessage: "",
    };
  },
  methods: {
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
    deleteMap(id) {
      let confirmation = window.confirm(
        "Are you sure you want to delete this offline map? This action cannot be undone.",
      );

      if (confirmation) {
        const map = this.offlineMaps.find((m) => m.id === id);
        if (map) {
          const message = {
            type: "delete_request",
            requestId: map.id,
            filename: map.filename,
            file_location: map.file_location,
          };
          this.$emit("handleMapRequest", message);
          this.modalMessage =
            "Offline map request (and associated files) deleted!";
          this.showModal = true;
          // wait 3 seconds and refresh the page content
          setTimeout(() => {
            this.showModal = false;
            location.reload();
          }, 3000);
        }
      }
    },
    formatFilesize(size) {
      return (size / 1024 / 1024).toFixed(2);
    },
    formatNumber(value) {
      return parseInt(value).toLocaleString();
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
        case "PENDING DELETION":
          return "font-semibold text-red-500";
        case "PENDING":
          return "font-semibold text-yellow-500";
        case "SUCCEEDED":
          return "font-semibold text-green-500";
        default:
          return "font-semibold text-gray-600";
      }
    },
    resubmitMapRequest(id) {
      const map = this.offlineMaps.find((m) => m.id === id);
      if (map) {
        const message = {
          type: "resubmit_request",
          title: map.title,
          filename: map.filename,
          status: "PENDING",
          error_message: null,
          description: map.description,
          min_zoom: map.min_zoom,
          max_zoom: map.max_zoom,
          mapbox_style: map.mapbox_style,
          planet_monthly_visual: map.planet_monthly_visual,
          bounds: map.bounds,
          style: map.style,
          openstreetmap: map.openstreetmap,
          number_of_tiles: map.number_of_tiles,
          created_at: new Date(),
          requestId: map.id,
        };
        this.$emit("handleMapRequest", message);
        this.modalMessage = "Offline map request successfully resubmitted!";
        this.showModal = true;
        // wait 3 seconds and refresh the page content
        setTimeout(() => {
          this.showModal = false;
          location.reload();
        }, 3000);
      }
    },
    toggleQRCode(id) {
      this.showQRCodeId = this.showQRCodeId === id ? null : id;
    },
  },
  computed: {
    style() {
      return { ...overlayModal };
    },
  },
};
</script>

<style scoped>
.card {
  position: relative;
}

.tooltip {
  position: absolute;
  margin-left: 10px;
  white-space: nowrap;
  transform: translateX(10%) translateY(20%);
  z-index: 10;
}

.delete {
  position: absolute;
  right: 10px;
  top: 0px;
  z-index: 10;
}
</style>

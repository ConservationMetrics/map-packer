<template>
  <div class="mt-4 mx-auto w-full max-w-6xl px-4">
    <div class="flex justify-end space-x-4 mb-4">
      <div class="relative inline-block text-left">
        <div>
          <button
            @click="toggleDropdown"
            class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            {{ currentLocaleName }}
            <svg
              class="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div
          v-if="dropdownOpen"
          class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div class="py-1">
            <a
              href="#"
              v-for="locale in availableLocales"
              :key="locale.code"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click.prevent.stop="changeLocale(locale.code)"
            >
              {{ locale.name }}
            </a>
          </div>
        </div>
      </div>
      <nuxt-link
        :to="localePath('map')"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 hidden md:block"
      >
        + {{ $t("generateMap") }}
      </nuxt-link>
    </div>
    <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
      {{ $t("availableOfflineMaps") }}
    </h1>
    <nuxt-link
      to="/map/"
      class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 text-center mb-8 md:hidden"
      >+ {{ $t("generateMap") }}</nuxt-link
    >
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="map in paginatedOfflineMaps"
        :key="map.id"
        class="card relative bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col"
      >
        <button
          v-if="
            map.status !== 'PENDING' &&
            map.status !== 'PROCESSING' &&
            map.status !== 'PENDING DELETION'
          "
          class="delete absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold py-1 px-1 cursor-pointer"
          @click="deleteMap(map.id)"
        >
          X
        </button>
        <h2 class="text-2xl font-bold text-gray-800 mb-2" v-if="map.title">
          {{ map.title }}
        </h2>
        <!-- MiniMap component is the fallback if there is no thumbnail image in the db -->
        <div class="mb-2" v-if="map.thumbnail_filename">
          <img
            :src="`${offlineMapsUri}/${map.thumbnail_filename}`"
            alt="Map thumbnail"
            class="w-full"
          />
        </div>
        <div class="mb-2" v-if="!map.thumbnail_filename && map.bounds">
          <MiniMap
            :mapbox-access-token="mapboxAccessToken"
            :bounds="map.bounds"
          />
        </div>
        <p class="mb-2 italic" v-if="map.description">{{ map.description }}</p>
        <div class="space-y-2 mb-2">
          <p v-if="map.status">
            <span class="font-bold">{{ $t("status") }}:</span>
            <span :class="formatStatusColor(map.status)">
              {{
                map.status === "FAILED"
                  ? $t("failed").toUpperCase()
                  : map.status === "SUCCEEDED"
                    ? $t("succeeded").toUpperCase()
                    : map.status === "PROCESSING"
                      ? $t("processing").toUpperCase()
                      : map.status === "PENDING"
                        ? $t("pending").toUpperCase()
                        : map.status === "PENDING DELETION"
                          ? $t("pendingDeletion").toUpperCase()
                          : map.status
              }}
            </span>
          </p>
          <p class="text-red-600 break-words" v-if="map.error_message">
            <span class="font-bold">{{ $t("errorMessage") }}:</span>
            {{ map.error_message }}
          </p>
          <p v-if="map.created_at">
            <span class="font-bold">{{ $t("requestedOn") }}:</span>
            {{ formatDate(map.created_at) }}
          </p>
          <p v-if="map.work_ended">
            <span class="font-bold">{{ $t("finishedOn") }}:</span>
            {{ formatDate(map.work_ended) }}
          </p>
          <p v-if="map.style">
            <span class="font-bold">{{ $t("mapStyle") }}:</span> {{ map.style
            }}<span v-if="map.planet_monthly_visual">
              ({{ map.planet_monthly_visual }})</span
            ><span v-if="map.openstreetmap === true"
              >, {{ $t("withOSMLabels") }}
            </span>
          </p>
          <p v-if="map.max_zoom">
            <span class="font-bold">{{ $t("zoomLevel") }}:</span>
            {{ map.min_zoom }}-{{ map.max_zoom }}
          </p>
        </div>
        <div v-if="map.error_message" class="flex mb-2">
          <button
            class="copy-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
            @click="resubmitMapRequest(map.id)"
          >
            {{ $t("resubmit") }}
          </button>
        </div>
        <div v-if="map.file_location && offlineMapsUri" class="flex mb-2">
          <a
            :href="`${offlineMapsUri}/${map.filename}`"
            class="download-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out mr-4"
            >{{ $t("download") }}</a
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
              {{ $t("copyLink") }}
            </button>
            <div
              v-if="tooltipId === (map ? map.id : null)"
              class="tooltip bg-gray-500 text-white py-1 px-2 rounded transition duration-300 ease-in-out"
            >
              {{ $t("copied") }}!
            </div>
          </div>
        </div>
        <div v-if="showQRCodeId === map.id" class="flex mb-2">
          <QRCode :value="`${offlineMapsUri}/${map.filename}`" size="300" />
        </div>
        <div
          class="space-y-2 flex-grow"
          v-if="map.status !== 'PENDING' && map.status !== 'PROCESSING'"
        >
          <h3 class="italic text-lg text-gray-600">{{ $t("metadata") }}</h3>
          <p v-if="map.work_begun && map.work_ended">
            <span class="font-bold">{{ $t("taskDuration") }}:</span>
            {{ calculateDuration(map.work_begun, map.work_ended) }}
          </p>
          <p v-if="map.file_size">
            <span class="font-bold">{{ $t("fileSize") }}:</span>
            {{ formatFilesize(map.file_size) }} mb
          </p>
          <p v-if="map.number_of_tiles">
            <span class="font-bold">{{ $t("numberOfTiles") }}:</span>
            {{ formatNumber(map.number_of_tiles) }}
          </p>
        </div>
      </div>
      <div
        v-if="offlineMaps.length === 0"
        class="card bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col"
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {{ $t("noOfflineMapsFound") }}.
        </h2>
        <p class="mb-2 italic">{{ $t("pleaseGenerateANewMap") }}</p>
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
  props: {
    offlineMaps: Array,
    offlineMapsUri: String,
    mapboxAccessToken: String,
    nextCursor: Number,
  },
  data() {
    return {
      dropdownOpen: false,
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
    changeLocale(localeCode) {
      this.$i18n.setLocale(localeCode);
      this.dropdownOpen = false;
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
      let confirmation = window.confirm(this.$t("mapDeleteConfirmation") + ".");

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
          (this.modalMessage = this.$t("mapWithFilesDeleted") + "!"),
            (this.showModal = true);
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
        case "PROCESSING":
          return "font-semibold text-yellow-500";
        case "SUCCEEDED":
          return "font-semibold text-green-500";
        default:
          return "font-semibold text-gray-600";
      }
    },
    handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        this.loadMore();
      }
    },
    loadMore() {
      this.$emit("loadMore");
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
        (this.modalMessage = this.$t("mapDeleted") + "!"),
          (this.showModal = true);
        // wait 3 seconds and refresh the page content
        setTimeout(() => {
          this.showModal = false;
          location.reload();
        }, 3000);
      }
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    toggleQRCode(id) {
      this.showQRCodeId = this.showQRCodeId === id ? null : id;
    },
  },
  computed: {
    currentLocaleName() {
      const currentLocale = this.availableLocales.find(
        (locale) => locale.code === this.$i18n.locale,
      );
      return currentLocale ? currentLocale.name : "";
    },
    availableLocales() {
      return this.$i18n.locales;
    },
    paginatedOfflineMaps() {
      return this.offlineMaps;
    },
    style() {
      return { ...overlayModal };
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
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

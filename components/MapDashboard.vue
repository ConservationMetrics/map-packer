<script setup lang="ts">
import { useI18n } from "vue-i18n";

import QRCode from "qrcode.vue";
import MiniMap from "@/components/MapDashboard/MiniMap.vue";

import { copyLink } from "@/utils";

import type { MapRequest } from "@/types/types";

const { t } = useI18n();

const props = defineProps<{
  offlineMaps: MapRequest[];
  offlineMapsUri: string;
  mapboxAccessToken: string;
  nextCursor: number;
}>();

const emit = defineEmits(["handleMapRequest", "loadMoreMaps"]);

// Scrolling down on the page will load more maps
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
const loadMoreMaps = () => {
  emit("loadMoreMaps");
};
const handleScroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    loadMoreMaps();
  }
};
const paginatedOfflineMaps = computed<MapRequest[]>(() => props.offlineMaps);

// Functions to format data
const calculateDuration = (start: Date, end: Date) => {
  const startDate: Date = new Date(start);
  const endDate: Date = new Date(end);
  const duration: number = +endDate - +startDate;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
};
const formatFileFormat = (format: string) => {
  switch (format) {
    case "smp":
      return "Styled Map Package (SMP)";
    case "mbtiles":
      return "MBTiles";
    default:
      return format;
  }
};
const formatFilesize = (size: string) =>
  (Number(size) / 1024 / 1024).toFixed(2);
const formatNumber = (value: number) => value.toLocaleString();
const formatDate = (dateString: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", options);
};
const formatStatusColor = (status: string) => {
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
};

// Functions to toggle map request QR code and copy link
const showQRCodeId = ref<number | null>(null);
const toggleQRCode = (id: number) => {
  showQRCodeId.value = showQRCodeId.value === id ? null : id;
};
const tooltipId = ref<number | null>(null);
const copyLinkToClipboard = (link: string, id: number) => {
  copyLink(link)
    .then(() => {
      tooltipId.value = id;
      setTimeout(() => {
        tooltipId.value = null;
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
};

// Functions to interact with the map requests
const showModal = ref(false);
const modalMessage = ref("");
const deleteMap = (id: number) => {
  const confirmation = window.confirm(t("mapDeleteConfirmation") + ".");

  if (confirmation) {
    const map = props.offlineMaps.find((m) => m.id === id);
    if (map) {
      const message = {
        type: "delete_request",
        requestId: map.id,
        filename: map.filename,
        file_location: map.file_location,
      };
      emit("handleMapRequest", message);
      modalMessage.value = t("mapWithFilesDeleted") + "!";
      showModal.value = true;
      setTimeout(() => {
        showModal.value = false;
        location.reload();
      }, 3000);
    }
  }
};
const resubmitMapRequest = (id: number) => {
  const map = props.offlineMaps.find((m) => m.id === id);
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
    emit("handleMapRequest", message);
    modalMessage.value = t("mapRequestResubmitted") + "!";
    showModal.value = true;
    setTimeout(() => {
      showModal.value = false;
      location.reload();
    }, 3000);
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="mt-4 mx-auto w-full max-w-6xl px-4">
    <div class="flex justify-end space-x-4 mb-4">
      <LanguagePicker />
      <NuxtLinkLocale
        to="/map"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 hidden md:block"
      >
        + {{ $t("generateMap") }}
      </NuxtLinkLocale>
    </div>
    <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
      {{ $t("availableOfflineMaps") }}
    </h1>
    <NuxtLink
      to="/map/"
      class="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200 text-center mb-8 md:hidden"
      >+ {{ $t("generateMap") }}</NuxtLink
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
        <h2 v-if="map.title" class="text-2xl font-bold text-gray-800 mb-2">
          {{ map.title }}
        </h2>
        <!-- MiniMap component is the fallback if there is no thumbnail image in the db -->
        <div v-if="map.thumbnail_filename" class="mb-2">
          <img
            :src="`${offlineMapsUri}/${map.thumbnail_filename}`"
            alt="Map thumbnail"
            class="w-full"
          />
        </div>
        <div v-if="!map.thumbnail_filename && map.bounds" class="mb-2">
          <MiniMap
            :mapbox-access-token="mapboxAccessToken"
            :bounds="map.bounds"
          />
        </div>
        <p v-if="map.description" class="mb-2 italic">{{ map.description }}</p>
        <div class="space-y-2 mb-2">
          <p v-if="map.status">
            <span class="font-bold">{{ $t("status") }}: </span>
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
          <p v-if="map.error_message" class="text-red-600 break-words">
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
          <p v-if="map.format">
            <span class="font-bold">{{ $t("format") }}:</span>
            {{ formatFileFormat(map.format) }}
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
          <QRCode :value="`${offlineMapsUri}/${map.filename}`" :size="300" />
        </div>
        <div
          v-if="map.status !== 'PENDING' && map.status !== 'PROCESSING'"
          class="space-y-2 flex-grow"
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

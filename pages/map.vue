<template>
  <div>
    <GenerateMap
      v-if="dataFetched"
      @handleMapRequest="handleMapRequest"
      :available-map-styles="availableMapStyles"
      :mapbox-access-token="mapboxAccessToken"
      :map-latitude="mapLatitude"
      :map-longitude="mapLongitude"
      :map-zoom="mapZoom"
    />
  </div>
</template>

<script setup>
import { useFetch, useHead } from '#imports'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const dataFetched = ref(false)
const availableMapStyles = ref([])
const mapboxAccessToken = ref('')
const mapLatitude = ref(0)
const mapLongitude = ref(0)
const mapZoom = ref(0)

// Fetch initial data
const { data, error } = await useFetch('/api/map')

if (data.value && !error.value) {
  let parsedData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value

  mapboxAccessToken.value = parsedData.mapboxAccessToken
  mapLatitude.value = Number(parsedData.mapLatitude)
  mapLongitude.value = Number(parsedData.mapLongitude)
  mapZoom.value = Number(parsedData.mapZoom)

  let mapStyles = await $fetch('/api/mapstyles')
  if (typeof mapStyles === 'string') {
    mapStyles = mapStyles.split(',')
  }
  availableMapStyles.value = mapStyles

  dataFetched.value = true
} else {
  console.error("Error fetching data:", error.value)
  dataFetched.value = false
}

// POST map request (emitted by component)
const handleMapRequest = async (formData) => {
  // Function to remove accents and replace non-alphanumeric characters with underscores
  const normalizeFilename = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\W+/g, "_")
  }

  // Transform formData to match the expected database table schema
  const transformedMessage = {
    type: "new_request",
    title: formData.title,
    filename: normalizeFilename(formData.title),
    status: "PENDING",
    description: formData.description,
    min_zoom: 0,
    max_zoom: formData.maxZoom,
    mapbox_style: formData.mapboxStyle ?? undefined,
    planet_monthly_visual: formData.planetMonthYear ?? undefined,
    bounds: formData.selectedBounds,
    style: formData.selectedStyle,
    openstreetmap: formData.openstreetmap ?? false,
    number_of_tiles: formData.estimatedTiles,
    created_at: new Date(),
  }

  // Include mapboxAccessToken if it exists
  if (formData.mapboxAccessToken) {
    transformedMessage.apiKey = formData.mapboxAccessToken
  }

  try {
    await $fetch('/api/maprequest', {
      method: 'POST',
      body: transformedMessage,
    })
  } catch (error) {
    console.error("Error submitting request data:", error)
  }
}

useHead({
  title: 'MapPacker: ' + t("generateOfflineMap"),
})
</script>

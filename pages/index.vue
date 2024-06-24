<template>
  <div>
      <MapDashboard
        v-if="dataFetched"
        :mapbox-access-token="mapboxAccessToken"
        :next-cursor="nextCursor"
        :offline-maps="offlineMaps"
        :offline-maps-uri="offlineMapsUri"
        @handleMapRequest="handleMapRequest"
        @loadMore="loadMore"
      />
  </div>
</template>

<script setup>
import { useFetch, useHead } from '#imports'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const dataFetched = ref(false)
const mapboxAccessToken = ref('')
const nextCursor = ref(null)
const offlineMaps = ref([])
const offlineMapsUri = ref('')
const isLoading = ref(false)

// Fetch initial data
const { data: initialData, error: initialError } = await useFetch('/api/data')

if (initialData.value && !initialError.value) {
  const parsedData = JSON.parse(initialData.value)
  mapboxAccessToken.value = parsedData.mapboxAccessToken
  nextCursor.value = parsedData.nextCursor
  offlineMaps.value = parsedData.offlineMaps
  offlineMapsUri.value = parsedData.offlineMapsUri

  dataFetched.value = true
} else {
  console.error("Error fetching data:", initialError.value)
}

// POST map request (emitted by component)
const handleMapRequest = async (message) => {
  try {
    await $fetch('/api/maprequest', {
      method: 'POST',
      body: message,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error("Error submitting request data:", error)
  }
}

// Load more data based on cursor pagination
const loadMore = async () => {
  if (!nextCursor.value || isLoading.value) return

  isLoading.value = true

  try {
    const { data: moreData, error: moreError } = await useFetch(`/api/data?cursor=${nextCursor.value}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (moreData.value && !moreError.value) {
      if (moreData.value.offlineMaps.length > 0) {
        offlineMaps.value.push(...moreData.value.offlineMaps)
        nextCursor.value = moreData.value.nextCursor
      } else {
        nextCursor.value = null
      }
    } else {
      console.error("Error fetching more data:", moreError.value)
    }
  } catch (error) {
    console.error("Error fetching more data:", error)
  } finally {
    isLoading.value = false
  }
}

useHead({
  title: 'MapPacker: ' + t("availableOfflineMaps"),
})
</script>

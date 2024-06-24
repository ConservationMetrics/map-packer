import { defineEventHandler, send, H3Event } from 'h3'
import { MAPBOX_ACCESS_TOKEN, MAP_ZOOM, MAP_LATITUDE, MAP_LONGITUDE } from '../../config'

export default defineEventHandler(async (event: H3Event) => {
  const response = {
    mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
    mapZoom: MAP_ZOOM,
    mapLatitude: MAP_LATITUDE,
    mapLongitude: MAP_LONGITUDE,
  }
  return send(event, JSON.stringify(response))
})

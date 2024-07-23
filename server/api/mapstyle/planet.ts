import { defineEventHandler, send, sendError } from 'h3'
import { mapStyles } from '../../styles/availableMapStyles'

export default defineEventHandler((event) => {
  const mapStyleEntry = mapStyles['planet' as keyof typeof mapStyles]
  if (mapStyleEntry) {
    return send(event, JSON.stringify(mapStyleEntry.style))
  } else {
    return sendError(event, new Error("Map style not found"))
  }
})

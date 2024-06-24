import { defineEventHandler, send, H3Event } from 'h3'
import { mapStyles } from '../styles/mapStyles'
import { MAPBOX_STYLE, MAPBOX_STYLE_NAME } from '../../config'

export default defineEventHandler((event: H3Event) => {
  const styles = Object.entries(mapStyles).map(([key, value]) => ({
    name: value.name,
    key: key,
    url: value.url || `/api/mapstyle/${key}/`,
  }))

  if (MAPBOX_STYLE) {
    styles.unshift({
      name: MAPBOX_STYLE_NAME || "Mapbox Custom Style",
      key: "mapbox",
      url: MAPBOX_STYLE,
    })
  }

  return send(event, JSON.stringify(styles))
})

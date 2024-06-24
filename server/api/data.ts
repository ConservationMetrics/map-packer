import { defineEventHandler, getQuery, send, sendError, H3Event } from 'h3'
import setupDatabaseConnection from '../database/dbConnection'
import { fetchData } from '../database/dbOperations'

import {
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  OFFLINE_MAPS_URI,
} from "../../config";

const db = setupDatabaseConnection(
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
);

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 6
  const cursor = query.cursor ? parseInt(query.cursor as string) : null

  try {
    const { data } = await fetchData(db, DB_TABLE, limit, cursor)
    if (data === null) {
      return send(event, [])
    } else {
      const response = {
        mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
        nextCursor: data.length ? data[data.length - 1].id : null,
        offlineMaps: data,
        offlineMapsUri: OFFLINE_MAPS_URI,
      }
      return send(event, JSON.stringify(response))
    }
  } catch (error: any) {
    console.error("Error fetching data on API side:", error.message)
    return sendError(event, new Error(error.message))
  }
})

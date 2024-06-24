import { defineEventHandler, readBody, send, sendError, H3Event } from 'h3'
import setupDatabaseConnection from '../database/dbConnection'
import {
  insertDataIntoTable,
  updateDatabaseMapRequest,
  handleDeleteRequest,
  updateDatabaseWithError
} from '../database/dbOperations'
import { publishToAzureStorageQueue } from '../messageQueue/azure'
import {
  ASQ_QUEUE_NAME,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  PLANET_API_KEY,
} from '../../config'

const db = setupDatabaseConnection(
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
);

export default defineEventHandler(async (event: H3Event) => {
  const data = await readBody(event)
  let requestId: number | void | null = data.requestId

  if (data.style === "mapbox-custom" || data.style === "mapbox-streets") {
    data.style = "mapbox"
  }

  try {
    if (data.type === "new_request") {
      console.log("Inserting data into database...")
      const new_request = { ...data }
      delete new_request.type
      delete new_request.apiKey
      requestId = await insertDataIntoTable(db, DB_TABLE, new_request)
    } else if (data.type === "resubmit_request") {
      console.log("Updating data in database...")
      const resubmit_request = { ...data }
      delete resubmit_request.type
      delete resubmit_request.apiKey
      delete resubmit_request.requestId
      data.type = "new_request"
      await updateDatabaseMapRequest(db, DB_TABLE, requestId, resubmit_request)
    } else if (data.type === "delete_request") {
      const shouldPublish = await handleDeleteRequest(db, DB_TABLE, requestId)
      if (!shouldPublish) {
        return send(event, { message: "Row deleted without publishing to queue." })
      }
    } else {
      throw new Error("Invalid request type")
    }

    if (data.style && data.style.includes("mapbox")) {
      data.apiKey = data.apiKey || MAPBOX_ACCESS_TOKEN
    } else if (data.style && data.style === "planet") {
      data.apiKey = data.apiKey || PLANET_API_KEY
    }

    if (ASQ_QUEUE_NAME) {
      console.log(`Publishing message to queue: ${ASQ_QUEUE_NAME}`)
      await publishToAzureStorageQueue(ASQ_QUEUE_NAME, requestId, data)
    } else {
      console.error("ASQ_QUEUE_NAME is not set.")
      await updateDatabaseWithError(db, DB_TABLE, requestId, "InternalServerError: ASQ_QUEUE_NAME is not set")
    }

    return send(event, { message: "Request successfully published!" })
  } catch (error: any) {
    console.error("Error on API side:", error.message)
    await updateDatabaseWithError(db, DB_TABLE, requestId, `InternalServerError: ${error.message}`)
    return sendError(event, new Error(error.message))
  }
})

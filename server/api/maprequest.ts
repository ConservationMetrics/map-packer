import { defineEventHandler, readBody, send, sendError, H3Event } from "h3";
import setupDatabaseConnection from "../database/dbConnection";
import {
  insertDataIntoTable,
  updateDatabaseMapRequest,
  handleDeleteRequest,
  updateDatabaseWithError,
} from "../database/dbOperations";
import { publishToAzureStorageQueue } from "../messageQueue/azure";

const { database, dbHost, dbUser, dbPassword, dbPort, dbSsl, dbTable } =
  useRuntimeConfig();

const db = setupDatabaseConnection(
  database,
  dbHost,
  dbUser,
  dbPassword,
  dbPort,
  dbSsl,
);

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const data = await readBody(event);
  let requestId: number | void | null = data.requestId;

  if (data.style === "mapbox-custom" || data.style === "mapbox-streets") {
    data.style = "mapbox";
  }

  try {
    // If it's a new request, insert data into the database
    if (data.type === "new_request") {
      console.log("Inserting data into database...");
      const new_request = { ...data };
      delete new_request.type;
      delete new_request.apiKey;
      requestId = await insertDataIntoTable(db, dbTable, new_request);
    }
    // If it's a resubmit request, update the data in the database
    else if (data.type === "resubmit_request") {
      console.log("Updating data in database...");
      const resubmit_request = { ...data };
      delete resubmit_request.type;
      delete resubmit_request.apiKey;
      delete resubmit_request.requestId;
      data.type = "new_request";
      await updateDatabaseMapRequest(db, dbTable, requestId, resubmit_request);
    }
    // If it's a delete request, delete the row if no files are found,
    // Else set status to PENDING_DELETION and publish message for mapgl-tile-renderer
    // to handle deletion
    else if (data.type === "delete_request") {
      const shouldPublish = await handleDeleteRequest(db, dbTable, requestId);
      if (!shouldPublish) {
        return send(
          event,
          JSON.stringify({
            message: "Row deleted without publishing to queue.",
          }),
        );
      }
    } else {
      throw new Error("Invalid request type");
    }

    // Add API tokens from env vars server-side
    if (data.style && data.style.includes("mapbox")) {
      data.apiKey = data.apiKey || config.public.mapboxAccessToken;
    } else if (data.style && data.style === "planet") {
      data.apiKey = data.apiKey || config.public.planetApiKey;
    } else if (
      data.style &&
      (data.style === "stadia-stamen-terrain" ||
        data.style === "stadia-alidade-satellite")
    ) {
      data.apiKey = data.apiKey || config.public.stadiaApiKey;
    } else if (data.style && data.style === "thunderforest-landscape") {
      data.apiKey = data.apiKey || config.public.thunderforestApiKey;
    }

    if (config.asqQueueName) {
      console.log(`Publishing message to queue: ${config.asqQueueName}`);
      await publishToAzureStorageQueue(config.asqQueueName, requestId, data);
    } else {
      console.error("ASQ_QUEUE_NAME is not set.");
      await updateDatabaseWithError(
        db,
        dbTable,
        requestId,
        "InternalServerError: ASQ_QUEUE_NAME is not set",
      );
    }

    return send(
      event,
      JSON.stringify({ message: "Request successfully published!" }),
    );
  } catch (error: any) {
    console.error("Error on API side:", error.message);
    await updateDatabaseWithError(
      db,
      dbTable,
      requestId,
      `InternalServerError: ${error.message}`,
    );
    return sendError(event, new Error(error.message));
  }
});

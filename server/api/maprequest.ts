import { getDatabaseConnection } from "@/server/database/dbConnection";
import {
  insertDataIntoTable,
  updateDatabaseMapRequest,
  handleDeleteRequest,
  updateDatabaseWithError,
} from "@/server/database/dbOperations";
import { publishToAzureStorageQueue } from "@/server/messageQueue/azure";

import type { H3Event } from "h3";

const { dbTable } = useRuntimeConfig();

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  const data = await readBody(event);
  let requestId: number | null = data.requestId;

  if (data.style === "mapbox-custom" || data.style === "mapbox-streets") {
    data.style = "mapbox";
  }

  const db = await getDatabaseConnection();

  try {
    // If it's a new request, insert data into the database
    if (data.type === "new_request") {
      console.log("Inserting data into database...");
      const new_request = { ...data };
      delete new_request.type;
      delete new_request.api_key;
      requestId = await insertDataIntoTable(db, dbTable, new_request);
    }
    // If it's a resubmit request, update the data in the database
    else if (data.type === "resubmit_request") {
      console.log("Updating data in database...");
      const resubmit_request = { ...data };
      delete resubmit_request.type;
      delete resubmit_request.api_key;
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
      data.apiKey = data.api_key || config.public.mapboxAccessToken;
    } else if (data.style && data.style === "planet") {
      data.apiKey = data.api_key || config.public.planetApiKey;
    } else if (
      data.style &&
      (data.style === "stadia-stamen-terrain" ||
        data.style === "stadia-alidade-satellite")
    ) {
      data.apiKey = data.api_key || config.public.stadiaApiKey;
    } else if (data.style && data.style === "thunderforest-landscape") {
      data.apiKey = data.api_key || config.public.thunderforestApiKey;
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error on API side:", error.message);
      await updateDatabaseWithError(
        db,
        dbTable,
        requestId,
        `InternalServerError: ${error.message}`,
      );
    }
    return sendError(event, new Error("An unknown error occurred"));
  }
});

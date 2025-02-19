import { QueueServiceClient } from "@azure/storage-queue";
import { Buffer } from "buffer";

/**
 * Publishes a message to an Azure Storage Queue.
 *
 * This function takes a queue name, an optional request ID, and a message object,
 * then publishes the message to the specified Azure Storage Queue. The message
 * is transformed to match the expected input format for the mapgl-tile-renderer.
 */
export async function publishToAzureStorageQueue(
  queueName: string,
  requestId: number | null = null,
  message: {
    type: string;
    bounds: string;
    filename: string;
    file_location: string;
    mapbox_style: string;
    min_zoom: number;
    max_zoom: number;
    openstreetmap: boolean;
    planet_monthly_visual: string;
    style: string;
    apiKey: string;
    format: string;
  },
) {
  const {
    azureStorageConnectionAccountName,
    azureStorageConnectionStorageKey,
    public: { offlineMapsPath },
  } = useRuntimeConfig();

  const accountName = azureStorageConnectionAccountName;
  const storageKey = azureStorageConnectionStorageKey;

  if (!accountName || !storageKey) {
    throw new Error("Azure Storage Connection variables is not set");
  }

  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${storageKey};EndpointSuffix=core.windows.net`;

  const queueServiceClient =
    QueueServiceClient.fromConnectionString(connectionString);
  const queueClient = queueServiceClient.getQueueClient(queueName);

  // Transform the message object to match the inputs expected by mapgl-tile-renderer
  const transformedMessage = {
    requestId: requestId,
    ...(message.type && { type: message.type }),
    ...(message.bounds && { bounds: message.bounds }),
    ...(message.style && { style: message.style }),
    ...(message.mapbox_style && { mapboxStyle: message.mapbox_style }),
    ...(message.max_zoom && { maxZoom: message.max_zoom }),
    ...(message.min_zoom && { minZoom: message.min_zoom }),
    ...(message.planet_monthly_visual && {
      monthYear: message.planet_monthly_visual,
    }),
    ...(message.openstreetmap && { openStreetMap: message.openstreetmap }),
    ...(message.filename && { outputFilename: message.filename }),
    ...(message.file_location
      ? { outputDir: message.file_location }
      : offlineMapsPath && {
          outputDir: offlineMapsPath,
        }),
    ...(message.apiKey && { apiKey: message.apiKey }),
    ...(message.format && { format: message.format }),
    thumbnail: false,
  };

  const messageString = JSON.stringify(transformedMessage);

  console.log(`Publishing message to Azure Storage Queue: ${messageString}`);

  const response = await queueClient.sendMessage(
    Buffer.from(messageString).toString("base64"),
  );
  if (response.messageId) {
    console.log(
      `Message successfully published with ID: ${response.messageId}`,
    );
    return response.messageId;
  } else {
    throw new Error("Failed to publish the message");
  }
}

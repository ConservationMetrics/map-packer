import { QueueServiceClient } from "@azure/storage-queue";

export async function publishToAzureStorageQueue(
  queueName: string,
  requestId: number | void | null = null,
  message: {
    type: any;
    bounds: any;
    filename: any;
    file_location: any;
    mapbox_style: any;
    min_zoom: any;
    max_zoom: any;
    openstreetmap: any;
    planet_monthly_visual: any;
    style: any;
  },
) {
  const accountName = process.env.AZURE_STORAGE_CONNECTION_ACCOUNT_NAME;
  const storageKey = process.env.AZURE_STORAGE_CONNECTION_STORAGE_KEY;

  if (!accountName || !storageKey) {
    throw new Error("Azure Storage Connection variables is not set");
  }

  const connectionString = `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_CONNECTION_ACCOUNT_NAME};AccountKey=${process.env.AZURE_STORAGE_CONNECTION_STORAGE_KEY};EndpointSuffix=core.windows.net`;

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
      : process.env.OFFLINE_MAPS_PATH && {
          outputDir: process.env.OFFLINE_MAPS_PATH,
        }),
  };

  if (transformedMessage.style && transformedMessage.style.includes("mapbox")) {
    transformedMessage.apiKey = process.env.MAPBOX_ACCESS_TOKEN;
  } else if (
    transformedMessage.style &&
    transformedMessage.style === "planet"
  ) {
    transformedMessage.apiKey = process.env.VUE_APP_PLANET_API_KEY;
  }

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

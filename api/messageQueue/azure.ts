import { QueueServiceClient } from "@azure/storage-queue";

export async function publishToAzureStorageQueue(
  queueName: string,
  message: { 
    bounds: any; 
    filename: any;
    mapboxstyle: any;
    minzoom: any; 
    maxzoom: any; 
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
    ...(message.bounds && { bounds: message.bounds }),
    ...(message.style && { style: message.style }),
    ...(message.mapboxstyle && { mapboxStyle: message.mapboxstyle }),
    ...(message.maxzoom && { maxZoom: message.maxzoom }),
    ...(message.minzoom && { minZoom: message.minzoom }),
    ...(message.planet_monthly_visual && { monthYear: message.planet_monthly_visual }),
    ...(message.openstreetmap && { openStreetMap: message.openstreetmap }),
    ...(message.filename && { outputFilename: message.filename}),
  };

  if (transformedMessage.style.includes("mapbox")) {
    transformedMessage.apiKey = process.env.MAPBOX_ACCESS_TOKEN;
  } else if (transformedMessage.style === "planet") {
    transformedMessage.apiKey = process.env.VUE_APP_PLANET_API_KEY;
  }

  const messageString = JSON.stringify(transformedMessage);

  const response = await queueClient.sendMessage(Buffer.from(messageString).toString("base64"));
  if (response.messageId) {
    console.log(`Message successfully published with ID: ${response.messageId}`);
    return response.messageId;
  } else {
    throw new Error("Failed to publish the message");
  }
}

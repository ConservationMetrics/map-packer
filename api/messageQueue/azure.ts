import { QueueServiceClient } from "@azure/storage-queue";

export async function publishToAzureStorageQueue(
  queueName: string,
  message: string,
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
  const response = await queueClient.sendMessage(Buffer.from(message).toString("base64"));

  if (response.messageId) {
    console.log(`Message successfully published with ID: ${response.messageId}`);
    return response.messageId;
  } else {
    throw new Error("Failed to publish the message");
  }
}

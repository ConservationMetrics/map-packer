import { QueueServiceClient } from "@azure/storage-queue";

// Helper function to publish message to Azure Storage Queue
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
  await queueClient.sendMessage(Buffer.from(message).toString("base64"));
}

import pkg, { Pool as PoolType } from "pg";
const { Pool } = pkg;

import { getConfig } from "./dbConfig";

let db: PoolType | null = null;

export const setupDatabaseConnection = async (): Promise<PoolType> => {
  const { database, dbHost, dbUser, dbPassword, dbPort, dbSsl } = getConfig();

  const dbConnection = {
    database: database,
    user: dbUser,
    host: dbHost,
    password: dbPassword,
    port: parseInt(dbPort, 10),
    ssl: dbSsl === true ? { rejectUnauthorized: false } : false,
  };
  db = new Pool(dbConnection);

  db.on("connect", () => {
    console.log("Connected to the PostgreSQL database");
  });

  db.on("error", (error: Error) => {
    db = null;
    console.error("Error connecting to the PostgreSQL database:", error);
  });

  return db;
};

export const getDatabaseConnection = async (): Promise<PoolType> => {
  if (db) {
    await ensurePostgresConnection(db);
  } else {
    db = await setupDatabaseConnection();
  }
  return db;
};

export const refreshDatabaseConnection = async (): Promise<void> => {
  if (db) {
    await db.end();
  }
  db = await setupDatabaseConnection();
};

async function ensurePostgresConnection(db: PoolType): Promise<void> {
  try {
    await db.query("SELECT 1"); // Simple query to check connection
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        "Error encountered when checking PostgreSQL connection:",
        error.message,
      );
    }
    console.log("Reconnecting to PostgreSQL...");
    await refreshDatabaseConnection();
  }
}

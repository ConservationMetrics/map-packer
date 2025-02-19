import type { Pool as PoolType } from "pg";
import pkg from "pg";

import { getConfig } from "./dbConfig";
const { Pool } = pkg;

let db: PoolType | null = null;

/** Sets up a new PostgreSQL database connection. */
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

/** Retrieves the current database connection, setting it up if necessary. */
export const getDatabaseConnection = async (): Promise<PoolType> => {
  if (db) {
    await ensurePostgresConnection(db);
  } else {
    db = await setupDatabaseConnection();
  }
  return db;
};

/** Refreshes the database connection by closing and reopening it. */
export const refreshDatabaseConnection = async (): Promise<void> => {
  if (db) {
    await db.end();
  }
  db = await setupDatabaseConnection();
};

/** Ensures the PostgreSQL connection is active, reconnecting if needed. */
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

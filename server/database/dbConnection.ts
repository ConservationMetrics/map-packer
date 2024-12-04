import pkg from "pg";
const { Client } = pkg;

import { type DatabaseConnection } from "../types";
import { getConfig } from "./dbConfig";

let db: DatabaseConnection | null = null;

export const setupDatabaseConnection =
  async (): Promise<DatabaseConnection> => {
    const { database, dbHost, dbUser, dbPassword, dbPort, dbSsl } = getConfig();

    const dbConnection = {
      database: database,
      user: dbUser,
      host: dbHost,
      password: dbPassword,
      port: parseInt(dbPort, 10),
      ssl: dbSsl === true ? { rejectUnauthorized: false } : false,
    };
    db = new Client(dbConnection);

    db.connect()
      .then(() => {
        console.log("Connected to the PostgreSQL database");
      })
      .catch((error: Error) => {
        db = null;
        if (error.message.includes("self signed certificate")) {
          console.error(
            "Error connecting to the PostgreSQL database: Self-signed certificate issue.",
          );
        } else {
          console.error("Error connecting to the PostgreSQL database:", error);
        }
      });

    return db;
  };

export const getDatabaseConnection = async (): Promise<DatabaseConnection> => {
  await ensurePostgresConnection(db!);
  if (!db) {
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

async function ensurePostgresConnection(db: DatabaseConnection): Promise<void> {
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

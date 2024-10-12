import pkg from "pg";
const { Client } = pkg;

import { type DatabaseConnection } from "../types";

let db: DatabaseConnection | null = null;

const setupDatabaseConnection = (
  database: string | undefined,
  host: string | undefined,
  user: string | undefined,
  password: string | undefined,
  port: string,
  ssl: boolean | string | undefined,
): DatabaseConnection => {
  const dbConnection = {
    database: database,
    user: user,
    host: host,
    password: password,
    port: parseInt(port, 10),
    ssl: ssl === true ? { rejectUnauthorized: false } : false,
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

export default setupDatabaseConnection;

import setupDatabaseConnection from "./database/dbConnection";
import { type DatabaseConnection } from "./types";

let db: DatabaseConnection;

const {
  database,
  dbHost,
  dbUser,
  dbPassword,
  dbPort,
  dbSsl,
  // eslint-disable-next-line no-undef
} = useRuntimeConfig() as unknown as {
  database: string;
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbPort: string;
  dbSsl: boolean;
};

export default async () => {
  try {
    db = await setupDatabaseConnection(
      database,
      dbHost,
      dbUser,
      dbPassword,
      dbPort,
      dbSsl,
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to ${database}:`, error);
    } else {
      console.error("Unknown error connecting to database:", error);
    }
  }
};

export { db };

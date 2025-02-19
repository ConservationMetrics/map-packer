/** Retrieves database configuration from runtime configuration. */
export const getConfig = () => {
  const { database, dbHost, dbUser, dbPassword, dbPort, dbSsl } =
    useRuntimeConfig() as unknown as {
      database: string;
      dbHost: string;
      dbUser: string;
      dbPassword: string;
      dbPort: string;
      dbSsl: boolean;
    };

  return {
    database,
    dbHost,
    dbUser,
    dbPassword,
    dbPort,
    dbSsl,
  };
};

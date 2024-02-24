interface EnvVars {
  DATABASE: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_SSL: string;
  DB_TABLE: string;
  MAPBOX_ACCESS_TOKEN: string;
  MAP_STYLE: string;
  MAP_ZOOM: string;
  MAP_LATITUDE: string;
  MAP_LONGITUDE: string;
  NUXT_ENV_AUTH_STRATEGY: string;
  PASSWORD: string;
  PORT: string;
  SECRET_JWT_KEY: string;
  VUE_APP_API_KEY: string;
}

const env = process.env as unknown as EnvVars;

// Remove quotations from all env vars if they exist.
// This is important as the presence of quotation marks in .env can lead to issues when trying to connect to the database or any other operation requiring these variables.
// Replace with default values in some cases.
const getEnvVar = (
  key: keyof EnvVars,
  defaultValue?: string,
  transform?: (val: string) => any,
) => {
  const value = env[key];
  let result = value !== undefined ? value.replace(/['"]+/g, "") : defaultValue;
  if (transform && result) {
    result = transform(result);
  }
  return result;
};

const API_KEY = getEnvVar("VUE_APP_API_KEY");
const AUTH_STRATEGY = getEnvVar("NUXT_ENV_AUTH_STRATEGY", "none");
const DATABASE = getEnvVar("DATABASE");
const DB_HOST = getEnvVar("DB_HOST");
const DB_USER = getEnvVar("DB_USER");
const DB_PASSWORD = getEnvVar("DB_PASSWORD");
const DB_PORT = getEnvVar("DB_PORT", "5432") as string;
const DB_SSL = getEnvVar("DB_SSL", "YES") as string;
const DB_TABLE = getEnvVar("DB_TABLE") as string;
const MAPBOX_ACCESS_TOKEN = getEnvVar("MAPBOX_ACCESS_TOKEN", "pk.ey") as string;
const MAP_STYLE = getEnvVar("MAP_STYLE") as string;
const MAP_ZOOM = getEnvVar("MAP_ZOOM") as string;
const MAP_LATITUDE = getEnvVar("MAP_LATITUDE") as string;
const MAP_LONGITUDE = getEnvVar("MAP_LONGITUDE") as string;
const PASSWORD = getEnvVar("PASSWORD");
const SECRET_JWT_KEY = getEnvVar("SECRET_JWT_KEY", "secret-jwt-key") as string;

export {
  API_KEY,
  AUTH_STRATEGY,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  MAP_STYLE,
  MAP_ZOOM,
  MAP_LATITUDE,
  MAP_LONGITUDE,
  PASSWORD,
  SECRET_JWT_KEY,
};

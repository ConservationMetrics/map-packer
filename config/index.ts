interface EnvVars {
  ASQ_QUEUE_NAME: string;
  DATABASE: string;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_PORT: string;
  DB_SSL: string;
  DB_TABLE: string;
  MAPBOX_API_KEY: string;
  MAPBOX_STYLE: string;
  MAPBOX_STYLE_NAME: string;
  MAP_ZOOM: string;
  MAP_LATITUDE: string;
  MAP_LONGITUDE: string;
  NUXT_ENV_AUTH_STRATEGY: string;
  OFFLINE_MAPS_URI: string;
  PASSWORD: string;
  PORT: string;
  SECRET_JWT_KEY: string;
  VUE_APP_API_KEY: string;
  VUE_APP_PLANET_API_KEY: string;
  VUE_APP_STADIA_API_KEY: string;
  VUE_APP_THUNDERFOREST_API_KEY: string;
}

const env = process.env as unknown as EnvVars;

// Let's remove quotations from all env vars if they exist.
// This is important as the presence of quotation marks in .env
// can lead to issues when trying to connect to the database or
// any other operation requiring these variables.
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
const ASQ_QUEUE_NAME = getEnvVar("ASQ_QUEUE_NAME");
const AUTH_STRATEGY = getEnvVar("NUXT_ENV_AUTH_STRATEGY", "none");
const DATABASE = getEnvVar("DATABASE");
const DB_HOST = getEnvVar("DB_HOST");
const DB_USER = getEnvVar("DB_USER");
const DB_PASSWORD = getEnvVar("DB_PASSWORD");
const DB_PORT = getEnvVar("DB_PORT", "5432") as string;
const DB_SSL = getEnvVar("DB_SSL", "YES") as string;
const DB_TABLE = getEnvVar("DB_TABLE") as string;
const MAPBOX_ACCESS_TOKEN = getEnvVar("MAPBOX_API_KEY", "pk.ey") as string;
const MAPBOX_STYLE = getEnvVar("MAPBOX_STYLE") as string;
const MAPBOX_STYLE_NAME = getEnvVar("MAPBOX_STYLE_NAME") as string;
const MAP_ZOOM = getEnvVar("MAP_ZOOM") as string;
const MAP_LATITUDE = getEnvVar("MAP_LATITUDE") as string;
const MAP_LONGITUDE = getEnvVar("MAP_LONGITUDE") as string;
const OFFLINE_MAPS_URI = getEnvVar("OFFLINE_MAPS_URI");
const PASSWORD = getEnvVar("PASSWORD");
const PLANET_API_KEY = getEnvVar("VUE_APP_PLANET_API_KEY") as string;
const SECRET_JWT_KEY = getEnvVar("SECRET_JWT_KEY", "secret-jwt-key") as string;
const STADIA_API_KEY = getEnvVar("VUE_APP_STADIA_API_KEY") as string;
const THUNDERFOREST_API_KEY = getEnvVar(
  "VUE_APP_THUNDERFOREST_API_KEY",
) as string;

export {
  API_KEY,
  ASQ_QUEUE_NAME,
  AUTH_STRATEGY,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_STYLE_NAME,
  MAP_ZOOM,
  MAP_LATITUDE,
  MAP_LONGITUDE,
  OFFLINE_MAPS_URI,
  PASSWORD,
  PLANET_API_KEY,
  SECRET_JWT_KEY,
  STADIA_API_KEY,
  THUNDERFOREST_API_KEY,
};

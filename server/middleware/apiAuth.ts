import { defineEventHandler, H3Event } from "h3";
import apiRequestValidator from "~/utils/apiRequestValidator";

const {
  public: { appApiKey },
} = useRuntimeConfig();

export default defineEventHandler((event: H3Event) => {
  apiRequestValidator(appApiKey)(event);
});

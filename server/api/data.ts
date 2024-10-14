import { defineEventHandler, getQuery, send, sendError, H3Event } from "h3";
import { db } from "@/server/index";
import { fetchData } from "../database/dbOperations";

export default defineEventHandler(async (event: H3Event) => {
  const { dbTable } =
    // eslint-disable-next-line no-undef
    useRuntimeConfig();

  const query = getQuery(event);
  const limit = parseInt(query.limit as string) || 6;
  const cursor = query.cursor ? parseInt(query.cursor as string) : null;

  try {
    const { data } = await fetchData(db, dbTable, limit, cursor);
    if (data === null) {
      return send(event, []);
    } else {
      const response = {
        nextCursor: data.length ? data[data.length - 1].id : null,
        offlineMaps: data,
      };
      return send(event, JSON.stringify(response));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching data on API side:", error.message);
    }
    return sendError(event, new Error("An unknown error occurred"));
  }
});

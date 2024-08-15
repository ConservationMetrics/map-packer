import { defineEventHandler, H3Event, getQuery } from "h3";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../../../config";

export default defineEventHandler((event: H3Event) => {
  const query = getQuery(event);
  const secret_key = query.secret_key;

  if (secret_key !== SECRET_JWT_KEY) {
    event.node.res.statusCode = 403;
    event.node.res.end("Forbidden");
    return;
  }

  // If authentication is successful, generate and return a JWT
  const token = jwt.sign({}, SECRET_JWT_KEY);
  event.node.res.statusCode = 200;
  event.node.res.setHeader("Content-Type", "application/json");
  event.node.res.end(JSON.stringify({ token }));
});

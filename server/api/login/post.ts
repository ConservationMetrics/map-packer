import { defineEventHandler, H3Event, readBody } from "h3";
import jwt from "jsonwebtoken";
import { PASSWORD, SECRET_JWT_KEY } from "../../../config";

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const providedPassword = body.password;

  if (providedPassword !== PASSWORD) {
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

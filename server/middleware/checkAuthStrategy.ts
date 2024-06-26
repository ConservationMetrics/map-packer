import { defineEventHandler, H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { AUTH_STRATEGY, SECRET_JWT_KEY } from '../../config'

export default defineEventHandler((event: H3Event) => {
  // Check for JWT token if auth strategy is password
  if (AUTH_STRATEGY === "password") {
    const authHeader = event.node.req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      event.node.res.statusCode = 401
      event.node.res.end("Unauthorized")
      return
    }
    try {
      jwt.verify(token, SECRET_JWT_KEY)
    } catch (err) {
      event.node.res.statusCode = 401
      event.node.res.end('Unauthorized')
      return
    }
  }
})

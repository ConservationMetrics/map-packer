#!/bin/sh

# Export all environment variables if --env-file is provided
if [ -n "$ENV_FILE" ]; then
  for var in $(printenv | awk -F= '{print $1}'); do
    value=$(printenv "$var")
    export "$var=$value"
  done
fi

# Run the application
exec node .output/server/index.mjs
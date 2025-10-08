# Use the official Node.js image from DockerHub
FROM node:20.15.0-slim

# Set the working directory
RUN mkdir -p /app
WORKDIR /app

# Install system dependencies for building native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    libc-dev \
    libssl-dev \
 && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml into the container
COPY package*.json pnpm-lock.yaml* /app/

# Install dependencies (with rebuild fallback for native modules)
RUN pnpm install --frozen-lockfile || pnpm rebuild

# Explicitly rebuild oxc-transform to fix native binding issue
RUN pnpm rebuild oxc-transform || true

# Copy the application files into the container
COPY . /app

# Build the application
RUN pnpm run build

# Expose and set port 8080
EXPOSE 8080
ENV NITRO_PORT=8080

# Set app serving to permissive / assigned
ENV NITRO_HOST=0.0.0.0

# Run the application
ENTRYPOINT ["node", ".output/server/index.mjs"]
# Use the official Node.js image from DockerHub
FROM node:18.17.0-slim

# Set the working directory
RUN mkdir -p /app
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json  /app/

# Install dependencies
RUN npm install

# Copy the application files into the container
COPY . /app

# Build the application
RUN npm run build

# Create a .env file if it doesn't exist
RUN touch .env

# Expose and set port 8080
EXPOSE 8080
ENV NITRO_PORT=8080

# Set app serving to permissive / assigned
ENV NITRO_HOST=0.0.0.0

# Run the application
ENTRYPOINT ["node", ".output/server/index.mjs"]
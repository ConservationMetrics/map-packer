# MapPacker

MapPacker is a service that communities and other users can utilize to generate offline map resources (raster MBTiles) to use in field data collection applications like Mapeo and ODK/Kobo Collect. MapPacker provides a user interface to manage, access, and download offline basemaps for field mapping or monitoring, for a given area of interest.

MapPacker is a Nuxt.js 3 application with two primary views, accessible to the user once they have authenticated per the chosen authentication strategy:

1. A **Map Dashboard** to manage and access existing map offline requests, where the user can see the status of the request, information and metadata about the request, and if succeeded, links to download, scan a QR code, or copy the offline map file.

![Map Dashboard](docs/MapDashboard.png)

2. A **Generate Map** view, where the user can submit an offline map request by drawing a bounding box on a map for their area of interest, selecting a map style, and adding a title and description for their offline map request.

![Generate Map](docs/GenerateMap.png)

Once submitted, MapPacker will write the request to a Postgres database table and submit the request to a message queue. For the MapPacker flow to work, [mapgl-tile-renderer](http://github.com/conservationMetrics/mapgl-tile-renderer/) needs to be deployed as a task worker and set up to continuously listen to this message queue for new requests, and update the same Postgres database table with the render result.

## Configure

To get started, configure your MapPacker application environmental variables as shown in `.env.example`.

For local deployment, copy `.env.example` to `.env` and input the variables as shown.
For production environments like Azure, input the environmental variables via the app service dashboard.

**App API key:** This is needed to protect API routes and ensure only the application has access. API key should be in a UUID format.

**Database connection:** Provide your database information in the relevant variables, including the table where offline map data is stored.

**Authentication strategy:** Currently, MapPacker supports two different authentication strategies: auth0 or none. Set your authentication strategy in `NUXT_ENV_AUTH_STRATEGY`.

- If you are using an auth0 strategy, then you need to provide a domain, client ID, client secret, and base URL.

**Map config:** Provide the default settings for the map zoom level and lat/long coordinates. You may also provide a custom Mapbox map style to be used in the application (if not, Mapbox Streets will be used as the default option).

**Mapbox, Planet, Stadia, and Thunderforest API keys and access tokens:** Provide API keys and access tokens to be used across the application for authenticating with map assets. If not provided, the respective map styles will not show in the generate map view.

**Message Queue:** Provide your message queue variables to publish your map request to a storage queue service, where it can be picked up by a [mapgl-tile-renderer](http://github.com/conservationMetrics/mapgl-tile-renderer/) task worker. For Azure, you need a queue name, a storage account name, and a storage account key.

**Offline map storage:** Provide a URI where the offline maps can be downloaded, as well as a path pointing to a volume mount directory for mapgl-tile-renderer to store the files.

**Port:** Specify a port to serve the app. Default is 8080.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# use gc-shared-modules symlink
$ npm run link-module

# locally preview production build:
$ npm run preview

# generate static project
$ npm run generate

# run tests
$ npm run test
```

Add `--hostname 0.0.0.0` if you want the app to be accessible across your local network.

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment

**For deployment in a production environment (e.g. on Azure):**

Provide the environment variables found in `.env.example` to the app service.

**Local deployment of Docker:**

Copy your `.env.example` file to `.env`.

```sh
docker run --env-file=.env -it -p 8080:8080 map-packer:latest
```

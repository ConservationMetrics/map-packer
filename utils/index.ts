/**
 * Copies a given link to the clipboard.
 *
 * @param {string} link - The link to be copied to the clipboard.
 * @returns {Promise<void>} A promise that resolves when the link is successfully copied, or rejects with an error.
 */
export const copyLink = (link: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(textArea);
    }
  });
};

/**
 * Calculates the maximum available Planet NICFI month and year for basemaps.
 * The maximum available month and year is available from the 15th of the next month,
 * as Planet NICFI basemaps are available with a one-month delay.
 *
 * @returns {string} A string representing the year and month in the format 'YYYY-MM'.
 */
export const calculateMaxPlanetMonthYear = (): string => {
  const date = new Date();
  if (date.getDate() <= 15) {
    date.setMonth(date.getMonth() - 2);
  } else {
    date.setMonth(date.getMonth() - 1);
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const monthStr = month < 10 ? `0${month}` : month;
  return `${year}-${monthStr}`;
};

/**
 * Estimates the number of map tiles required for a given zoom level and bounding box.
 *
 * @param {number} maxZoom - The maximum zoom level.
 * @param {string} boundsStr - A string representing the bounding box in the format 'west,south,east,north'.
 * @returns {number} The estimated number of tiles.
 */
export const estimateNumberOfTiles = (
  maxZoom: number,
  boundsStr: string,
): number => {
  const bounds: number[] = boundsStr.split(",").map(Number);

  const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

  const tilesAtZoom = (
    zoom: number,
    [west, south, east, north]: number[],
  ): number => {
    const tileCount = (
      lat: number,
      lon: number,
      zoom: number,
    ): { x: number; y: number } => {
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
      const y = Math.floor(
        ((1 -
          Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) /
            Math.PI) /
          2) *
          Math.pow(2, zoom),
      );
      return { x, y };
    };

    const topLeft = tileCount(north, west, zoom);
    const bottomRight = tileCount(south, east, zoom);

    const tileWidth = Math.abs(bottomRight.x - topLeft.x) + 1;
    const tileHeight = Math.abs(bottomRight.y - topLeft.y) + 1;

    return tileWidth * tileHeight;
  };

  let totalTiles = 0;
  for (let zoom = 0; zoom <= maxZoom; zoom++) {
    totalTiles += tilesAtZoom(zoom, bounds);
  }

  return totalTiles;
};

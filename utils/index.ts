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

export const calculateMaxPlanetMonthYear = () => {
  // If the current day is less than or equal to 15, maxMonth is two months ago.
  // Otherwise, maxMonth is the previous  month.
  // This is because Planet NICFI monthly basemaps for the previous month are published on the 15th of each month.
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

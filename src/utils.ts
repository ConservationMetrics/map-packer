export function copyLink(link: string): Promise<void> {
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
}

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

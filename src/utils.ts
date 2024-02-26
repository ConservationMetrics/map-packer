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

export const calculatePlanetMonthYear = () => {
  // Let's calculate a format like this: YYYY-MM but for two months earlier than this month
  // So if it's ANY day in February, 2024, we want to get 2023-12
  const date = new Date();
  date.setMonth(date.getMonth() - 2);
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed, add 1 to normalize
  const year = date.getFullYear();
  const monthYear = `${year}-${month < 10 ? `0${month}` : month}`;
  return monthYear;
};

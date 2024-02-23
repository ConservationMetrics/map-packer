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

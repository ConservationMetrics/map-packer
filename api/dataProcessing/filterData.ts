export function sortByDate<T>(data: T[], dateField: keyof T): T[] {
  return data.sort((a, b) => {
    const dateA = new Date(a[dateField] as unknown as string);
    const dateB = new Date(b[dateField] as unknown as string);
    return dateB.getTime() - dateA.getTime();
  });
}

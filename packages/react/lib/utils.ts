export const convertToMap = <T extends Record<string, any>>(
  data: T[],
  mapKey: string,
) => {
  const map = new Map();

  for (const i in data) {
    map.set(data[i][mapKey], data[i]);
  }

  return map;
};

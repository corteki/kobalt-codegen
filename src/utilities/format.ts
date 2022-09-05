export const kebabCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

export const indent = (value: string) => {
  const lines = value.split("\n");
  return lines.map((line) => line.trim()).join("\n");
};

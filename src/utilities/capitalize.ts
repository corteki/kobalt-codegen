export const capitalize = (word: string = "") => {
  if (word !== "") {
    const [first, ...rest] = word;
    return `${first?.toUpperCase()}${rest.join("")}`;
  }
  return word;
};

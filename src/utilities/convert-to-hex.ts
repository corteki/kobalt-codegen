import type { Color } from "../__generated__/figma";

export const convertToHex = ({ r, g, b, a }: Color) => {
  const base = 256;
  const color =
    "#" +
    ((a << 24) + ((r * base) << 16) + ((g * base) << 8) + b * base)
      .toString(16)
      .slice(1);

  if (color.length > 7) {
    return color.slice(0, 7);
  }
  return color;
};

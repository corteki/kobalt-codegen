import { convertToHex } from "../utilities/convert-to-hex";
import type { Child, ColorTree } from "./types";

export const createColorToken = (item: Child) => {
  const { children } = item;
  let result: ColorTree | string = {};

  if (children) {
    result = children.reduce<ColorTree>((accumulator, current) => {
      accumulator[current.name] = createColorToken(current as Child);
      return accumulator;
    }, {});
  } else if (item.fills[0]?.color) {
    result = {
      value: convertToHex(item.fills[0].color),
    };
  }

  return result;
};

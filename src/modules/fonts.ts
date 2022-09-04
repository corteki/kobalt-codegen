import { convertToHex } from "../utilities/convert-to-hex";
import type { Child, DaisyChain, Font, FontTree } from "./types";

export const createFontToken = (item: Child) => {
  const { children } = item;
  let result: FontTree | Font = {};

  if (children) {
    result = children.reduce<FontTree>((accumulator, current) => {
      accumulator[current.name] = createFontToken(current as Child);
      return accumulator;
    }, {});
  } else if (item.style && item.fills[0]?.color) {
    const { fontFamily, fontSize, fontWeight, lineHeightPx, letterSpacing } =
      item.style;
    result = {
      value: {
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        letterSpacing,
        lineHeight: `${lineHeightPx}px`,
        color: convertToHex(item.fills[0]?.color),
      },
    };
  }

  return result;
};

export const resolveColorReferences = (
  flattenedColors: DaisyChain,
  font: FontTree
) => {
  const fontsWithColorRefs = Object.entries(font).reduce<FontTree>(
    (accumulator, [key, value]) => {
      if (key === "value") {
        const reference = Object.keys(flattenedColors).find(
          (key) => flattenedColors[key] === value.color
        );

        accumulator[key] = {
          ...value,
          color: `{color.${reference}}`,
        } as Font;
      } else {
        accumulator[key] = resolveColorReferences(
          flattenedColors,
          value as FontTree
        );
      }
      return accumulator;
    },
    {}
  );
  return fontsWithColorRefs;
};

import type { Formatter } from "style-dictionary";
import type { DesignToken } from "style-dictionary/types/DesignToken";
import { capitalize } from "../utilities/capitalize";
import { kebabCase } from "../utilities/format";
import {
  createStyledComponentFont,
  createVariable,
  createTemplate,
  Theme,
} from "./templates";

const theme = new Theme();

const createColorName = (token: DesignToken) => {
  if (token.attributes) {
    const { type, item, category } = token.attributes;
    return `${type}${capitalize(item)}${capitalize(category)}`;
  }
  return "";
};

const createFontName = (token: DesignToken) => {
  if (token.attributes) {
    const { type, item } = token.attributes;
    return `${capitalize(type)}${capitalize(item)}`;
  }
  return "";
};

export const createStyledComponentsFormat: Formatter = ({
  dictionary,
  options,
}) => {
  const body = dictionary.allTokens
    .map((token) => {
      if (typeof token.value === "object") {
        token.value = Object.keys(token.value).reduce(
          (accumulator, current) => {
            const value = token.value[current];
            const newKey = kebabCase(current);
            accumulator[newKey] = value;
            return accumulator;
          },
          {} as any
        );
      }
      let value = JSON.stringify(
        token.value,
        (_, value) => {
          if (typeof value === "object") {
            return Object.entries(value)
              .map(([key, value]) => `${key}: ${value}; `)
              .join(``);
          }
          return `${value}`;
        },
        2
      );
      if (!token.attributes) {
        throw new Error("No attributes available to read from.");
      }

      switch (token.attributes.category) {
        case "color": {
          const name = createColorName(token);
          theme.add(name);
          return createVariable(createColorName(token), value);
        }
        case "font": {
          if (options.outputReferences) {
            if (dictionary.usesReference(token.original.value)) {
              const refs = dictionary.getReferences(token.original.value);
              refs.forEach((ref) => {
                value = value.replace(`${ref.value}`, () => {
                  const name = createColorName(ref);
                  return `\${({theme}) => theme.${name}\}`;
                });
              });
            }
          }

          return createStyledComponentFont(
            createFontName(token),
            value.slice(1, -1)
          );
        }
        default: {
          throw new Error(`Unknown category: ${token.attributes.category}`);
        }
      }
    })
    .join(`\n`);

  return createTemplate(body, theme.build());
};

import type { DaisyChain, Tree } from "../modules/types";

export const flatten = (tree: Tree, prev = "") => {
  const result: DaisyChain = {};

  Object.entries(tree).forEach(([key, value]) => {
    if (typeof value === "object") {
      Object.assign(result, flatten(value, `${prev}${key}.`));
    } else {
      result[`${prev}${key}`] = value;
    }
  });

  return result;
};

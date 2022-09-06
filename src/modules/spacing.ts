import type { Child } from "./types";

export const createSpacingToken = (item: Child) => {
  return item.children.reduce((accumulator, current) => {
    accumulator[current.name] = `${current.absoluteRenderBounds.width}px`;
    return accumulator;
  }, {} as { [key: string]: string });
};

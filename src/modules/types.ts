import type { ChildStyle, PurpleChild } from "../__generated__/figma";

export type Tree<T = string> = {
  [key: string]: Tree<T> | T;
};

export type ColorTree = Tree;

export type Font = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: string;
  color: string;
};

export type FontTree = Tree<Font>;

export type DaisyChain = { [key: string]: string };

export interface Child extends PurpleChild {
  style?: ChildStyle;
}

import { figma } from "../api/figma";
import fs from "fs";
import type {
  DocumentChild,
  Project,
  PurpleChild,
} from "../__generated__/figma";
import tokenGenerator from "style-dictionary";
import { createColorToken } from "./colors";
import { createFontToken, resolveColorReferences } from "./fonts";
import { createStyledComponentsFormat } from "./formats";
import { flatten } from "../utilities/flatten";
import { createThemeDeclaration } from "./templates";

const getStyles = (pages: DocumentChild[]) =>
  pages.find((page) => page.name === process.env["FIGMA_STYLE_PAGE"]);
const getFrame = (frames: PurpleChild[]) => (name: string) =>
  frames.find((frame) => frame.name === name);

export const generateTokens = async () => {
  const project = await figma.getProject<Project>();
  const styles = getStyles(project.document.children);
  if (!styles) {
    throw new Error(
      `Invalid page name: ${process.env["FIGMA_STYLE_PAGE"]} is missing as page in figma`
    );
  }

  const frame = getFrame(styles.children);
  const palette = frame(process.env["FIGMA_COLOR_FRAME"]);

  if (!palette) {
    throw new Error(
      `Invalid frame name: ${process.env["FIGMA_COLOR_FRAME"]} is missing as a frame in figma`
    );
  }

  const color = createColorToken(palette);
  const fonts = frame(process.env["FIGMA_FONT_FRAME"]);

  if (!fonts) {
    throw new Error(
      `Invalid frame name: ${process.env["FIGMA_FONT_FRAME"]} is missing as a frame in figma`
    );
  }

  const font = createFontToken(fonts);
  const tokens = {
    color,
    font: resolveColorReferences(flatten(color), font),
  };

  const outputFolder = `${process.cwd()}/${process.env["OUTPUT_FOLDER"]}`;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }
  const tokenFile = `${outputFolder}/tokens.json`;
  fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));

  const themeFile = `${outputFolder}/theme.d.ts`;
  fs.writeFileSync(themeFile, createThemeDeclaration());

  const outputFile = `${process.env["OUTPUT_FILE"]}.tsx`;
  const buildPath = `${outputFolder}/`;

  tokenGenerator
    .extend({
      format: {
        "typescript/styled-components": createStyledComponentsFormat,
      },
      source: [tokenFile],
      platforms: {
        web: {
          transformGroup: "web",
          buildPath,
          files: [
            {
              destination: outputFile,
              format: "typescript/styled-components",
              options: {
                outputReferences: true,
              },
            },
          ],
          options: {
            outputReferences: true,
          },
        },
      },
    })
    .buildAllPlatforms();
};

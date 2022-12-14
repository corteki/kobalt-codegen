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
import { createTheme, createThemeDeclaration } from "./templates";
import { createSpacingToken } from "./spacing";

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
  const colorFrame = frame(process.env["FIGMA_COLOR_FRAME"]);

  if (!colorFrame) {
    throw new Error(
      `Invalid frame name: ${process.env["FIGMA_COLOR_FRAME"]} is missing as a frame in figma`
    );
  }

  const color = createColorToken(colorFrame);
  const fontFrame = frame(process.env["FIGMA_FONT_FRAME"]);

  if (!fontFrame) {
    throw new Error(
      `Invalid frame name: ${process.env["FIGMA_FONT_FRAME"]} is missing as a frame in figma`
    );
  }

  const font = createFontToken(fontFrame);

  const spacingFrame = frame(process.env["FIGMA_SPACING_FRAME"]);
  if (!spacingFrame) {
    throw new Error(
      `Invalid frame name: ${process.env["FIGMA_SPACING_FRAME"]} is missing as a frame in figma`
    );
  }

  const spacing = createSpacingToken(spacingFrame);

  const tokens = {
    color,
    font: resolveColorReferences(flatten(color), font),
    spacing,
  };

  const theme = {
    color,
    font,
    spacing,
  };

  const outputFolder = `${process.cwd()}/${process.env["OUTPUT_FOLDER"]}`;
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  const tokenFile = `${outputFolder}/tokens.json`;
  fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));

  const themeFile = `${outputFolder}/theme.ts`;
  fs.writeFileSync(themeFile, createTheme(JSON.stringify(theme, null, 2)));
  const themeDeclarationFile = `${process.cwd()}/theme.d.ts`;
  fs.writeFileSync(themeDeclarationFile, createThemeDeclaration());

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
  fs.rmSync(tokenFile);
};

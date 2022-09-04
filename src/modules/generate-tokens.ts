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

type Frames = "fonts" | "colors" | "spacings";

const getStyles = (pages: DocumentChild[]) =>
  pages.find((page) => page.name === "styles");
const getFrame = (frames: PurpleChild[]) => (name: Frames) =>
  frames.find((frame) => frame.name === name);

export const generateTokens = async () => {
  const project = await figma.getProject<Project>();
  const styles = getStyles(project.document.children);
  if (!styles) {
    throw new Error("Invalid page name: styles is missing as page in figma");
  }

  const frame = getFrame(styles.children);
  const palette = frame("colors");

  if (!palette) {
    throw new Error(
      "Invalid frame name: palette is missing as a frame in figma"
    );
  }

  const color = createColorToken(palette);
  const fonts = frame("fonts");

  if (!fonts) {
    throw new Error("Invalid frame name: fonts is missing as a frame in figma");
  }

  const font = createFontToken(fonts);
  const tokens = { color, font: resolveColorReferences(flatten(color), font) };

  if (!fs.existsSync(process.cwd() + "/__generated__")) {
    fs.mkdirSync(process.cwd() + "/__generated__");
  }
  fs.writeFileSync(
    process.cwd() + "/__generated__/tokens.json",
    JSON.stringify(tokens, null, 2)
  );

  fs.writeFileSync("./__generated__/theme.d.ts", createThemeDeclaration());

  tokenGenerator
    .extend({
      format: {
        "typescript/styled-components": createStyledComponentsFormat,
      },
      source: [process.cwd() + "/__generated__/**/*.json"],
      platforms: {
        web: {
          transformGroup: "web",
          buildPath: process.env["OUTPUT_FOLDER"],
          files: [
            {
              destination: process.env["OUTPUT_FILE"] + ".tsx",
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

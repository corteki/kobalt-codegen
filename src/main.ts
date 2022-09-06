#!/usr/bin/env node
import type { ProjectEnv } from "./project-env";
import { generateTokens } from "./modules/generate-tokens";

const validateEnvironment = (keys: (keyof ProjectEnv)[]) => {
  for (const key of keys) {
    if (!process.env[key]) {
      throw new Error(`Invalid .env file: ${key} is missing`);
    }
  }
};

try {
  validateEnvironment([
    "FIGMA_ACCESS_TOKEN",
    "FIGMA_PROJECT_ID",
    "FIGMA_STYLE_PAGE",
    "FIGMA_COLOR_FRAME",
    "FIGMA_FONT_FRAME",
    "FIGMA_SPACING_FRAME",
    "OUTPUT_FOLDER",
    "OUTPUT_FILE",
  ]);

  generateTokens();
} catch (error) {
  console.error((error as Error).message);
}

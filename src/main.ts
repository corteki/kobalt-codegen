#!/usr/bin/env node
import { generateTokens } from "./modules/generate-tokens";

try {
  generateTokens();
} catch (error) {
  console.error(
    `${
      (error as Error).message
    } - check if your .env file exists and matches your figma page and frame names.`
  );
}

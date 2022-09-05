export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIGMA_ACCESS_TOKEN: string;
      FIGMA_PROJECT_ID: string;
      FIGMA_STYLE_PAGE: string;
      FIGMA_COLOR_FRAME: string;
      FIGMA_FONT_FRAME: string;
      OUTPUT_FILE: string;
      OUTPUT_FOLDER: string;
    }
  }
}

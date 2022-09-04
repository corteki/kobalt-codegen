export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIGMA_ACCESS_TOKEN: string;
      FIGMA_PROJECT_ID: string;
      OUTPUT_FILE: string;
      OUTPUT_FOLDER: string;
    }
  }
}

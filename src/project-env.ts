export interface ProjectEnv {
  FIGMA_ACCESS_TOKEN: string;
  FIGMA_PROJECT_ID: string;
  FIGMA_STYLE_PAGE: string;
  FIGMA_COLOR_FRAME: string;
  FIGMA_FONT_FRAME: string;
  FIGMA_SPACING_FRAME: string;
  OUTPUT_FOLDER: string;
  OUTPUT_FILE: string;
  INPUT_TYPE: "frames" | "plugin";
}

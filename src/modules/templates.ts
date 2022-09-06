import { format } from "prettier";

export const createStyledComponentFont = (name: string, font: string) =>
  `export const ${name} = styled.p\`${font}\`;\n`;

export const createTemplate = (body: string) =>
  format(
    `
  import type { ReactNode } from "react";
  import styled, { ThemeProvider } from "styled-components";
  import { theme } from "./theme";
  ${body}
  type GeneratedThemeProps = {
    children?: ReactNode;
  };
  
  export const GeneratedTheme = ({ children }: GeneratedThemeProps) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
  `,
    { parser: "typescript" }
  );

export const createTheme = (tokens: string) =>
  format(
    `
export const theme = ${tokens};
export type Theme = typeof theme;
`,
    { parser: "typescript" }
  );
export const createThemeDeclaration = () =>
  format(
    `
import type { Theme } from "./${process.env["OUTPUT_FOLDER"]}/theme";
import "styled-components";

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
`,
    { parser: "typescript" }
  );

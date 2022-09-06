import { indent } from "../utilities/format";

export const createStyledComponentFont = (name: string, font: string) =>
  `export const ${name} = styled.p\`${font}\`;\n`;

export const createTemplate = (body: string) =>
  indent(`
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
  `);

export const createTheme = (tokens: string) =>
  indent(`
export const theme = ${tokens};
export type Theme = typeof theme;
`);
export const createThemeDeclaration = () =>
  indent(`
import type { Theme } from "./theme";
import "styled-components";

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
`);

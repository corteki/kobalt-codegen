import { indent } from "../utilities/format";

export class Theme {
  variables = [];

  add<T>(attributes: T) {
    (this.variables as T[]).push(attributes);
  }

  build() {
    return indent(`
      const theme = {
        ${this.variables.join(",")}
      }

      type GeneratedThemeProps = {
        children?: ReactNode;
      };
      
      export const GeneratedTheme = ({ children }: GeneratedThemeProps) => (
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      );

      
      export type Theme = typeof theme;
    `);
  }
}

export const createStyledComponentFont = (name: string, font: string) =>
  `export const ${name} = styled.p\`${font}\`;\n`;

export const createVariable = (name: string, value: string) =>
  `export const ${name} = ${value}`;

export const createTemplate = (body: string, theme: string) =>
  indent(`import type { ReactNode } from "react";
  import styled, { ThemeProvider } from "styled-components";
  ${body}
  ${theme}`);

export const createThemeDeclaration = () =>
  indent(`
import type { Theme } from "./${process.env["OUTPUT_FILE"]}";
import "styled-components";

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
`);

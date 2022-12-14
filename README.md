## important

This is still in early development

## getting started

```
npm i kobalt
```

add a npm script to generate components

```
"scripts": {
  "generate": "kobalt",
  ...
}
```

configure your access token for the figma api [here](https://www.figma.com/developers/api#access-tokens) first. Create a .env file with your configuration (don't include the file extension with the filename).

Inside figma, create a page to define a theme and add three frames, one for colors, one for fonts and one for spacing. The structure of the elements inside these frames determine how your variables and components are named.

e.g. colors > base > primary or fonts > base > paragraph. Where colors or fonts is the name of the frame, base is the name of a group and primary is a rectangle with a color variable assigned to it and paragraph is a text element. If the color assigned to the font is a color from the colors frame, kobalt can infer the reference and use the generated theme. The spacing frame should contain a list of rectangles where the width of the rectangle determines what gets generated.

```
FIGMA_ACCESS_TOKEN=<access-token>
FIGMA_PROJECT_ID=<project-id>
FIGMA_STYLE_PAGE=<pagename>
FIGMA_COLOR_FRAME=<framename>
FIGMA_FONT_FRAME=<framename>
FIGMA_SPACING_FRAME=<framename>
OUTPUT_FILE=<filename>
OUTPUT_FOLDER=<foldername>
INPUT_TYPE=frames | plugin
```

generate components

```
npm run generate
```

add the generated declaration file for the styled-components theme to the include property in tsconfig.json

```
{
  "include": ["theme.d.ts", ...],
}
```

import the GeneratedTheme component together with the components themeselves

```
import { GeneratedTheme, ... } from '../<foldername>/<filename>';
```

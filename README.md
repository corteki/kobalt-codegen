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

create a .env file with your configuration (don't include the file extension with the filename)

```
FIGMA_ACCESS_TOKEN=<access-token>
FIGMA_PROJECT_ID=<project-id>
OUTPUT_FILE=<filename>
OUTPUT_FOLDER=<foldername>
```

generate components

```
npm run generate
```

add the generated declaration file for the styled-components theme to the include property in tsconfig.json

```
{
  "include": ["<foldername>/theme.d.ts", ...],
}
```

import the GeneratedTheme component together with the components themeselves

```
import { GeneratedTheme, ... } from '../<foldername>/<filename>';
```

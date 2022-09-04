import fs from "fs";
import { figma } from "./api/figma";
import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from "quicktype/dist/quicktype-core";

/**
 * For development
 *
 * generates types from figma schema
 */
const generateTypes = async () => {
  const project = await figma.getProject();
  if (!fs.existsSync("./src/__generated__")) {
    fs.mkdirSync("./src/__generated__");
  }
  const input = jsonInputForTargetLanguage("ts");
  await input.addSource({
    name: "project",
    samples: [JSON.stringify(project, null, 2)],
  });
  const data = new InputData();
  data.addInput(input);
  const { lines } = await quicktype({
    inputData: data,
    lang: "ts",
    alphabetizeProperties: true,
    inferEnums: true,
  });
  const types = lines.join("\n");
  fs.writeFileSync("./src/__generated__/figma.ts", types);
};

generateTypes();

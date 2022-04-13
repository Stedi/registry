import { readFileSync } from "fs";
import glob from "glob";
import { JSONSchemaToAST } from "./jsonSchemaToAst";
import { validateSchema, validateSchemasDefault } from "./validateJsonSchema";
import { validateProviders } from "./validateProviders";

type PathErrorPair = [string, Error];

async function validateAllSchemas() {
  const errors: PathErrorPair[] = [];
  const paths = glob.sync("schemas/**/*.json");

  paths.forEach((path: string) => {
    try {
      const schema = validateSchema(readFileSync(path, "utf-8"));
      validateSchemasDefault(schema);
      JSONSchemaToAST(schema);
    } catch (e) {
      errors.push([path, e as Error]);

      console.error(`${path} failed validation: `);
      console.error(e);
    }
  });

  if (errors.length > 0) {
    console.error(`${errors.length} errors found.`);
    process.exit(1);
  }
}

(async () => {
  await validateAllSchemas();
  await validateProviders();
})();

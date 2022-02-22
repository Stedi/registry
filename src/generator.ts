import { Provider, SchemaPackage } from "./provider";
import providers from "./providers";
import openAPIParser from "@readme/openapi-parser";
import path from "path";
import fs from "fs";
import { OpenAPIV3 } from "openapi-types";
import { mock } from "./util";

// CommonJS


interface Schema {
  name: string;
  schema: unknown;
}

async function listVersions(providerName: keyof typeof providers) {
  return await providers[providerName].getVersions();
}

async function unbundle(bundle: SchemaPackage): Promise<Schema[]> {
  switch (bundle.type) {
    case "openapi-v3":
      const dereferenced = await openAPIParser.dereference(
        bundle.value as any,
      );
      if (!("components" in dereferenced))
        throw new Error("Expected components");
      return Object.entries(dereferenced.components?.schemas ?? {}).map(
        ([k, v]) => ({
          name: k,
          schema: v,
        })
      );
  }
}

export async function generateForVersion(
  rootPath: string,
  providerName: keyof typeof providers,
  version: string
) {
  const baseDir = path.join(rootPath, providerName, version);
  const folderExists = !fs.mkdirSync(baseDir, { recursive: true });
  if (folderExists) {
    console.log(`Skipping [${providerName}, ${version}]...`);
    return;
  }
  const bundle = await providers[providerName].getSchema(version);
  const schemas = await unbundle(bundle);

  console.log(`Generating [${providerName}, ${version}]...`);
  for (const schema of schemas) {
    const target = path.join(baseDir, `${schema.name}.json`);
    schema.schema = providers[providerName].getSchemaWithoutCircularReferences(schema.schema as OpenAPIV3.SchemaObject);
    (schema.schema as any)["default"] = mock(schema.schema as OpenAPIV3.SchemaObject);
    (schema.schema as any)["$schema"] = "https://json-schema.org/draft/2020-12/schema";
    fs.writeFileSync(target, JSON.stringify(schema.schema, null, 2));
  }
}

export async function generateAll(
  rootPath: string,
  providerName: keyof typeof providers
) {
  const versions = await listVersions(providerName);
  for (const version of versions) {
    await generateForVersion(rootPath, providerName, version);
  }
}

(async () => {
  await generateAll("./schemas", "stripe");
  await generateAll("./schemas", "ramp");
})();


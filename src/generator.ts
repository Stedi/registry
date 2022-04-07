import "dotenv/config";
import providers from "./providers";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import { OpenAPIV3 } from "openapi-types";
import { mock } from "./util";
import { markdownTable } from "markdown-table";
import { promisify } from "util";
import { generateMarkdownTableRow } from "./util/readme";
import { EntitySchema, Provider } from "./provider";

const rootSchemasPath = "./schemas";
const asyncRimraf = promisify(rimraf);

async function generateForVersion(provider: Provider, version: string) {
  if (!provider.isEnabled()) {
    console.log(`Skipping ${provider.name} because it's not enabled.`);
    return;
  }

  const baseDir = provider?.customPath
    ? path.join(rootSchemasPath, provider.customPath)
    : path.join(rootSchemasPath, provider.name.toLowerCase(), version);

  await asyncRimraf(baseDir);

  const folderExists = !fs.mkdirSync(baseDir, { recursive: true });

  if (folderExists) {
    console.log(`Skipping [${provider.name}, ${version}]...`);
    return;
  }

  console.log(`Generating [${provider.name}, ${version}]...`);

  const bundle = await provider.getSchema(version);
  const schemas = await provider.unbundle(bundle);

  const markdownTableRows: string[][] = [];

  for (const schema of schemas) {
    const target = generateEntitySchema(schema, baseDir);

    markdownTableRows.push(
      generateMarkdownTableRow({
        schemaName: schema.name,
        target,
        providerName: provider.name.toLowerCase(),
      }),
    );
  }

  const readmeFileContents = markdownTable([["Source Schema"], ...markdownTableRows]);

  fs.writeFileSync(path.join(baseDir, `README.md`), readmeFileContents);
}

async function generateAll(provider: Provider) {
  const versions = await provider.getVersions();

  for (const version of versions) {
    try {
      await generateForVersion(provider, version);
    } catch (error) {
      console.error("Failed to generate schemas", {
        provider: provider.name,
        version,
        error,
      });
    }
  }
}

function generateEntitySchema(schema: EntitySchema, baseDir: string) {
  const target = path.join(baseDir, `${schema.name}.json`);

  (schema.schema as any)["default"] = mock(schema.schema as OpenAPIV3.SchemaObject);
  (schema.schema as any)["$schema"] = "https://json-schema.org/draft/2020-12/schema";

  fs.writeFileSync(target, JSON.stringify(schema.schema, null, 2));

  return target;
}

function generateProvidersJson() {
  console.log("Writing providers.json...");

  const providersJson = Object.keys(providers).map((name) => {
    const provider: Provider = providers[name as keyof typeof providers];

    return {
      name: provider.name,
      logoUrl: provider.logoUrl,
      description: provider.description,
    };
  });

  fs.writeFileSync("providers.json", JSON.stringify(providersJson, null, 2));
}

(async () => {
  await Promise.all(
    Object.keys(providers).map((providerName) => generateAll(providers[providerName as keyof typeof providers])),
  );

  generateProvidersJson();
})();

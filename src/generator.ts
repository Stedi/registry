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

const asyncRimraf = promisify(rimraf);

async function listVersions(providerName: keyof typeof providers) {
  return await providers[providerName].getVersions();
}

export async function generateForVersion(
  rootPath: string,
  providerName: keyof typeof providers,
  version: string,
  customPath?: string
) {
  if (!providers[providerName].isEnabled()) {
    console.log(`Skipping ${providerName} because it's not enabled.`);
    return;
  }

  const baseDir = customPath
    ? path.join(rootPath, customPath)
    : path.join(rootPath, providerName, version);
  await asyncRimraf(baseDir);

  const folderExists = !fs.mkdirSync(baseDir, { recursive: true });

  if (folderExists) {
    console.log(`Skipping [${providerName}, ${version}]...`);
    return;
  }

  const bundle = await providers[providerName].getSchema(version);
  const schemas = await providers[providerName].unbundle(bundle);

  const markdownTableRows: string[][] = [];

  console.log(`Generating [${providerName}, ${version}]...`);

  for (const schema of schemas) {
    const target = path.join(baseDir, `${schema.name}.json`);

    (schema.schema as any)["default"] = mock(
      schema.schema as OpenAPIV3.SchemaObject
    );
    (schema.schema as any)["$schema"] =
      "https://json-schema.org/draft/2020-12/schema";

    fs.writeFileSync(target, JSON.stringify(schema.schema, null, 2));

    markdownTableRows.push(
      generateMarkdownTableRow({
        schemaName: schema.name,
        target,
        providerName,
      })
    );
  }

  const readmeFileContents = markdownTable([
    ["Source Schema"],
    ...markdownTableRows,
  ]);

  fs.writeFileSync(path.join(baseDir, `README.md`), readmeFileContents);
}

export async function generateAll(
  rootPath: string,
  providerName: keyof typeof providers,
  customPath?: string
) {
  const versions = await listVersions(providerName);

  for (const version of versions) {
    await generateForVersion(rootPath, providerName, version, customPath);
  }
}

(async () => {
  await Promise.all([
    generateAll("./schemas", "stripe"),
    generateAll("./schemas", "ramp"),
    generateAll("./schemas", "twilio"),
    generateAll("./schemas", "netsuite"),
    generateAll("./schemas", "flexport"),
    generateAll("./schemas", "klaviyo"),
    generateAll("./schemas", "xpoLogistics"),
    generateAll("./schemas", "shopify", "./shopify/graphql/2022-01"),
  ]);
})();

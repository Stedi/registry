import { SchemaPackage } from "./provider";
import providers from "./providers";
import openAPIParser from "@readme/openapi-parser";
import jsonSchemaRefParser from "@apidevtools/json-schema-ref-parser";
import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import { fromIntrospectionQuery } from "graphql-2-json-schema";
import { IntrospectionQuery } from "graphql";
import { OpenAPIV3 } from "openapi-types";
import { mock } from "./util";
import { markdownTable } from "markdown-table";
import { promisify } from "util";

const asyncRimraf = promisify(rimraf);

interface Schema {
  name: string;
  schema: unknown;
}

async function listVersions(providerName: keyof typeof providers) {
  return await providers[providerName].getVersions();
}

async function unbundle(bundle: SchemaPackage): Promise<Schema[]> {
  switch (bundle.type) {
    case "graphql":
      const jsonSchema = fromIntrospectionQuery(
        bundle.value as IntrospectionQuery,
        {
          ignoreInternals: true,
          nullableArrayItems: true,
        }
      );

      // Introspection schema lacks QueryRoot definition - adding it manually so it won't crash on dereferencing
      jsonSchema.definitions!["QueryRoot"] = {
        type: "object",
        title: "root",
        description: "root",
      };

      const dereferencedSchemas = await jsonSchemaRefParser.dereference(
        jsonSchema,
        { dereference: { circular: "ignore" } }
      );

      if (!("definitions" in dereferencedSchemas))
        throw new Error("Expected definitions");

      return Object.entries(dereferencedSchemas.definitions ?? {})
        .filter(([key]) =>
          !bundle.entities ? true : bundle.entities.includes(key)
        )
        .map(([k, v]) => ({
          name: k,
          schema: v,
        }));

    case "openapi-v3":
      const dereferenced = await openAPIParser.dereference(bundle.value as any);
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
  version: string,
  customPath?: string
) {
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
  const schemas = await unbundle(bundle);

  const markdownTableRows: string[][] = [];
  console.log(`Generating [${providerName}, ${version}]...`);

  for (const schema of schemas) {
    const target = path.join(baseDir, `${schema.name}.json`);
    schema.schema = providers[providerName].getSchemaWithoutCircularReferences(
      schema.schema as OpenAPIV3.SchemaObject
    );
    (schema.schema as any)["default"] = mock(
      schema.schema as OpenAPIV3.SchemaObject
    );
    (schema.schema as any)["$schema"] =
      "https://json-schema.org/draft/2020-12/schema";
    fs.writeFileSync(target, JSON.stringify(schema.schema, null, 2));

    markdownTableRows.push([
      `${schema.name}.json`,
      mapFromThisSchemaWithSource(target, schema.name),
      mapToThisSchemaWithSource(target, schema.name),
    ]);
  }

  const readmeFileContents = markdownTable([
    ["Source Schema"],
    ...markdownTableRows,
  ]);
  fs.writeFileSync(path.join(baseDir, `README.md`), readmeFileContents);
}

function mapFromThisSchemaWithSource(target: string, schemaName: string) {
  const mappingName = encodeURIComponent(`Mapping from ${schemaName}`);
  return `[![Map from this schema](/images/MapFromThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&source_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
}

function mapToThisSchemaWithSource(target: string, schemaName: string) {
  const mappingName = encodeURIComponent(`Mapping to ${schemaName}`);
  return `[![Map to this schema](/images/MapToThisSchema.svg)](https://terminal.stedi.com/mappings/import?name=${mappingName}&target_json_schema=https://raw.githubusercontent.com/Stedi/registry/main/${target})`;
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
  await generateAll("./schemas", "stripe");
  await generateAll("./schemas", "ramp");
  await generateAll("./schemas", "shopify", "./shopify/graphql/2022-01");
})();

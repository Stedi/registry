import postmanToOpenApi from "postman-to-openapi";
import { mkdirSync, writeFileSync } from "fs";
import { promisify } from "util";
import rimraf from "rimraf";
import yaml from "js-yaml";
import axios from "axios";

const asyncRimraf = promisify(rimraf);

const { POSTMAN_API_KEY } = process.env;

async function fetchCollection(
  collectionId: string,
  postmanApiKey: string
): Promise<any> {
  const url = `https://api.getpostman.com/collections/${collectionId}`;
  return (
    await axios.get(url, {
      headers: {
        "x-api-key": postmanApiKey,
      },
    })
  ).data;
}

export async function generate(
  collectionId: string,
  provider: string,
  postmanApiKey: string
) {
  const collection: any = await fetchCollection(collectionId, postmanApiKey);
  const yamlSchema: string = await postmanToOpenApi(JSON.stringify(collection));
  // Turn the yaml into json, because the generators need json
  const jsonSchema: unknown = yaml.load(yamlSchema);

  await asyncRimraf("./generated");
  mkdirSync(`./generated`, { recursive: true });

  const outputFile: string = `./generated/${provider}.json`;
  writeFileSync(outputFile, JSON.stringify(jsonSchema, null, 2));
}

(async () => {
  if (!POSTMAN_API_KEY) {
    throw Error(`Environment variable POSTMAN_API_KEY is missing.`);
  }

  await generate(
    "20203465-a1bfe895-e3b1-4549-aa89-345ff26285a7",
    "quickbooks",
    POSTMAN_API_KEY
  );
})();

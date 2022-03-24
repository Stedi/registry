import postmanToOpenApi from "postman-to-openapi";
import {mkdirSync, writeFileSync} from "fs";
import {promisify} from "util";
import rimraf from "rimraf";
import yaml from "js-yaml";

const asyncRimraf = promisify(rimraf);

export async function generate(
    rootPath: string,
    provider: string,
    collectionFile: string,
) {
    const inputFile = `${rootPath}/${provider}/${collectionFile}`;
    const schema = await postmanToOpenApi(inputFile, undefined);
    const doc = yaml.load(schema);

    await asyncRimraf('./generated');
    mkdirSync(`./generated`, { recursive: true });
    const outputFile = `./generated/${provider}.json`;
    writeFileSync(outputFile, JSON.stringify(doc, null, 2));
}

(async () => {
    await generate("./postman_collections", "quickbooks", "postman_collection.2022-03-23.json");
})();

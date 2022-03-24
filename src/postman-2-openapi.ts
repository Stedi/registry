import postmanToOpenApi from "postman-to-openapi";
import fs from "fs";
import {promisify} from "util";
import rimraf from "rimraf";

const asyncRimraf = promisify(rimraf);

export async function generate(
    rootPath: string,
    provider: string,
    collectionFile: string,
) {
    const inputFile = `${rootPath}/${provider}/${collectionFile}`;
    const outputFile = `./generated/${provider}.yml`;

    await asyncRimraf(outputFile);
    fs.mkdirSync(`./generated`, { recursive: true });

    await postmanToOpenApi(inputFile, outputFile, {defaultTag: 'General'})
}

(async () => {
    await generate("./postman_collections", "quickbooks", "postman_collection.2022-03-23.json");
})();

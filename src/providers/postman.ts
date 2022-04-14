import { BaseProvider, EntitySchema, OpenAPI3Schema } from "../provider";
import yaml from "js-yaml";
import postmanToOpenApi from "postman-to-openapi";
import _ from "lodash";
import axios from "axios";
import toJsonSchema from "to-json-schema";
import { JSONSchema } from "json-schema-typed/draft-2020-12";
import { OpenAPIV3 } from "openapi-types";

export interface PostmanProviderProps {
  name: string;
  description: string;
  logoUrl: string;
  versions: string[];
  postmanCollectionId: string;
  entities?: string[];
  customPath?: string;
  sanitizeSchema?: (schema: JSONSchema) => JSONSchema;
  docsLink: string | ((schemaName: string) => string);
}

export class PostmanProvider implements BaseProvider {
  public readonly name: string;
  public readonly description: string;
  public readonly logoUrl: string;
  public readonly docsLink: string | ((schemaName: string) => string);
  public readonly customPath: string | undefined;
  /**
   * Versions of the provider's API that are fetched
   */
  public readonly versions: string[];
  /**
   * Optional array of entity names that should be included in the schemas.
   * If undefined, all entities will be included.
   */
  public readonly entities?: string[];
  /**
   * Custom function to sanitize the schema, e.g. remove unsupported keywords or custom formats.
   */
  public readonly sanitizeSchemaFunction?: (schema: JSONSchema) => JSONSchema;

  /**
   * ID of the Postman collection to be fetched from the [Stedi's registry workspace](https://www.postman.com/stedi-inc/workspace/registry)
   */
  public readonly postmanCollectionId?: string;

  private readonly postmanApiKey = process.env.POSTMAN_API_KEY;

  constructor({
    postmanCollectionId,
    name,
    description,
    logoUrl,
    versions,
    docsLink,
    entities,
    sanitizeSchema,
    customPath,
  }: PostmanProviderProps) {
    this.name = name;
    this.description = description;
    this.logoUrl = logoUrl;
    this.versions = versions;
    this.entities = entities;
    this.sanitizeSchemaFunction = sanitizeSchema;
    this.docsLink = docsLink;
    this.customPath = customPath;
    this.postmanCollectionId = postmanCollectionId;
  }

  /**
   * Returns status of provider. Enabled only if POSTMAN_API_KEY environment variable is set.
   */
  isEnabled(): boolean {
    return !!this.postmanCollectionId && !!this.postmanApiKey;
  }

  /**
   * Returns versions of the provider's API that are fetched
   * @returns array of versions
   */
  async getVersions(): Promise<string[]> {
    return this.versions;
  }

  /**
   * Fetches Postman collection based on the postmanCollectionId and transforms it to OpenAPI definition
   * @returns OpenAPI3Schema object containing the OpenAPI definition with the entities to be processed
   */
  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const url = `https://api.getpostman.com/collections/${this.postmanCollectionId}`;
    const collection = await axios.get(url, {
      headers: {
        "x-api-key": this.postmanApiKey as string,
      },
    });

    const yamlOpenApiSchema: string = await postmanToOpenApi(JSON.stringify(collection.data));
    const jsonOpenApiSchema: OpenAPIV3.Document = yaml.load(yamlOpenApiSchema) as OpenAPIV3.Document;

    return {
      type: "openapi-v3",
      versionName: version,
      value: jsonOpenApiSchema,
      entities: this.entities,
    };
  }

  async unbundle({ value }: OpenAPI3Schema): Promise<EntitySchema[]> {
    const results: JSONSchema[] = [...extractRequestBodies(value), ...extractResponseSchemas(value)];

    return results.map((value: JSONSchema) => ({
      name: (value as any).title as string,
      schema: this.sanitizeSchemaFunction ? this.sanitizeSchemaFunction(value) : value,
    }));
  }
}

function extractRequestBodies(value: unknown): JSONSchema[] {
  const results: JSONSchema[] = [];

  for (const [_path, info] of Object.entries((value as any).paths)) {
    if (!(info as any).post) {
      continue;
    }

    const { summary: title, description, requestBody } = (info as any).post;
    const { type, example } = requestBody.content["application/json"].schema;

    const entitySchema: JSONSchema = {
      description: description.includes("\n") ? description.split("\n")[0] : description,
      type,
      title,
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: toJsonSchema(example),
      default: example,
    };

    results.push(entitySchema);
  }

  return results;
}

function extractResponseSchemas(value: unknown): JSONSchema[] {
  const results: JSONSchema[] = [];

  for (const [_path, info] of Object.entries((value as any).paths)) {
    if ((info as any).get) {
      continue;
    }

    const { summary: title, description, responses } = (info as any).get;
    const { schema } = responses["200"].content["application/json"];

    if (schema) {
      const entitySchema: JSONSchema = {
        description: description.includes("\n") ? description.split("\n")[0] : description,
        type: schema.type,
        title,
        $schema: "https://json-schema.org/draft/2020-12/schema",
        properties: toJsonSchema(schema.example),
        default: schema.example,
      };

      results.push(entitySchema);
    }
  }

  return results;
}

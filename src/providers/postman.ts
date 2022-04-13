import { BaseProvider, EntitySchema, OpenAPI3Schema } from "../provider";
import yaml from "js-yaml";
import postmanToOpenApi from "postman-to-openapi";
import _ from "lodash";
import axios from "axios";
import { JSONSchema7 } from "json-schema";
import toJsonSchema from "to-json-schema";

export interface PostmanProviderProps {
  name: string;
  description: string;
  logoUrl: string;
  versions: string[];
  postmanCollectionId: string;
  entities?: string[];
  customPath?: string;
  sanitizeSchema?: (schema: unknown) => unknown;
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
  protected readonly sanitizeSchemaFunction?: (schema: unknown) => unknown;

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
   * Returns status of provider. Enabled only if POSTMAN_API_KEY environement variable is set.
   */
  isEnabled(): boolean {
    return !!this.postmanCollectionId;
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
    if (!this.postmanCollectionId) {
      throw new Error('Neither "postmanCollectionId" wasn\'t provided, nor method "getSchema" was overriden');
    }

    const url = `https://api.getpostman.com/collections/${this.postmanCollectionId}`;
    const collection = await axios.get(url, {
      headers: {
        "x-api-key": this.postmanApiKey as string,
      },
    });

    const yamlOpenApiSchema: string = await postmanToOpenApi(JSON.stringify(collection.data));
    const jsonOpenApiSchema: unknown = yaml.load(yamlOpenApiSchema);

    return {
      type: "openapi-v3",
      versionName: version,
      value: jsonOpenApiSchema,
      entities: this.entities,
    };
  }

  async unbundle({ value }: OpenAPI3Schema): Promise<EntitySchema[]> {
    const results: JSONSchema7[] = [...extractRequestBodies(value), ...extractResponseSchemas(value)];

    return results.map((value) => ({
      name: value.title as string,
      schema: this.sanitizeSchemaFunction ? this.sanitizeSchemaFunction(value) : value,
    }));
  }
}

/**
 * Goes through POST requests and extracts request bodies as JSONSchemas
 */
function extractRequestBodies(value: unknown): JSONSchema7[] {
  const results: JSONSchema7[] = [];

  for (const [_path, info] of Object.entries((value as any).paths)) {
    if ((info as any).post) {
      const { summary: title, description, requestBody } = (info as any).post;
      const { type, example } = requestBody.content["application/json"].schema;

      const entitySchema: JSONSchema7 = {
        description: description.includes("\n") ? description.split("\n")[0] : description,
        type,
        title,
        $schema: "https://json-schema.org/draft/2020-12/schema",
        properties: toJsonSchema(example),
        default: example,
      };

      results.push(entitySchema);
    }
  }

  return results;
}

/**
 * Goes through GET requests and extracts response bodies as JSONSchemas
 */
function extractResponseSchemas(value: unknown): JSONSchema7[] {
  const results: JSONSchema7[] = [];

  for (const [_path, info] of Object.entries((value as any).paths)) {
    if ((info as any).get) {
      const { summary: title, description, responses } = (info as any).get;
      const { schema } = responses["200"].content["application/json"];

      if (schema) {
        const entitySchema: JSONSchema7 = {
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
  }

  return results;
}

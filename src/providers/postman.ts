import { BaseProvider, EntitySchema, OpenAPI3Schema, PostmanSchema } from "../provider";
import _ from "lodash";
import axios from "axios";
import toJsonSchema from "to-json-schema";
import { JSONSchema } from "json-schema-typed/draft-2020-12";
import { CollectionDefinition, ItemDefinition } from "postman-collection";

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
  async getSchema(version: string): Promise<PostmanSchema> {
    const url = `https://api.getpostman.com/collections/${this.postmanCollectionId}`;
    const collection = await axios.get(url, {
      headers: {
        "x-api-key": this.postmanApiKey as string,
      },
    });

    return {
      type: "postman",
      versionName: version,
      value: collection.data,
      entities: this.entities,
    };
  }

  async unbundle({ value }: PostmanSchema): Promise<EntitySchema[]> {
    const results: JSONSchema[] = [...extractRequestBodies(value)];

    return results
      .filter(({ title }: any) => !this.entities || this.entities.includes(title))
      .map((value: JSONSchema) => ({
        name: (value as any).title as string,
        schema: this.sanitizeSchemaFunction ? this.sanitizeSchemaFunction(value) : value,
      }));
  }
}

function extractRequestBodies(collectionDefinition: CollectionDefinition): JSONSchema[] {
  const results: JSONSchema[] = [];

  const value: CollectionDefinition = (collectionDefinition as any).collection;
  if (!value.item) {
    return [];
  }

  value.item.forEach((category) => {
    const item = (category as any).item;

    if (!item) {
      return;
    }

    item.forEach((operation: ItemDefinition) => {
      const request = operation.request;
      if (!request) {
        return;
      }

      try {
        const parsedBody = JSON.parse(request.body?.raw ?? "{}");
        const entitySchema: JSONSchema = {
          description: (request.description as string) ?? "Description missing",
          type: "object",
          title: operation.name,
          $schema: "https://json-schema.org/draft/2020-12/schema",
          properties: toJsonSchema(parsedBody).properties as any,
          default: parsedBody,
        };

        results.push(entitySchema);
      } catch (e) {
        // Fail silently, doesn't matter
      }
    });
  });

  return results;
}

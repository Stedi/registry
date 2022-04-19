import { JSONSchema } from "json-schema-typed/draft-2020-12";
import { OpenAPIV3 } from "openapi-types";
import { NetsuiteProvider } from "./providers/netsuite";
import { OpenAPIProvider } from "./providers/openapi";
import Postman from "postman-collection";

export interface EntitySchema {
  name: string;
  schema: JSONSchema;
}

export interface APISchema<T> {
  type: string;
  versionName: string;
  value: T;
  /**
   * List of Schemas that should be included. If not specified, all schemas will be included.
   */
  entities?: string[];
}

export interface OpenAPI3Schema extends APISchema<OpenAPIV3.Document> {}

export interface PostmanSchema extends APISchema<Postman.Collection> {}

export interface GraphQLIntrospectionSchema extends APISchema<any> {}

export type BaseProvider = {
  isEnabled(): boolean;
  getVersions: () => Promise<string[]>;
  /**
   * Either link to a general documentation or a function pointing to a specific entity documentation if possible.
   */
  docsLink: string | ((schemaName: string) => string);
  name: string;
  description: string;
  logoUrl: string;
  customPath?: string;
};

export type Provider = GraphQLProvider | OpenAPIProvider | NetsuiteProvider;

export interface GraphQLProvider extends BaseProvider {
  getSchema: (version: string) => Promise<APISchema<GraphQLIntrospectionSchema>>;
  unbundle: (bundle: GraphQLIntrospectionSchema) => Promise<EntitySchema[]>;
}

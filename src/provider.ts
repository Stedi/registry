import { NetsuiteProvider } from "./providers/netsuite";
import { OpenAPIProvider } from "./providers/openapi";

export interface EntitySchema {
  name: string;
  schema: unknown;
}

export interface APISchema {
  type: string;
  versionName: string;
  value: unknown;
  /**
   * List of Schemas that should be included. If not specified, all schemas will be included.
   */
  entities?: string[];
}

export interface OpenAPI3Schema extends APISchema {
  type: "openapi-v3";
}

export interface GraphQLIntrospectionSchema extends APISchema {
  type: "graphql";
}

export type SchemaPackage = OpenAPI3Schema | GraphQLIntrospectionSchema;

export type Provider = GraphQLProvider | OpenAPIProvider | NetsuiteProvider;

export interface GraphQLProvider {
  isEnabled(): boolean;
  getVersions: () => Promise<string[]>;
  getSchema: (version: string) => Promise<APISchema>;
  unbundle: (bundle: GraphQLIntrospectionSchema) => Promise<EntitySchema[]>;
}

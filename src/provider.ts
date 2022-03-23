import http from "axios";
import { OpenAPIV3 } from "openapi-types";
import { NetsuiteProvider } from "./providers/netsuite";

export interface Schema {
  name: string;
  schema: unknown;
}

export interface OpenAPI3Schema {
  type: "openapi-v3";
  versionName: string;
  value: unknown;
  /**
   * List of Schemas that should be included. If not specified, all schemas will be included.
   */
  entities?: string[];
}

export interface GraphQLIntrospectionSchema {
  type: "graphql";
  versionName: string;
  value: unknown;
  /**
   * List of GraphQL types that should be included. If not specified, all entities will be included.
   */
  entities?: string[];
}

export type SchemaPackage = OpenAPI3Schema | GraphQLIntrospectionSchema;

export type Provider = GraphQLProvider | OpenAPIProvider | NetsuiteProvider;

export interface OpenAPIProvider {
  getVersions: () => Promise<string[]>;
  getSchema: (version: string) => Promise<OpenAPI3Schema>;
  getSchemaWithoutCircularReferences(
    schema: OpenAPIV3.SchemaObject
  ): OpenAPIV3.SchemaObject;
  unbundle: (bundle: OpenAPI3Schema) => Promise<Schema[]>;
}

export interface GraphQLProvider {
  getVersions: () => Promise<string[]>;
  getSchema: (version: string) => Promise<GraphQLIntrospectionSchema>;
  unbundle: (bundle: GraphQLIntrospectionSchema) => Promise<Schema[]>;
}

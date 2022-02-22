import http from "axios";
import { OpenAPIV3 } from "openapi-types";

export interface OpenAPI3Schema {
  type: "openapi-v3";
  versionName: string;
  value: unknown;
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

export interface Provider {
  getVersions: () => Promise<string[]>;
  getSchema: (version: string) => Promise<SchemaPackage>;
}

export function openAPIUrlProvider(
  versions: Record<
    string,
    {
      url: string;
      transform?: (definition: unknown) => Promise<OpenAPIV3.Document>;
    }
  >
): Provider {
  return {
    getVersions: async () => Object.entries(versions).map(([k, _]) => k),
    getSchema: async (version) => {
      const { url, transform } = versions[version];
      const { data } = await http.get(url);
      return {
        type: "openapi-v3",
        versionName: version,
        value: !!transform ? await transform(data) : data,
      };
    },
  };
}

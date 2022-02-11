import http from "axios";
import { OpenAPIV3 } from "openapi-types";

export interface OpenAPI3Schema {
  type: "openapi-v3";
  versionName: string;
  value: unknown;
}

export type SchemaPackage = OpenAPI3Schema;

export interface Provider {
  getVersions: () => Promise<string[]>;
  getSchema: (version: string) => Promise<SchemaPackage>;
  shouldGenerateMock?: boolean;
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
    shouldGenerateMock: true
  };
}

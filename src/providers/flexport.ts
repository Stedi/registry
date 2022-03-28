import { EntitySchema, OpenAPI3Schema, OpenAPIProvider } from "../provider";
import * as github from "../github";
import yaml from "js-yaml";
import openAPIParser from "@readme/openapi-parser";
import _ from "lodash";

export class FlexportProvider implements OpenAPIProvider {
  isEnabled(): boolean {
    return true;
  }

  async getVersions(): Promise<string[]> {
    return ["v2"];
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw(
      "distributeaid",
      "flexport-sdk-js",
      "saga",
      `api-docs/${version}.yaml`
    );

    return {
      type: "openapi-v3",
      versionName: version,
      value: yaml.load(definition),
      entities: [
        "Container",
        "Shipment",
        "Booking",
        "Invoice",
        "Product",
        "Document",
      ],
    };
  }

  async unbundle(bundle: OpenAPI3Schema): Promise<EntitySchema[]> {
    const dereferenced = await openAPIParser.dereference(bundle.value as any);

    const hasComponents = "components" in dereferenced;
    if (!hasComponents) throw new Error("Expected components");

    return Object.entries(dereferenced.components?.schemas ?? {})
      .filter(([key]) => !bundle.entities || bundle.entities.includes(key))
      .map(([key, value]) => ({
        name: key,
        schema: value,
      }));
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (key === "example") {
        return undefined;
      }

      // Skip "format": "string"
      if (value?.format === "string") {
        const { format, ...rest } = value;
        return { ...rest };
      }

      return value;
    })
  );
}

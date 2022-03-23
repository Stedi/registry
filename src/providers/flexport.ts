import { OpenAPI3Schema, Provider } from "../provider";
import * as github from "../github";
import { OpenAPIV3 } from "openapi-types";
import yaml from "js-yaml";
import _ from "lodash";

export class FlexportProvider implements Provider {
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

  getSchemaWithoutCircularReferences(
    schema: OpenAPIV3.SchemaObject
  ): OpenAPIV3.SchemaObject {
    return schema;
  }
}

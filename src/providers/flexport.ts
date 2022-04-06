import { OpenAPI3Schema } from "../provider";
import * as github from "../github";
import yaml from "js-yaml";
import _ from "lodash";

import { OpenAPIProvider } from "./openapi";
export class FlexportProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["v2"],
      baseUrl: "https://klaviyo-openapi.s3.amazonaws.com/spec.json",
      entities: [
        "person",
        "metric",
        "template",
        "campaign",
        "identify_payload",
        "check_membership_request",
        "check_membership_response",
      ],
      sanitizeSchema,
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw("distributeaid", "flexport-sdk-js", "saga", `api-docs/${version}.yaml`);

    return {
      type: "openapi-v3",
      versionName: version,
      value: yaml.load(definition),
      entities: ["Container", "Shipment", "Invoice", "Product", "Document"],
    };
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.nullable) {
        delete value.nullable;
      }

      if (key === "code") {
        return {
          ...value,
          example: value.example.toString(),
        };
      }

      if (key === "value" && value.format === "decimal") {
        return {
          ...value,
          example: "1000.0",
        };
      }

      if (key === "codes" && value?.items?.example) {
        return {
          ...value,
          items: {
            ...value.items,
            example: value.items.example.toString(),
          },
        };
      }

      if (key === "notes") {
        return {
          ...value,
          example: ["Markdown formatted note 1", "Markdown formatted note 2"],
        };
      }

      if (value && value["oneOf"]) {
        value["anyOf"] = value["oneOf"];
        delete value["oneOf"];
        return value;
      }

      // Skip "format": "string"
      if (value?.format === "string") {
        const { format, ...rest } = value;
        return { ...rest };
      }

      return value;
    }),
  );
}

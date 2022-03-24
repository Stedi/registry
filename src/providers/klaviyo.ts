import { OpenAPI3Schema, Provider } from "../provider";
import { OpenAPIV3 } from "openapi-types";
import _ from "lodash";
import axios from "axios";

export class KlaviyoProvider implements Provider {
  async getVersions(): Promise<string[]> {
    return ["2021.11.26"];
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(
      "https://klaviyo-openapi.s3.amazonaws.com/spec.json"
    );

    return {
      type: "openapi-v3",
      versionName: version,
      value: definition.data,
      entities: [
        "person",
        "metric",
        "template",
        "campaign",
        "identify_payload",
        "check_membership_request",
        "check_membership_response",
      ],
    };
  }

  getSchemaWithoutCircularReferences(
    schema: OpenAPIV3.SchemaObject
  ): OpenAPIV3.SchemaObject {
    return sanitizeSchema(schema);
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (key === "example") {
        return undefined;
      }

      return value;
    })
  );
}

import { OpenAPI3Schema, Provider } from "../provider";
import { OpenAPIV3 } from "openapi-types";
import _ from "lodash";
import axios from "axios";
import { SchemaObject } from "ajv";

export class XPOLogisticsProvider implements Provider {
  async getVersions(): Promise<string[]> {
    return ["1.0.0"];
  }

  async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(
      "https://xpodotcom.azureedge.net/xpo/apidocs_files/s41/api-explorer-02182022.json"
    );

    return {
      type: "openapi-v3",
      versionName: version,
      value: definition.data,
      entities: [
        "shipmentEvent",
        "quoterequest",
        "quoteresponse",
        "orderStatus",
        "orderEvent",
        "Order",
        "document",
      ],
    };
  }

  getSchemaWithoutCircularReferences(
    schema: OpenAPIV3.SchemaObject
  ): OpenAPIV3.SchemaObject {
    return sanitizeSchema(schema);
  }
}

function sanitizeSchema(schema: OpenAPIV3.SchemaObject) {
  // Fix schema.properties.additionalServices in Order.json
  const additionalServices = schema.properties
    ?.additionalServices as SchemaObject;

  if (additionalServices?.items.required) {
    additionalServices.items.required = additionalServices.items.required.map(
      (s: string) => s.toLowerCase()
    );
  }

  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      const isKeyUnsupported =
        key === "example" || key === "Description" || key === "discriminator";

      if (isKeyUnsupported) {
        return undefined;
      }

      return value;
    })
  );
}

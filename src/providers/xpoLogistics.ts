import { OpenAPIV3 } from "openapi-types";
import { OpenAPIProvider } from "./openapi";
import { SchemaObject } from "ajv";

export class XPOLogisticsProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["1.0.0"],
      baseUrl:
        "https://xpodotcom.azureedge.net/xpo/apidocs_files/s41/api-explorer-02182022.json",
      entities: [
        "shipmentEvent",
        "quoterequest",
        "quoteresponse",
        "orderStatus",
        "orderEvent",
        "document",
      ],
      sanitizeSchema,
    });
  }
}

function sanitizeSchema(schema: unknown) {
  // Fix schema.properties.additionalServices in Order.json
  const additionalServices = (schema as OpenAPIV3.SchemaObject).properties
    ?.additionalServices as SchemaObject;

  if (additionalServices?.items.required) {
    additionalServices.items.required = additionalServices.items.required.map(
      (s: string) => s.toLowerCase()
    );
  }

  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      const isKeyUnsupported =
        key === "example" ||
        key === "Description" ||
        key === "discriminator" ||
        key === "code";

      if (isKeyUnsupported) {
        return undefined;
      }

      if (key === "transportationMode") {
        delete value.enum;
      }

      if (key === "stops" && value.required) {
        delete value.required;
      }

      return value;
    })
  );
}

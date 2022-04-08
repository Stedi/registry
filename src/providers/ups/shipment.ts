import axios from "axios";
import { OpenAPIProvider } from "../openapi";

export class UPSShipmentProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "UPS Shipment",
      description:
        "UPS is a package delivery company that offers the transportation of packages and freight and the facilitation of international trade.",
      logoUrl: "https://logo.clearbit.com/ups.com",
      versions: ["1.0.1"],
      baseUrl: "https://www.ups.com/upsdeveloperkit/assets/json/Shipment.js",
      docsLink: "https://www.ups.com/upsdeveloperkit/",
      customPath: "ups/shipment/1.0.1/",
      sanitizeSchema,
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      // Unsupported property
      if (value?.xml) {
        delete value.xml;
      }

      // Maximum property cannot be used in conjunction with type "object"
      if (value?.maximum && value?.type === "object") {
        delete value.maximum;
      }

      return value;
    }),
  );
}

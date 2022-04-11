import axios from "axios";
import { OpenAPI3Schema } from "../../provider";
import { OpenAPIProvider } from "../openapi";

export class UPSFreightShipProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "UPS Freight Ship",
      description:
        "UPS is a package delivery company that offers the transportation of packages and freight and the facilitation of international trade.",
      logoUrl: "https://logo.clearbit.com/ups.com",
      versions: ["1.0.1"],
      baseUrl: "https://www.ups.com/upsdeveloperkit/assets/json/FreightShip.js",
      docsLink: "https://www.ups.com/upsdeveloperkit/",
      customPath: "ups/freightShip/1.0.1/",
      entities: [
        "FreightShipResponse",
        "FreightShipRequest",
        "Shipment_Documents",
        "Shipment_PickupRequest",
        "Shipment_PaymentInformation",
        "Shipment_ShipFrom",
      ],
      sanitizeSchema,
    });
  }
  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(this.baseUrl!);

    return {
      type: "openapi-v3",
      versionName: version,
      value: JSON.parse(definition.data.replace("freightship= ", "")),
      entities: this.entities,
    };
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

import axios from "axios";
import { OpenAPI3Schema } from "../../provider";
import { OpenAPIProvider } from "../openapi";

export class UPSTrackProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "UPS Track",
      description:
        "UPS is a package delivery company that offers the transportation of packages and freight and the facilitation of international trade.",
      logoUrl: "https://logo.clearbit.com/ups.com",
      versions: ["1.0.1"],
      baseUrl: "https://www.ups.com/upsdeveloperkit/assets/json/Track.js",
      docsLink: "https://www.ups.com/upsdeveloperkit/",
      customPath: "ups/track/1.0.1/",
      entities: [
        "TrackResponse",
        "TrackResponse_Shipment",
        "Shipment_Package",
        "TrackRequest",
        "Shipment_Activity",
        "Shipment_QuantumViewNotification",
        "Shipment_ShipmentAddress",
        "TrackResponse_Response",
        "Package_PackageAddress",
        "Shipment_Document",
        "TrackRequest_Request",
        "Activity_Document",
      ],
      sanitizeSchema,
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await axios.get(this.baseUrl!);

    return {
      type: "openapi-v3",
      versionName: version,
      value: JSON.parse(definition.data.replace("track= ", "")),
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

      // maxLength property cannot be used in conjunction with type "object"
      if (value?.maxLength && value?.type === "object") {
        delete value.maxLength;
      }

      // minLength property cannot be used in conjunction with type "object"
      if (value?.minLength && value?.type === "object") {
        delete value.minLength;
      }

      // Maximum property cannot be used in conjunction with type "object"
      if (value?.maximum && value?.type === "object") {
        delete value.maximum;
      }

      return value;
    }),
  );
}

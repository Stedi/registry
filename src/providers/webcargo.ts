import { OpenAPIProvider } from "./openapi";

export class WebCargoProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl:
        "https://integration.freightos.com/api-editing/sharing/c4c5bae2-c57a-4dd8-9755-816d8d22cb67?content=true",
      description:
        "WebCargo is a Digital Air Cargo leader, offering real-time air cargo capacity, pricing, and eBooking on the largest airline network.",
      docsLink: "https://www.webcargo.co/vista-sales-portal-apis/",
      logoUrl: "https://www.webcargo.co/wp-content/uploads/2019/05/horizontal-color-logo-with-white-text.png",
      name: "WebCargo",
      versions: ["1.0"],
      sanitizeSchema,
      entities: [
        "AdditionalInformation",
        "Attachments",
        "BookingRequest",
        "Dimensions",
        "EventDate",
        "FeeBreaks",
        "FeeTypeShipmentCharges",
        "Groups",
        "HazardousInfo",
        "Legs",
        "LocationCoordinate",
        "PriceIndicatorTypeShipmentCharges",
        "ResponseStatus",
        "Services",
        "ShipmentChargesMessage",
        "SpecialHandlingCodes",
        "TrackingInfo",
        "TrackingMessage",
        "TransportationMode",
      ],
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      // Some WebCargo schemas contain xml fields with are not compatible with JSONSchema spec
      if (value?.xml) {
        delete value.xml;
      }

      if (value?.["x-className"]) {
        delete value["x-className"];
      }

      return value;
    }),
  );
}

import { OpenAPIProvider } from "./openapi";

export class FreightOSProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl: "https://integration.freightos.com/documentation/rest/v1/specs?id=6",
      description:
        "Freightos makes global trade frictionless, combining the largest online freight marketplace with powerful freight digitization tools.",
      docsLink: "https://integration.freightos.com/portal/openfreight/6/specs",
      logoUrl: "https://logo.clearbit.com/freightos.com",
      name: "FreightOS OpenFreight",
      versions: ["1.2.0"],
      customPath: "freightos/openfreight/1.2.0/",
      sanitizeSchema,
      entities: [
        "Accessorials",
        "AccountIDList",
        "AdditionalInformation",
        "AddressLines",
        "Attachments",
        "BookingConnectionSegments",
        "CommodityClassification",
        "ConnectionSegments",
        "Dimensions",
        "DocumentIdentifierPrefixList",
        "DocumentIdentifiers",
        "EstimatedTransitTimes",
        "EventDate",
        "ExchangeRates",
        "FeeBreaks",
        "Groups",
        "HazardousInfo",
        "Legs",
        "LocationCoordinate",
        "Packages",
        "Products",
        "SpecialHandlingCodes",
        "TransportationMode",
        "TransportEquipments",
      ],
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      // Some FreightOS schemas contain xml fields with are not compatible with JSONSchema spec
      if (value?.xml) {
        delete value.xml;
      }

      return value;
    }),
  );
}

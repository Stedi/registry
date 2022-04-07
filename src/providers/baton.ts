import { OpenAPIProvider } from "./openapi";

export class BatonProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Baton",
      description:
        "Baton is a tech-enabled hub and spoke network of drop zones and local drivers that eliminates last-mile inefficiency in long haul trucking.",
      logoUrl: "https://logo.clearbit.com/baton.io",
      versions: ["1.0"],
      baseUrl: "https://courier.baton.io/api/v1/swagger.json",
      entities: [
        "Contact",
        "NavTracVehicle",
        "StopAction",
        "Dropzone",
        "OrderCancelRequest",
        "Facility",
        "StopResponse",
        "NavTracGateEvent",
        "OrderResponse",
        "Trailer",
        "NavTracSmartGateEventRequest",
        "OrderStatusRequest",
        "TrailerUpdateRequest",
        "NavTracSmartGateEventResponse",
        "UpdateTrailersResponse",
        "NavTracTrailer",
      ],
      sanitizeSchema,
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      // In Baton's case, allOfs have only one element, so we can just remove the array and flatten it
      if (value.allOf) {
        return value.allOf[0];
      }
    }),
  );
}

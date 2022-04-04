import { OpenAPIProvider } from "./openapi";

export class KlaviyoProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["2021.11.26"],
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
    });
  }
}

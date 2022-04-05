import { OpenAPIProvider } from "./openapi";

export class KlaviyoProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Klaviyo",
      description:
        "Klaviyo, a marketing automation platform that automates SMS and email marketing to help businesses acquire, retain and grow their customers.",
      logoUrl: "https://logo.clearbit.com/klaviyo.com",
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
      docsLink: "https://developers.klaviyo.com/en/reference/api-overview",
    });
  }
}

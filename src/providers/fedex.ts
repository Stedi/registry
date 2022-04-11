import { OpenAPIProvider } from "./openapi";

export class FedexProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl: "https://developer.fedex.com/wirc/json/api_groups/Ship/Tag-Resource.json",
      description: "FedEx",
      docsLink: "https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html",
      logoUrl: "https://logo.clearbit.com/fedex.com",
      name: "FedEx",
      versions: ["1.0.0"],
    });
  }
}

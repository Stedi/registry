import { OpenAPI3Schema } from "../provider";
import * as github from "../github";
import yaml from "js-yaml";
import { OpenAPIProvider } from "./openapi";

export class ConvoyProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Convoy",
      description: "Convoy is the nation's most efficient digital freight network.",
      logoUrl: "https://logo.clearbit.com/convoy.com",
      versions: ["0.1.12"],
      baseUrl: "https://github.com/frain-dev/convoy/blob/main/docs/v3/openapi3.yaml",
      docsLink: "https://convoy.readme.io/reference/introduction",
    });
  }

  override async getSchema(version: string): Promise<OpenAPI3Schema> {
    const definition = await github.getRaw("frain-dev", "convoy", "main", "docs/v3/openapi3.yaml");

    return {
      type: "openapi-v3",
      versionName: version,
      value: yaml.load(definition as string),
      entities: [
        "models.Application",
        "models.Endpoint",
        "datastore.EventDelivery",
        "datastore.DeliveryAttempt",
        "datastore.Group",
      ],
    };
  }
}

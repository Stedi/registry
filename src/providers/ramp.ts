import _ from "lodash";
import { OpenAPIProvider } from "./openapi";

export class RampProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Ramp",
      logoUrl: "https://logo.clearbit.com/ramp.com",
      description: "Ramp is a finance automation platform that helps businesses spend less time and money.",
      versions: ["v1"],
      baseUrl: "https://docs.ramp.com/openapi/v1/ramp-developer.json",
      sanitizeSchema,
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.["x-examples"]) {
        delete value["x-examples"];
      }

      if (value?.["x-tags"]) {
        delete value["x-tags"];
      }

      return value;
    }),
  );
}

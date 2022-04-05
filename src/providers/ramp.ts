import _ from "lodash";
import { OpenAPIProvider } from "./openapi";

export class RampProvider extends OpenAPIProvider {
  constructor() {
    super({
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

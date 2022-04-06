import { OpenAPIProvider } from "./openapi";

export class MaerskProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["1.4"],
      baseUrl: "https://api.productmanagement.maersk.com/offers/docs/v3/api-docs",
      sanitizeSchema,
    });
  }
}

function sanitizeSchema(schema: unknown) {
  return JSON.parse(
    JSON.stringify(schema, (key, value) => {
      if (value?.format === "bigdecimal" || value?.format === "biginteger") {
        delete value.format;
      }

      return value;
    }),
  );
}

import { OpenAPIProvider } from "./openapi";

export class MaerskProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "Maersk",
      description:
        "Maersk is an integrated container logistics company working to connect and simplify its customers' supply chains.",
      logoUrl: "https://iconape.com/wp-content/files/ac/21408/png/a-p-moller-maersk-group.png",
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

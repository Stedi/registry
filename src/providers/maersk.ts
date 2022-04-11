import { OpenAPIProvider } from "./openapi";

export class MaerskProvider extends OpenAPIProvider {
  constructor() {
    super({
      baseUrl: "https://api.productmanagement.maersk.com/offers/docs/v3/api-docs",
      description:
        "Maersk is an integrated container logistics company working to connect and simplify its customers' supply chains.",
      docsLink: "https://api.productmanagement.maersk.com/offers/docs/index.html",
      logoUrl: "https://iconape.com/wp-content/files/ac/21408/png/a-p-moller-maersk-group.png",
      name: "Maersk",
      sanitizeSchema,
      versions: ["1.4"],
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

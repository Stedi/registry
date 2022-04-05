import { OpenAPIProvider } from "./openapi";

export class BatonProvider extends OpenAPIProvider {
  constructor() {
    super({
      versions: ["1.0"],
      baseUrl: "https://courier.baton.io/api/v1/swagger.json",
    });
  }
}

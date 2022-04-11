# Welcome to Registry contributing guide

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [stedi.com/registry/json-schemas](https://www.stedi.com/registry/json-schemas) :sparkles:.

In this guide you will get an overview on how to contribute schemas to the Stedi's Registry.

There are two ways to contribute schemas to the registry:

- By adding a _Provider_ which is a Typescript program that can generate schemas in an automated, repeatable and consistent way by sourcing and unbunding them from some other source
- By adding schemas manually, if schemas cannot be extracted in an automated way (e.g. when the service is not exposing API definition in a machine-readable way)

### Adding a provider

To add a new provider, please create a new file in the `src/providers` repository. The file name should be the provider name + `.ts` suffix. The file should contain a class implementing `BaseProvider` (or inheriting an other class that already implements `BaseProvider`).

A typial provider consists of few things:

- metadata - the `name`, `description`, `logoURL` and `versions` of the API
- `async getSchema(version: string): Promise<APISchema>` function - logic responsible for fetching spec from some URL
- `async unbundle(bundle: unknown): Promise<EntitySchema[]>` function - logic responsible for sanitization and breaking down the spec into multiple JSONSchemas

Please see generic [OpenAPI Provider](https://github.com/Stedi/registry/blob/main/src/providers/openapi.ts) to see an example implementation of the `BaseProvider`.

#### OpenAPI-based Provider

If the API you want to add to the Registry exposes [OpenAPI](https://www.openapis.org) or [Swagger](https://swagger.io) specification, you can use the following template to create a provider:

```ts
import { OpenAPIProvider } from "./openapi";

export class MyCompanyNewProvider extends OpenAPIProvider {
  constructor() {
    super({
      name: "MyCompany",
      logoUrl: "https://logo.clearbit.com/my-company.com",
      description: "My Company is a company...",
      versions: ["v1"],
      baseUrl: "https://docs.my-company.com/meta/v1/openapi.json",
    });
  }
}
```

If the entities generated as a result of `unbundle` logic contain non-standard fields or formats not recognized by JSONSchema, you can supply a custom `sanitizeSchema(schema: unknown) => unknown` function to remove unwanted properties from the generated JSONSchemas.

Sometimes the unbundled schema exports too many entities. Many of them may not be necessary from the registry's perspective. If that's the case, supply an optional `entities: string[]` array argument with the list of entity names that should be exclusively generated.

After writing your provider, please also add it to the `src/providers/index.ts` file.

Lastly, run `npm run generate` to generate the schemas and update the `providers.json` file. You can also run `npm run validate` to ensure that generated schemas are valid and will be accepted by [Mappings](https://www.stedi.com/products/mappings).

If the _validate_ task succeeds, you can commit your changes to branch or fork and create a pull request. We will review your pull request and if it's accepted, we will add your provider to the registry.

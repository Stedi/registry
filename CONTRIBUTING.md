# Welcome to Registry contributing guide

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [stedi.com/registry/json-schemas](https://www.stedi.com/registry/json-schemas) :sparkles:.

In this guide you will get an overview of the contribution workflow from creating a provider, creating a PR, reviewing, and merging the PR.

### Adding a provider

To add a new provider, please create a new file in the `src/providers` repository. The file name should be the provider name + `.ts` suffix. The file should contain a class implementing `BaseProvider` (or inheriting an other class that already implements `BaseProvider`).

A typial provider consists of few things:

- metadata - the name, description, logo URL and versions of the API
- `async getSchema(version: string): Promise<APISchema>` function - logic responsible for fetching spec from some URL
- `async unbundle(bundle: unknown): Promise<EntitySchema[]>` function - logic responsible for sanitization and breaking down the spec into multiple JSONSchemas

Please see generic [OpenAPI Provider](https://github.com/Stedi/registry/blob/main/src/providers/openapi.ts) to see an example implementation of the `BaseProvider`.

If the API you want to add to the Registry exposes OpenAPI or Swagger specification, you can use the following template to automate this process:

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

If the entities generated as a result of `unbundle` logic contain non-standard fields or formats not recognized by JSONSchema, you can supply a custom `sanitizeSchema(schema: unknown) => unknown` to remove unwanted properties from the generated schemas.

Sometimes the unbundles schema exports too many entities, many of them not important from the registry's perspective. If that's the case, supply an optional `entities: string[]` array argument with the list of entity names that should be exclusively generated.

After writing your provider, please also add it to the `src/providers/index.ts` file.

After doing so, you can run commands `npm run generate && npm run validate` to ensure that your provider's schemas are generating correctly and are valid.



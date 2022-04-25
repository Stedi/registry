# Welcome to Registry contributing guide

Thank you for investing your time in contributing to our project! Any contribution you make will be reflected on [stedi.com/registry/json-schemas](https://www.stedi.com/registry/json-schemas) :sparkles:.

In this guide, you will get an overview of how to contribute schemas to the Stedi's Registry.

There are two ways to contribute schemas to the Registry:

- By adding a _Provider_, which is a TypeScript program that can generate schemas in an automated, repeatable and consistent fashion by sourcing and unbundling them from another source (e.g., a hosted OpenAPI specification or a Postman collection)
- By adding schemas manually, if schemas cannot be extracted in an automated way (e.g., when the service is not exposing API definition in a machine-readable way).

## Before you start

To make sure you are always using the recommended version of the Node to contribute to this project, install [Volta](https://github.com/volta-cli/volta):

```
curl https://get.volta.sh | bash
```

and start your terminal session. From this point, `volta` will always ensure you're using correct version of Node.

### Adding a Provider

To add a new provider, please create a new file in the `src/providers` repository. The file name should be the provider name + `.ts` suffix. The file should contain a class implementing `BaseProvider` (or inheriting another class that already implements `BaseProvider`).

A typical provider consists of few things:

- metadata - the `name`, `description`, `logoURL` and `versions` of the API
- `async getSchema(version: string): Promise<APISchema>` function - logic responsible for fetching spec from some URL
- `async unbundle(bundle: unknown): Promise<EntitySchema[]>` function - logic responsible for sanitization and breaking down the spec into multiple JSON Schemas.

Please see generic [OpenAPI Provider](https://github.com/Stedi/registry/blob/main/src/providers/openapi.ts) to see an example implementation of the `BaseProvider`.

#### OpenAPI-based Provider

If the API you want to add to the Registry exposes [OpenAPI](https://www.openapis.org) or [Swagger](https://swagger.io) specification, you can use the following template to create a provider:

```ts
import { OpenAPIProvider } from "./openapi";

export class MyPostmanBasedProvider extends PostmanProvider {
  constructor() {
    super({
      name: "MyPostmanBasedProvider",
      description: "This company uses Postman",
      logoUrl: "https://logo.clearbit.com/postman.com",
      versions: ["1"],
      postmanCollectionId: "12143221-f27bc33f-082f-45f6-b143-cd3c7d4241da",
      docsLink: "https://developer.intuit.com/app/developer/qbo/docs/develop",
    });
  }
}
```

After writing your provider, please also add it to the `src/providers/index.ts` file.

#### Postman-based Provider

If the API you want to add to the Registry exposes [Postman](https://www.postman.com) collection, you can add it to the Registry in two steps:

1. Import desired collection to the Stedi's ["registry" workspace](https://www.postman.com/stedi-inc/workspace/registry/overview) in Postman.
2. Use the following template to create a provider:

```ts
import { PostmanProvider } from "./postman";

export class MyPostmanBasedProvider extends PostmanProvider {
  constructor() {
    super({
      name: "MyPostmanBasedProvider",
      description: "This company uses Postman",
      logoUrl: "https://logo.clearbit.com/postman.com",
      versions: ["1"],
      postmanCollectionId: "12143221-f27bc33f-082f-45f6-b143-cd3c7d4241da",
      docsLink: "https://developer.intuit.com/app/developer/qbo/docs/develop",
    });
  }
}
```

After writing your provider, please also add it to the `src/providers/index.ts` file. Please also make sure to have an environment variable `POSTMAN_API_KEY` set that has access to the Postman workspace.

#### Postprocessing

If the entities generated as a result of `unbundle` logic contain non-standard fields or formats not recognized by JSONSchema, you can supply a custom `sanitizeSchema(schema: unknown) => unknown` function to remove unwanted properties from the generated JSONSchemas.

If the entities generated as a result of the `npm run generate` command contains non-standard fields or formats not recognized by JSON Schema, you can supply a custom `sanitizeSchema(schema: unknown) => unknown` function to remove unwanted properties from the generated JSON Schemas.

Sometimes the unbundled schema exports too many entities. Many of them may not be necessary from the Registry's perspective - they can be virtual, meaningless, or not provide any value. If that's the case, supply an optional `entities: string[]` array argument with the list of entity names that should be exclusively generated.

If a provider (e.g., FedEx, UPS) has multiple APIs, you can use `customPath` to specify where a generated schema will land in the Registry.

#### Finalizing

Lastly, run `npm run generate` to generate the schemas. You can also run `npm run validate` to ensure that generated schemas are valid and will be accepted by [Mappings](https://www.stedi.com/products/mappings).

If the _validate_ task succeeds, you can commit your changes to the branch or fork and create a pull request. We will review your pull request, and if it's accepted, we will add your provider to the Registry.

#### Best practices

- Try to keep the contributions scoped only to the provider you're currently working on. If `npm run generate` results in changes introduced in other providers, please exclude them. The drift should be addressed in a separate PR to keep things simple.
- Include only meaningful schemas. Providers can sometimes generate schemas that are not useful for the Registry; they can provide minimal value, be empty, or broken. Try to exclude them, bypassing the custom `entities` parameter to the `BaseProvider` constructor.
- Leverage existing abstractions. If you want to add a provider based on OpenAPI or Postman, you can use existing providers as a base.
- Provide as much detail as possible. Do not remove important information from the schemas. Remove only the things that aren't passing validation.
- Prefer using OpenAPI providers over Postman providers. OpenAPI Providers provide a complete picture because their specification is JSONSchema-based, while the Postman provider infers JSONSchema from examples. Moreover, Postman collections often lack response examples, so using it produces only request schemas.
